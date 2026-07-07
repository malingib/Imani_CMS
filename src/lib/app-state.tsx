import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, useSession } from './supabase-auth';
import { useChurch } from './church-context';
import {
  AppView, Member, Transaction, ChurchEvent, Budget,
  RecurringExpense, CommunicationLog, AppNotification,
  AuditLog, Group, Sermon, Toast, User, UserRole,
} from '../../types';
import { createChurchAppDataService } from './app-data';
import { mapSupabaseUserToAppUser, getDefaultViewForUserRole } from './app-user';
import { createToastRecord, normalizePlatformView } from './view-routing';
import { createPersistenceService } from './persistence';
import { countUnread } from './notification-service';

const appDataService = createChurchAppDataService(supabase);
const persistence = createPersistenceService(supabase);

export interface AppStateContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // UI state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;

  // Data loading
  dataLoading: boolean;
  dataError: string | null;

  // Data
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  communications: CommunicationLog[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  groups: Group[];
  sermons: Sermon[];

  // Handlers — Members
  handleAddMember: (member: Member) => Promise<void>;
  handleAddMembersBulk: (members: Member[]) => Promise<void>;
  handleUpdateMember: (member: Member) => Promise<void>;
  handleDeleteMember: (id: string) => Promise<void>;

  // Handlers — Transactions
  handleAddTransaction: (transaction: Transaction) => Promise<void>;
  handleUpdateTransaction: (transaction: Transaction) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;

  // Handlers — Events
  handleAddEvent: (event: ChurchEvent) => Promise<void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  handleUpdateAttendance: (eventId: string, memberIds: string[]) => Promise<void>;
  handleRSVP: (eventId: string, isRSVPing: boolean) => Promise<void>;

  // Handlers — Profile / Membership
  handleUpdateProfile: (member: Member) => Promise<void>;

  // Handlers — Finance
  handleSetBudget: (budget: Budget) => Promise<void>;
  handleAddRecurring: (expense: RecurringExpense) => Promise<void>;

  // Handlers — Communications
  handleSendBroadcast: (log: CommunicationLog) => Promise<void>;

  // Handlers — Notifications
  handleMarkNotificationRead: (id: string) => Promise<void>;
  handleMarkAllNotificationsRead: () => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;

  // Handlers — Audit
  createAudit: (action: string, module: AppView, severity?: AuditLog['severity']) => void;

  // Computed
  isSuperAdmin: boolean;
  viewingPlatform: boolean;
  viewingChurch: boolean;
  churchId: string | null;
  branches: string[];
  isLoggedIn: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};

