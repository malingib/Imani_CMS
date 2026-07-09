import { createContext, useContext, useState, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { useSession } from './supabase-auth';
import { useChurch } from './church-context';
import { supabase } from './supabase-auth';
import { createChurchAppDataService } from './app-data';
import { getDefaultViewForUserRole, mapSupabaseUserToAppUser } from './app-user';
import { createPersistenceService } from './persistence';
import { countUnread } from './notification-service';
import { AppView } from '../../types';
import { ROUTES } from './router';
import { User, Member, Transaction, ChurchEvent, Budget, RecurringExpense, CommunicationLog, Group, Sermon, AppNotification, AuditLog, Toast } from '../../types';
import { createToastRecord } from './view-routing';

const appDataService = createChurchAppDataService(supabase);
const persistence = createPersistenceService(supabase);

type LoadingState = 'idle' | 'auth-loading' | 'data-loading' | 'ready' | 'error';

interface AppState {
  loading: LoadingState;
  currentUser: User | null;
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  communications: CommunicationLog[];
  groups: Group[];
  sermons: Sermon[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  toasts: Toast[];
  dataError: string | null;
  viewingPlatform: boolean;
  viewingChurch: boolean;
}

interface AppActions {
  addToast: (message: string, type?: Toast['type']) => void;
  createAudit: (action: string, module: AppView, severity?: AuditLog['severity']) => Promise<void>;
  handleLogin: (u: User) => void;
  handleAddMember: (m: Member) => Promise<void>;
  handleAddMembersBulk: (items: Member[]) => Promise<void>;
  handleUpdateMember: (m: Member) => Promise<void>;
  handleDeleteMember: (id: string) => Promise<void>;
  handleRSVP: (eventId: string, isRSVPing: boolean) => Promise<void>;
  handleAddEvent: (e: ChurchEvent) => Promise<void>;
  handleUpdateEvent: (e: ChurchEvent) => Promise<void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  handleUpdateAttendance: (eventId: string, memberIds: string[]) => Promise<void>;
  handleAddTransaction: (t: Transaction) => Promise<void>;
  handleUpdateTransaction: (t: Transaction) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleSetBudget: (b: Budget) => Promise<void>;
  handleAddRecurring: (r: RecurringExpense) => Promise<void>;
  handleSendBroadcast: (log: CommunicationLog) => Promise<void>;
  handleMarkNotificationRead: (id: string) => Promise<void>;
  handleMarkAllNotificationsRead: () => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  handleSelectChurch: (id: string) => void;
  handleUpdateProfile: (m: Member) => Promise<void>;
  handleAddGroup: (g: Group) => Promise<void>;
  handleUpdateGroup: (g: Group) => Promise<void>;
  handleDeleteGroup: (id: string) => Promise<void>;
  requireChurchId: () => string;
  refreshData: () => Promise<void>;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser, isAuthenticated, isLoading: authLoading } = useSession();
  const { activeChurchId, setActiveChurchId, churches, fetchChurches } = useChurch();

  const [state, setState] = useState<AppState>({
    loading: 'auth-loading',
    currentUser: null,
    members: [],
    transactions: [],
    events: [],
    budgets: [],
    recurringExpenses: [],
    communications: [],
    groups: [],
    sermons: [],
    auditLogs: [],
    notifications: [],
    toasts: [],
    dataError: null,
    viewingPlatform: false,
    viewingChurch: false,
  });

  const churchId = activeChurchId ?? state.currentUser?.churchId ?? null;

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, createToastRecord(id, message, type)],
    }));
    setTimeout(() => {
      setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
    }, 4000);
  }, []);

  const writeAudit = useCallback(async (
    actor: User,
    action: string,
    module: AppView,
    severity: AuditLog['severity'] = 'INFO',
    scopedChurchId = churchId ?? actor.churchId,
  ) => {
    if (!scopedChurchId) {
      console.warn('Skipped audit log without church scope:', { action, module });
      return;
    }

    try {
      const saved = await appDataService.createAuditLog({
        userId: actor.id,
        userName: actor.name,
        action,
        module,
        severity,
        churchId: scopedChurchId,
      });
      setState(prev => ({ ...prev, auditLogs: [saved, ...prev.auditLogs] }));
    } catch (error) {
      console.error('Failed to create audit log:', error);
      addToast('Failed to log action', 'error');
    }
  }, [churchId, addToast]);

  const createAudit = useCallback(async (action: string, module: AppView, severity: AuditLog['severity'] = 'INFO') => {
    if (!state.currentUser) return;
    await writeAudit(state.currentUser, action, module, severity);
  }, [state.currentUser, writeAudit]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && supabaseUser) {
      const nextUser = mapSupabaseUserToAppUser(supabaseUser);
      setState(prev => ({ ...prev, currentUser: nextUser, viewingPlatform: nextUser.role === 'SUPER_ADMIN' && !activeChurchId, viewingChurch: nextUser.role === 'SUPER_ADMIN' && !!activeChurchId }));
      if (nextUser.role === 'SUPER_ADMIN') fetchChurches();
    } else if (!isAuthenticated) {
      setState(prev => ({ ...prev, currentUser: null, loading: 'ready' }));
    }
  }, [authLoading, isAuthenticated, supabaseUser, activeChurchId, fetchChurches]);

  useEffect(() => {
    if (!isAuthenticated || state.viewingPlatform) {
      setState(prev => ({ ...prev, loading: 'ready', dataError: null }));
      return;
    }
    setState(prev => ({ ...prev, loading: 'data-loading', dataError: null }));
    appDataService.loadChurchAppData(churchId)
      .then(data => {
        setState(prev => ({
          ...prev,
          ...data,
          loading: 'ready',
          dataError: null,
        }));
      })
      .catch(err => {
        setState(prev => ({ ...prev, loading: 'error', dataError: err.message }));
      });
  }, [isAuthenticated, churchId, state.viewingPlatform]);

  const handleLogin = useCallback((_u: User) => {
    addToast(`Logged in successfully as ${_u.name}`);
    void writeAudit(_u, 'Login success', 'DASHBOARD');
  }, [addToast, writeAudit]);

  const requireChurchId = useCallback(() => {
    if (!churchId) throw new Error('Select a church before making changes.');
    return churchId;
  }, [churchId]);

  const actions: AppActions = {
    addToast,
    createAudit,
    handleLogin,

    handleAddMember: async (m) => {
      const saved = await persistence.createMember(m, requireChurchId());
      setState(prev => ({ ...prev, members: [saved, ...prev.members] }));
      addToast('Member added');
      createAudit('Added member', 'MEMBERS');
    },
    handleAddMembersBulk: async (items) => {
      const saved = await persistence.createMembers(items, requireChurchId());
      setState(prev => ({ ...prev, members: [...saved, ...prev.members] }));
      addToast(`Imported ${saved.length} members`);
      createAudit(`Bulk imported ${saved.length} members`, 'MEMBERS');
    },
    handleUpdateMember: async (m) => {
      const saved = await persistence.updateMember(m, requireChurchId());
      setState(prev => ({ ...prev, members: prev.members.map(x => x.id === saved.id ? saved : x) }));
      addToast('Member updated');
      createAudit(`Updated member ${m.firstName} ${m.lastName}`, 'MEMBERS');
    },
    handleDeleteMember: async (id) => {
      await persistence.deleteMember(id, requireChurchId());
      setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
      addToast('Member removed');
      createAudit('Deleted member', 'MEMBERS');
    },
    handleRSVP: async (eventId, isRSVPing) => {
      const memberId = state.currentUser?.memberId;
      if (!memberId) { addToast('Only registered members can RSVP', 'error'); return; }
      const event = state.events.find(e => e.id === eventId);
      if (!event) { addToast('Event not found', 'error'); return; }
      const nextAttendance = isRSVPing
        ? Array.from(new Set([...event.attendance, memberId]))
        : event.attendance.filter(id => id !== memberId);
      await persistence.replaceEventAttendance(eventId, nextAttendance, requireChurchId());
      setState(prev => ({ ...prev, events: prev.events.map(e => e.id === eventId ? { ...e, attendance: nextAttendance } : e) }));
      addToast(isRSVPing ? 'RSVP saved' : 'RSVP removed');
      createAudit(`${isRSVPing ? 'RSVPd for' : 'Cancelled RSVP for'} ${eventId}`, 'EVENTS');
    },
    handleAddEvent: async (e) => {
      const saved = await persistence.createEvent(e, requireChurchId());
      setState(prev => ({ ...prev, events: [saved, ...prev.events] }));
      addToast('Event created');
      createAudit('Created event', 'EVENTS');
    },
    handleUpdateEvent: async (e) => {
      const saved = await persistence.updateEvent(e, requireChurchId());
      setState(prev => ({ ...prev, events: prev.events.map(x => x.id === saved.id ? saved : x) }));
      addToast('Event updated');
      createAudit('Updated event', 'EVENTS');
    },
    handleDeleteEvent: async (id) => {
      await persistence.deleteEvent(id, requireChurchId());
      setState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
      addToast('Event deleted');
      createAudit('Deleted event', 'EVENTS');
    },
    handleUpdateAttendance: async (eventId, memberIds) => {
      await persistence.replaceEventAttendance(eventId, memberIds, requireChurchId());
      setState(prev => ({ ...prev, events: prev.events.map(x => x.id === eventId ? { ...x, attendance: memberIds } : x) }));
      addToast('Attendance saved');
      createAudit('Updated attendance', 'EVENTS');
    },
    handleAddTransaction: async (t) => {
      const saved = await persistence.createTransaction(t, requireChurchId());
      setState(prev => ({ ...prev, transactions: [saved, ...prev.transactions] }));
      addToast('Transaction added');
      createAudit(`Added ${t.type}`, 'FINANCE');
    },
    handleUpdateTransaction: async (t) => {
      const saved = await persistence.updateTransaction(t, requireChurchId());
      setState(prev => ({ ...prev, transactions: prev.transactions.map(x => x.id === saved.id ? saved : x) }));
      addToast('Transaction updated');
      createAudit(`Updated ${t.type}`, 'FINANCE');
    },
    handleDeleteTransaction: async (id) => {
      await persistence.deleteTransaction(id, requireChurchId());
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
      addToast('Transaction removed');
      createAudit('Deleted transaction', 'FINANCE');
    },
    handleSetBudget: async (b) => {
      const exists = state.budgets.some(x => x.id === b.id);
      const saved = exists
        ? await persistence.updateBudget(b, requireChurchId())
        : await persistence.createBudget(b, requireChurchId());
      setState(prev => ({ ...prev, budgets: exists ? prev.budgets.map(x => x.id === saved.id ? saved : x) : [...prev.budgets, saved] }));
      addToast('Budget saved');
      createAudit('Updated budget', 'FINANCE');
    },
    handleAddRecurring: async (r) => {
      const saved = await persistence.createRecurringExpense(r, requireChurchId());
      setState(prev => ({ ...prev, recurringExpenses: [...prev.recurringExpenses, saved] }));
      addToast('Recurring expense created');
      createAudit('Created recurring expense', 'FINANCE');
    },
    handleAddGroup: async (g) => {
      const saved = await persistence.createGroup(g, requireChurchId());
      setState(prev => ({ ...prev, groups: [...prev.groups, saved] }));
      addToast('Group created');
      createAudit('Created group', 'GROUPS');
    },
    handleUpdateGroup: async (g) => {
      const saved = await persistence.updateGroup(g, requireChurchId());
      setState(prev => ({ ...prev, groups: prev.groups.map(x => x.id === saved.id ? saved : x) }));
      addToast('Group updated');
      createAudit('Updated group', 'GROUPS');
    },
    handleDeleteGroup: async (id) => {
      await persistence.deleteGroup(id, requireChurchId());
      setState(prev => ({ ...prev, groups: prev.groups.filter(g => g.id !== id) }));
      addToast('Group deleted');
      createAudit('Deleted group', 'GROUPS');
    },
    handleSendBroadcast: async (log) => {
      const saved = await persistence.createCommunication(log, requireChurchId());
      setState(prev => ({ ...prev, communications: [saved, ...prev.communications] }));
      addToast('Broadcast sent');
      createAudit(`Sent ${log.type} broadcast`, 'COMMUNICATION');
    },
    handleMarkNotificationRead: async (id) => {
      const saved = await persistence.updateNotificationRead(id, true, requireChurchId());
      setState(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === saved.id ? saved : n) }));
    },
    handleMarkAllNotificationsRead: async () => {
      await persistence.markAllNotificationsRead(requireChurchId());
      setState(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
    },
    handleDeleteNotification: async (id) => {
      await persistence.deleteNotification(id, requireChurchId());
      setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
    },
    handleSelectChurch: (id) => {
      setActiveChurchId(id);
      // navigate to dashboard on church switch
      window.history.replaceState(null, '', ROUTES.DASHBOARD.path);
    },
    handleUpdateProfile: async (m) => {
      const saved = await persistence.updateMember(m, requireChurchId());
      setState(prev => ({ ...prev, members: prev.members.map(x => x.id === saved.id ? saved : x) }));
      if (state.currentUser?.memberId === saved.id) {
        setState(prev => ({ ...prev, currentUser: prev.currentUser ? { ...prev.currentUser, name: `${saved.firstName} ${saved.lastName}`.trim(), avatar: saved.photo || prev.currentUser.avatar } : null }));
      }
      addToast('Profile updated');
      createAudit('Updated profile', 'MY_PORTAL');
    },
    requireChurchId,
    refreshData: async () => {
      if (state.viewingPlatform || !isAuthenticated) return;
      setState(prev => ({ ...prev, loading: 'data-loading', dataError: null }));
      const data = await appDataService.loadChurchAppData(churchId || '');
      setState(prev => ({ ...prev, ...data, loading: 'ready' }));
    },
  };

  const value: AppContextValue = { ...state, ...actions };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
