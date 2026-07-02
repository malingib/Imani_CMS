import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { ImaniLogoIcon } from './Sidebar';
import Dashboard from './Dashboard';
import Membership from './Membership';
import SermonHistory from './SermonHistory';
import EventsManagement from './EventsManagement';
import FinanceReporting from './FinanceReporting';
import CommunicationCenter from './CommunicationCenter';
import DemographicsAnalysis from './DemographicsAnalysis';
import GroupsManagement from './GroupsManagement';
import ReportsCenter from './ReportsCenter';
import Settings from './Settings';
import Login from './Login';
import PrivacyPolicy from './PrivacyPolicy';
import CompliancePortal from './CompliancePortal';
import SecurityOverview from './SecurityOverview';
import NotificationsPanel from './NotificationsPanel';
import MemberPortal from './MemberPortal';
import MyGiving from './MyGiving';
import AuditLogs from './AuditLogs';
import Billing from './Billing';
import PlatformDashboard from './PlatformDashboard';
import TenantsList from './TenantsList';
import PlatformSettings from './PlatformSettings';
import BillingOverview from './BillingOverview';
import InvitationsManager from './InvitationsManager';
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast, AuditLog
} from '../types';
import { Bell, Menu, X, Loader2 } from 'lucide-react';
import { supabase, useSession } from '../src/lib/supabase-auth';
import { ChurchProvider, useChurch } from '../src/lib/church-context';
import { mapMember, mapTransaction, mapEvent, mapAuditLog } from '../src/lib/mappers';
import {
  createEvent,
  createMember,
  createMembers,
  createTransaction,
  deleteEvent,
  deleteMember,
  deleteTransaction,
  replaceEventAttendance,
  updateMember,
  updateTransaction,
} from '../src/lib/persistence';