const branches = ['Nairobi Central', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch'];

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: supabaseUser, isAuthenticated, isLoading: authLoading } = useSession();
  const { activeChurchId, setActiveChurchId, churches, fetchChurches } = useChurch();

  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, createToastRecord(id, message, type)]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const viewingPlatform = isSuperAdmin && !activeChurchId;
  const viewingChurch = isSuperAdmin && !!activeChurchId;
  const churchId = activeChurchId ?? currentUser?.churchId ?? null;
  const isLoggedIn = isAuthenticated && !!currentUser;

  const requireChurchId = useCallback(() => {
    if (!churchId) throw new Error('Select a church before making changes.');
    return churchId;
  }, [churchId]);

  const createAudit = useCallback(async (action: string, module: AppView, severity: AuditLog['severity'] = 'INFO') => {
    if (!currentUser) return;
    try {
      const savedLog = await appDataService.createAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        module,
        severity,
        churchId,
      });
      setAuditLogs(prev => [savedLog, ...prev]);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      addToast('Failed to log action', 'error');
    }
  }, [currentUser, churchId, addToast]);

  // Auth effect
  useEffect(() => {
    if (!authLoading && isAuthenticated && supabaseUser) {
      const nextUser = mapSupabaseUserToAppUser(supabaseUser);
      setCurrentUser(nextUser);
      if (nextUser.role === UserRole.SUPER_ADMIN) {
        fetchChurches();
      }
    } else if (!authLoading && !isAuthenticated) {
      setCurrentUser(null);
    }
  }, [authLoading, isAuthenticated, supabaseUser, fetchChurches]);

  // Platform view normalization
  useEffect(() => {
    const normalizedView = normalizePlatformView(viewingChurch, currentView);
    if (normalizedView !== currentView) {
      setCurrentView(normalizedView);
    }
  }, [viewingChurch, currentView]);

  // Data loading
  useEffect(() => {
    if (!isAuthenticated || viewingPlatform) {
      setDataLoading(false);
      setDataError(null);
      return;
    }
    setDataLoading(true);
    setDataError(null);

    appDataService.loadChurchAppData(churchId)
      .then(({ members: loadedMembers, transactions: loadedTransactions, events: loadedEvents, budgets: loadedBudgets, recurringExpenses: loadedRecurringExpenses, communications: loadedCommunications, notifications: loadedNotifications, auditLogs: loadedAuditLogs, groups: loadedGroups, sermons: loadedSermons }) => {
        setMembers(loadedMembers);
        setTransactions(loadedTransactions);
        setEvents(loadedEvents);
        setBudgets(loadedBudgets);
        setRecurringExpenses(loadedRecurringExpenses);
        setCommunications(loadedCommunications);
        setNotifications(loadedNotifications);
        setAuditLogs(loadedAuditLogs);
        setGroups(loadedGroups);
        setSermons(loadedSermons);
      })
      .catch((error) => {
        const message = error?.message || 'Failed to load church data.';
        setDataError(message);
        addToast(message, 'error');
      })
      .finally(() => setDataLoading(false));
  }, [isAuthenticated, churchId, viewingPlatform, addToast]);

  // Handlers — Members
  const handleAddMembersBulk = useCallback(async (importedMembers: Member[]) => {
    try {
      const saved = await persistence.createMembers(importedMembers, requireChurchId());
      setMembers(prev => [...prev, ...saved]);
      addToast(`Successfully imported ${saved.length} members`, 'success');
      createAudit(`Bulk imported ${saved.length} members`, 'MEMBERS');
    } catch (error: any) {
      addToast(error?.message || 'Failed to import members', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleAddMember = useCallback(async (member: Member) => {
    const idempotencyKey = `add-member-${member.firstName}-${member.lastName}-${member.phone}`;
    if (pendingOperations.has(idempotencyKey)) {
      addToast('Member is already being added', 'info');
      return;
    }
    setPendingOperations(prev => new Set([...prev, idempotencyKey]));
    try {
      const saved = await persistence.createMember(member, requireChurchId());
      setMembers(prev => [...prev, saved]);
      createAudit(`Added member ${saved.firstName}`, 'MEMBERS');
      addToast('Member saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to add member', 'error');
    } finally {
      setPendingOperations(prev => { const updated = new Set(prev); updated.delete(idempotencyKey); return updated; });
    }
  }, [requireChurchId, addToast, createAudit, pendingOperations]);

  const handleUpdateMember = useCallback(async (member: Member) => {
    try {
      const saved = await persistence.updateMember(member, requireChurchId());
      setMembers(prev => prev.map(p => p.id === saved.id ? saved : p));
      createAudit(`Updated member ${saved.firstName}`, 'MEMBERS');
      addToast('Member updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update member', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleDeleteMember = useCallback(async (id: string) => {
    try {
      await persistence.deleteMember(id, requireChurchId());
      setMembers(prev => prev.filter(m => m.id !== id));
      createAudit(`Deleted member ${id}`, 'MEMBERS', 'CRITICAL');
      addToast('Member deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete member', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  // Handlers — Transactions
  const handleAddTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const saved = await persistence.createTransaction(transaction, requireChurchId());
      setTransactions(prev => [saved, ...prev]);
      createAudit(`Recorded transaction ${saved.reference}`, 'FINANCE');
      addToast('Transaction saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to save transaction', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleUpdateTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const saved = await persistence.updateTransaction(transaction, requireChurchId());
      setTransactions(prev => prev.map(t => t.id === saved.id ? saved : t));
      createAudit(`Updated transaction ${saved.reference}`, 'FINANCE');
      addToast('Transaction updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update transaction', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      await persistence.deleteTransaction(id, requireChurchId());
      setTransactions(prev => prev.filter(t => t.id !== id));
      createAudit(`Deleted transaction ${id}`, 'FINANCE', 'CRITICAL');
      addToast('Transaction deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete transaction', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  // Handlers — Events
  const handleAddEvent = useCallback(async (event: ChurchEvent) => {
    try {
      const saved = await persistence.createEvent(event, requireChurchId());
      setEvents(prev => [...prev, saved]);
      createAudit(`Scheduled event ${saved.title}`, 'EVENTS');
      addToast('Event scheduled');
    } catch (error: any) {
      addToast(error?.message || 'Failed to schedule event', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    try {
      await persistence.deleteEvent(id, requireChurchId());
      setEvents(prev => prev.filter(e => e.id !== id));
      createAudit(`Deleted event ${id}`, 'EVENTS', 'WARN');
      addToast('Event deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete event', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleUpdateAttendance = useCallback(async (eventId: string, memberIds: string[]) => {
    try {
      await persistence.replaceEventAttendance(eventId, memberIds, requireChurchId());
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: memberIds } : e));
      createAudit(`Updated attendance for ${eventId}`, 'EVENTS');
      addToast('Attendance updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update attendance', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  const handleRSVP = useCallback(async (eventId: string, isRSVPing: boolean) => {
    try {
      const memberId = currentUser?.memberId;
      if (!memberId) throw new Error('Only member accounts can RSVP.');
      const event = events.find(item => item.id === eventId);
      if (!event) throw new Error('Event not found.');
      const nextAttendance = isRSVPing
        ? Array.from(new Set([...event.attendance, memberId]))
        : event.attendance.filter(id => id !== memberId);
      await persistence.replaceEventAttendance(eventId, nextAttendance, requireChurchId());
      setEvents(prev => prev.map(item => item.id === eventId ? { ...item, attendance: nextAttendance } : item));
      createAudit(`${isRSVPing ? 'RSVPd for' : 'Cancelled RSVP for'} ${eventId}`, 'EVENTS');
      addToast(isRSVPing ? 'RSVP saved' : 'RSVP removed');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update RSVP', 'error');
    }
  }, [currentUser, events, requireChurchId, addToast, createAudit]);

  // Handlers — Profile
  const handleUpdateProfile = useCallback(async (member: Member) => {
    try {
      const saved = await persistence.updateMember(member, requireChurchId());
      setMembers(prev => prev.map(item => item.id === saved.id ? saved : item));
      if (currentUser?.memberId === saved.id) {
        setCurrentUser(prev => prev ? { ...prev, name: `${saved.firstName} ${saved.lastName}`.trim(), avatar: saved.photo || prev.avatar } : prev);
      }
      createAudit('Updated profile', 'MY_PORTAL');
      addToast('Profile updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update profile', 'error');
    }
  }, [currentUser, requireChurchId, addToast, createAudit]);

  // Handlers — Finance
  const handleSetBudget = useCallback(async (budget: Budget) => {
    try {
      const saved = budget.id && budgets.some(b => b.id === budget.id)
        ? await persistence.updateBudget(budget, requireChurchId())
        : await persistence.createBudget(budget, requireChurchId());
      setBudgets(prev => {
        const exists = prev.some(b => b.id === saved.id);
        return exists ? prev.map(b => b.id === saved.id ? saved : b) : [...prev, saved];
      });
      createAudit(`Set budget for ${saved.category}`, 'FINANCE');
      addToast('Budget saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to save budget', 'error');
    }
  }, [budgets, requireChurchId, addToast, createAudit]);

  const handleAddRecurring = useCallback(async (expense: RecurringExpense) => {
    try {
      const saved = await persistence.createRecurringExpense(expense, requireChurchId());
      setRecurringExpenses(prev => [...prev, saved]);
      createAudit(`Added recurring expense ${saved.category}`, 'FINANCE');
      addToast('Recurring expense saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to save recurring expense', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  // Handlers — Communication
  const handleSendBroadcast = useCallback(async (log: CommunicationLog) => {
    try {
      const saved = await persistence.createCommunication(log, requireChurchId());
      setCommunications(prev => [saved, ...prev]);
      createAudit(`Sent ${saved.type} broadcast to ${saved.targetGroupName}`, 'COMMUNICATION');
      addToast('Broadcast saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to send broadcast', 'error');
    }
  }, [requireChurchId, addToast, createAudit]);

  // Handlers — Notifications
  const handleMarkNotificationRead = useCallback(async (id: string) => {
    try {
      const saved = await persistence.updateNotificationRead(id, true, requireChurchId());
      setNotifications(prev => prev.map(n => n.id === saved.id ? saved : n));
    } catch {}
  }, [requireChurchId]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await persistence.markAllNotificationsRead(requireChurchId());
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }, [requireChurchId]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await persistence.deleteNotification(id, requireChurchId());
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  }, [requireChurchId]);

  // Login / Logout
  const handleLogin = useCallback((user: User) => {
    const userWithBranch = { ...user, branch: user.branch || branches[0] };
    setCurrentUser(userWithBranch);
    setCurrentView(getDefaultViewForUserRole(user.role));
    addToast(`Logged in successfully as ${user.name}`);
    createAudit('Login success', 'DASHBOARD');
  }, [addToast, createAudit]);

  const handleLogout = useCallback(async () => {
    createAudit('Logout', 'DASHBOARD');
    await supabase.auth.signOut();
    setCurrentUser(null);
    addToast('Logged out successfully', 'info');
  }, [addToast, createAudit]);

  const handleSelectChurch = useCallback((id: string) => {
    setActiveChurchId(id);
    setCurrentView('DASHBOARD');
  }, [setActiveChurchId]);

  const value: AppStateContextType = {
    currentUser,
    isAuthenticated,
    authLoading,
    currentView,
    setCurrentView,
    isSidebarOpen,
    setIsSidebarOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    toasts,
    addToast,
    dismissToast,
    dataLoading,
    dataError,
    members,
    transactions,
    events,
    budgets,
    recurringExpenses,
    communications,
    notifications,
    auditLogs,
    groups,
    sermons,
    handleAddMember,
    handleAddMembersBulk,
    handleUpdateMember,
    handleDeleteMember,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleAddEvent,
    handleDeleteEvent,
    handleUpdateAttendance,
    handleRSVP,
    handleUpdateProfile,
    handleSetBudget,
    handleAddRecurring,
    handleSendBroadcast,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleDeleteNotification,
    createAudit,
    isSuperAdmin,
    viewingPlatform,
    viewingChurch,
    churchId,
    branches,
    isLoggedIn,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};