const AppContent: React.FC = () => {
  const { user: supabaseUser, isAuthenticated, isLoading: authLoading } = useSession();
  const { activeChurchId, setActiveChurchId, churches, fetchChurches } = useChurch();
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const [branches] = useState(['Nairobi Central', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch']);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  };

  const requireChurchId = () => {
    if (!churchId) throw new Error('Select a church before making changes.');
    return churchId;
  };

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const viewingPlatform = isSuperAdmin && !activeChurchId;
  const viewingChurch = isSuperAdmin && !!activeChurchId;
  const churchId = activeChurchId || (currentUser?.churchId as string) || null;

  useEffect(() => {
    if (viewingChurch) {
      if (currentView === 'PLATFORM_DASHBOARD' || currentView === 'TENANTS' || currentView === 'INVITATIONS' || currentView === 'BILLING' || currentView === 'PLATFORM_SETTINGS') {
        setCurrentView('DASHBOARD');
      }
    }
  }, [viewingChurch, currentView]);

  const createAudit = useCallback(async (action: string, module: AppView, severity: AuditLog['severity'] = 'INFO') => {
    if (!currentUser) return;
    const log: AuditLog = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, action, module, timestamp: new Date().toISOString(), severity };
    setAuditLogs(prev => [log, ...prev]);
    try {
      await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        user_name: currentUser.name,
        action,
        module,
        severity,
        church_id: churchId,
      }]);
    } catch {}
  }, [currentUser, churchId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && supabaseUser) {
      const meta = supabaseUser.user_metadata || {};
      const appMeta = supabaseUser.app_metadata || {};
      const role = (meta.role as UserRole) || (appMeta.role as UserRole) || UserRole.ADMIN;
      setCurrentUser({
        id: supabaseUser.id,
        name: (meta.name as string) || supabaseUser.email?.split('@')[0] || 'User',
        role,
        avatar: (meta.avatar_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent((meta.name as string) || 'U')}&background=6366f1&color=fff`,
        churchId: appMeta.church_id as string || undefined,
      });
      if (role === UserRole.SUPER_ADMIN) {
        fetchChurches();
      }
    } else if (!authLoading && !isAuthenticated) {
      setCurrentUser(null);
    }
  }, [authLoading, isAuthenticated, supabaseUser, fetchChurches]);

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);

  useEffect(() => {
    if (!isAuthenticated || viewingPlatform) {
      setDataLoading(false);
      setDataError(null);
      return;
    }
    setDataLoading(true);
    setDataError(null);

    const baseQuery = (table: string, select = '*') => {
      let q = supabase.from(table).select(select);
      if (churchId) q = q.eq('church_id', churchId);
      return q;
    };

    const fMembers = baseQuery('members', '*').then(({ data, error }) => {
      if (error) throw error;
      return data ? data.map(mapMember) : [];
    });
    const fTransactions = baseQuery('transactions', '*').then(({ data, error }) => {
      if (error) throw error;
      return data ? data.map(mapTransaction) : [];
    });
    const fEvents = baseQuery('church_events', '*').then(({ data, error }) => {
      if (error) throw error;
      return data ? data.map(mapEvent) : [];
    });
    const fAttendance = baseQuery('event_attendance', 'event_id, member_id').then(({ data, error }) => {
      if (error) throw error;
      return data || [];
    });
    const fAuditLogs = baseQuery('audit_logs', '*').then(({ data, error }) => {
      if (error) throw error;
      return data ? data.map(mapAuditLog) : [];
    });

    Promise.all([fMembers, fTransactions, fEvents, fAttendance, fAuditLogs])
      .then(([m, t, e, attendanceRows, a]) => {
        const attendanceByEvent = new Map<string, string[]>();
        attendanceRows.forEach((row: any) => {
          const eventAttendance = attendanceByEvent.get(row.event_id) || [];
          eventAttendance.push(row.member_id);
          attendanceByEvent.set(row.event_id, eventAttendance);
        });
        setMembers(m);
        setTransactions(t);
        setEvents(e.map(event => ({ ...event, attendance: attendanceByEvent.get(event.id) || [] })));
        setAuditLogs(a);
      })
      .catch((error) => {
        const message = error?.message || 'Failed to load church data.';
        setDataError(message);
        addToast(message, 'error');
      })
      .finally(() => setDataLoading(false));
  }, [isAuthenticated, churchId, viewingPlatform]);

  const handleLogin = (user: User) => {
    const userWithBranch = { ...user, branch: user.branch || branches[0] };
    setCurrentUser(userWithBranch);
    setCurrentView(user.role === UserRole.MEMBER ? 'MY_PORTAL' : (user.role === UserRole.SUPER_ADMIN ? 'PLATFORM_DASHBOARD' : 'DASHBOARD'));
    addToast(`Logged in successfully as ${user.name}`);
    createAudit('Login success', 'DASHBOARD');
  };

  const handleLogout = async () => {
    createAudit('Logout', 'DASHBOARD');
    await supabase.auth.signOut();
    setCurrentUser(null);
    addToast("Logged out successfully", "info");
  };

  const handleAddMembersBulk = async (importedMembers: Member[]) => {
    try {
      const saved = await createMembers(importedMembers, requireChurchId());
      setMembers(prev => [...prev, ...saved]);
      addToast(`Successfully imported ${saved.length} members`, 'success');
      createAudit(`Bulk imported ${saved.length} members`, 'MEMBERS');
    } catch (error: any) {
      addToast(error?.message || 'Failed to import members', 'error');
    }
  };

  const handleAddMember = async (member: Member) => {
    try {
      const saved = await createMember(member, requireChurchId());
      setMembers(prev => [...prev, saved]);
      createAudit(`Added member ${saved.firstName}`, 'MEMBERS');
      addToast('Member saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to add member', 'error');
    }
  };

  const handleUpdateMember = async (member: Member) => {
    try {
      const saved = await updateMember(member, requireChurchId());
      setMembers(prev => prev.map(p => p.id === saved.id ? saved : p));
      createAudit(`Updated member ${saved.firstName}`, 'MEMBERS');
      addToast('Member updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update member', 'error');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMember(id, requireChurchId());
      setMembers(prev => prev.filter(m => m.id !== id));
      createAudit(`Deleted member ${id}`, 'MEMBERS', 'CRITICAL');
      addToast('Member deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete member', 'error');
    }
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      const saved = await createTransaction(transaction, requireChurchId());
      setTransactions(prev => [saved, ...prev]);
      createAudit(`Recorded transaction ${saved.reference}`, 'FINANCE');
      addToast('Transaction saved');
    } catch (error: any) {
      addToast(error?.message || 'Failed to save transaction', 'error');
    }
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      const saved = await updateTransaction(transaction, requireChurchId());
      setTransactions(prev => prev.map(t => t.id === saved.id ? saved : t));
      createAudit(`Updated transaction ${saved.reference}`, 'FINANCE');
      addToast('Transaction updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update transaction', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id, requireChurchId());
      setTransactions(prev => prev.filter(t => t.id !== id));
      createAudit(`Deleted transaction ${id}`, 'FINANCE', 'CRITICAL');
      addToast('Transaction deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete transaction', 'error');
    }
  };

  const handleAddEvent = async (event: ChurchEvent) => {
    try {
      const saved = await createEvent(event, requireChurchId());
      setEvents(prev => [...prev, saved]);
      createAudit(`Scheduled event ${saved.title}`, 'EVENTS');
      addToast('Event scheduled');
    } catch (error: any) {
      addToast(error?.message || 'Failed to schedule event', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id, requireChurchId());
      setEvents(prev => prev.filter(e => e.id !== id));
      createAudit(`Deleted event ${id}`, 'EVENTS', 'WARN');
      addToast('Event deleted', 'info');
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete event', 'error');
    }
  };

  const handleUpdateAttendance = async (eventId: string, memberIds: string[]) => {
    try {
      await replaceEventAttendance(eventId, memberIds, requireChurchId());
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: memberIds } : e));
      createAudit(`Updated attendance for ${eventId}`, 'EVENTS');
      addToast('Attendance updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update attendance', 'error');
    }
  };

  const handleRSVP = async (eventId: string, isRSVPing: boolean) => {
    try {
      const memberId = currentUser?.memberId;
      if (!memberId) throw new Error('Only member accounts can RSVP.');
      const event = events.find(item => item.id === eventId);
      if (!event) throw new Error('Event not found.');
      const nextAttendance = isRSVPing
        ? Array.from(new Set([...event.attendance, memberId]))
        : event.attendance.filter(id => id !== memberId);
      await replaceEventAttendance(eventId, nextAttendance, requireChurchId());
      setEvents(prev => prev.map(item => item.id === eventId ? { ...item, attendance: nextAttendance } : item));
      createAudit(`${isRSVPing ? 'RSVPd for' : 'Cancelled RSVP for'} ${eventId}`, 'EVENTS');
      addToast(isRSVPing ? 'RSVP saved' : 'RSVP removed');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update RSVP', 'error');
    }
  };

  const handleUpdateProfile = async (member: Member) => {
    try {
      const saved = await updateMember(member, requireChurchId());
      setMembers(prev => prev.map(item => item.id === saved.id ? saved : item));
      if (currentUser?.memberId === saved.id) {
        setCurrentUser(prev => prev ? { ...prev, name: `${saved.firstName} ${saved.lastName}`.trim(), avatar: saved.photo || prev.avatar } : prev);
      }
      createAudit('Updated profile', 'MY_PORTAL');
      addToast('Profile updated');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update profile', 'error');
    }
  };

  const handleSelectChurch = (id: string) => {
    setActiveChurchId(id);
    setCurrentView('DASHBOARD');
  };

  const renderView = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'COMPLIANCE') return <CompliancePortal onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'SECURITY') return <SecurityOverview onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;

    if (!isLoggedIn || !currentUser) return null;

    if (isSuperAdmin && viewingPlatform) {
      switch (currentView) {
        case 'PLATFORM_DASHBOARD': return <PlatformDashboard />;
        case 'TENANTS': return <TenantsList onNavigate={setCurrentView} onSelectChurch={handleSelectChurch} />;
        case 'INVITATIONS': return <InvitationsManager />;
        case 'BILLING': return <BillingOverview />;
        case 'PLATFORM_SETTINGS': return <PlatformSettings />;
        default: return <PlatformDashboard />;
      }
    }

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} />;
      case 'MY_PORTAL':
        return <MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} activities={[]} onNavigate={setCurrentView} onUpdateProfile={handleUpdateProfile} onRSVP={handleRSVP} />;
      case 'MY_GIVING':
        return <MyGiving member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} onGive={() => { addToast('STK Push Sent'); createAudit('Initiated Giving STK', 'MY_GIVING'); }} />;
      case 'MEMBERS':
        return (
          <Membership 
            members={members} 
            onAddMember={handleAddMember} 
            onAddMembersBulk={handleAddMembersBulk}
            onUpdateMember={handleUpdateMember} 
            onDeleteMember={handleDeleteMember} 
            transactions={transactions} 
            events={events} 
            currentUserRole={currentUser.role} 
          />
        );
      case 'FINANCE':
        return <FinanceReporting transactions={transactions} members={members} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction} budgets={[]} onSetBudget={() => {}} recurringExpenses={[]} onAddRecurring={() => {}} currentUserRole={currentUser.role} />;
      case 'COMMUNICATION':
        return <CommunicationCenter members={members} logs={[]} onSendBroadcast={(log) => { addToast('Broadcast sent'); createAudit(`Sent ${log.type} broadcast to ${log.targetGroupName}`, 'COMMUNICATION'); }} currentUser={currentUser} />;
      case 'GROUPS':
        return <GroupsManagement members={members} />;
      case 'EVENTS':
        return <EventsManagement events={events} members={members} currentUser={currentUser} onRSVP={handleRSVP} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onUpdateAttendance={handleUpdateAttendance} />;
      case 'ANALYTICS':
        return <DemographicsAnalysis members={members} />;
      case 'REPORTS':
        return <ReportsCenter transactions={transactions} members={members} events={events} />;
      case 'AUDIT_LOGS':
        return <AuditLogs logs={auditLogs} />;
      case 'BILLING':
        return <Billing />;
      case 'SETTINGS':
        return <Settings currentUserRole={currentUser.role} />;
      default:
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} onNavigate={setCurrentView} />;
    }
  };

  const isLoggedIn = isAuthenticated && !!currentUser;

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-brand-primary mx-auto" size={40} />
          <p className="text-slate-400 font-bold text-sm">Loading Imani CMS...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    if (['PRIVACY', 'COMPLIANCE', 'SECURITY'].includes(currentView)) return renderView();
    return <Login onLogin={handleLogin} onNavigateLegal={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2 pointer-events-none w-full max-w-[90%] sm:max-w-md">
        {toasts.map(toast => (
          <div key={toast.id} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-auto border ${
            toast.type === 'success' ? 'bg-brand-primary border-slate-700 text-white' : 
            toast.type === 'error' ? 'bg-brand-gold border-brand-gold text-white' : 
            'bg-brand-indigo border-brand-indigo text-white'
          }`}>
            <span className="font-bold text-sm tracking-tight flex-1">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16}/></button>
          </div>
        ))}
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} currentUser={currentUser} branches={branches} onBranchChange={() => {}} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} churches={churches} activeChurchId={activeChurchId} onChurchSwitch={(id) => { setActiveChurchId(id); if (!id) setCurrentView('PLATFORM_DASHBOARD'); }} />
      
      <main className="flex-1 min-h-screen lg:ml-64 transition-all">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu size={22} /></button>
            <div className="lg:hidden w-10 h-10"><ImaniLogoIcon /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate hidden sm:block">
              Imani Enterprise {churchId ? '• Viewing Church' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4 relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50'}`}>
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white animate-pulse" />
            </button>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} onDelete={() => {}} />}
            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-primary/10" />
            </div>
          </div>
        </header>
        <div className="p-10 max-w-[1600px] mx-auto pb-20">{renderView()}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { user: supabaseUser, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-brand-primary mx-auto" size={40} />
          <p className="text-slate-400 font-bold text-sm">Loading Imani CMS...</p>
        </div>
      </div>
    );
  }

  const appMeta = supabaseUser?.app_metadata || {};
  const churchId = (appMeta.church_id as string) || null;

  return (
    <ChurchProvider churchId={churchId}>
      <AppContent />
    </ChurchProvider>
  );
};

export default App;
