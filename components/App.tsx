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
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast, AuditLog
} from '../types';
import { Bell, Menu, X, Loader2 } from 'lucide-react';
import { supabase, useSession } from '../src/lib/supabase-auth';
import { ChurchProvider, useChurch } from '../src/lib/church-context';

const AppContent: React.FC = () => {
  const { user: supabaseUser, isAuthenticated, isLoading: authLoading } = useSession();
  const { activeChurchId, setActiveChurchId, churches, fetchChurches } = useChurch();
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [branches] = useState(['Nairobi Central', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch']);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  };

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const viewingPlatform = isSuperAdmin && !activeChurchId;
  const viewingChurch = isSuperAdmin && !!activeChurchId;
  const churchId = activeChurchId || (currentUser?.churchId as string) || null;

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
      if (!isAuthenticated) setDataLoading(false);
      return;
    }
    setDataLoading(true);

    const queryChurch = churchId;
    const baseQuery = <T extends any[]>(table: string, select = '*') => {
      let q = supabase.from(table).select(select);
      if (queryChurch) q = q.eq('church_id', queryChurch);
      return q;
    };

    const fetchMembers = baseQuery('members', '*').then(({ data, error }) => {
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          firstName: r.first_name,
          lastName: r.last_name,
          phone: r.phone || '',
          email: r.email || '',
          location: r.location || '',
          groups: r.groups || [],
          status: r.status as MemberStatus || MemberStatus.ACTIVE,
          joinDate: r.join_date || '',
          gender: r.gender || undefined,
          maritalStatus: r.marital_status as MaritalStatus || undefined,
          membershipType: r.membership_type as MembershipType || undefined,
          age: r.age || undefined,
          photo: r.photo || undefined,
          stewardshipScore: r.stewardship_score || undefined,
        }));
      }
      return [];
    });

    const fetchTransactions = baseQuery('transactions', '*').then(({ data, error }) => {
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          memberId: r.member_id || undefined,
          memberName: r.member_name || '',
          amount: r.amount,
          type: r.type,
          paymentMethod: r.payment_method,
          date: r.date,
          reference: r.reference,
          category: r.category,
          notes: r.notes || undefined,
          phoneNumber: r.phone_number || undefined,
          source: r.source || 'MANUAL',
        }));
      }
      return [];
    });

    const fetchEvents = baseQuery('church_events', '*').then(({ data, error }) => {
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          date: r.date,
          time: r.time,
          location: r.location,
          type: r.type,
          coordinator: r.coordinator || undefined,
          attendance: r.attendance || [],
          contactPerson: r.contact_person || undefined,
          rsvpDeadline: r.rsvp_deadline || undefined,
        }));
      }
      return [];
    });

    const fetchAuditLogs = baseQuery('audit_logs', '*').then(({ data, error }) => {
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          action: r.action,
          module: r.module as AppView,
          timestamp: r.timestamp || new Date().toISOString(),
          severity: r.severity as AuditLog['severity'] || 'INFO',
        }));
      }
      return [];
    });

    Promise.all([fetchMembers, fetchTransactions, fetchEvents, fetchAuditLogs])
      .then(([m, t, e, a]) => {
        setMembers(m as Member[]);
        setTransactions(t as Transaction[]);
        setEvents(e as ChurchEvent[]);
        setAuditLogs(a as AuditLog[]);
        setDataLoading(false);
      });
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
    setMembers(prev => [...prev, ...importedMembers]);
    addToast(`Successfully imported ${importedMembers.length} members`, 'success');
    createAudit(`Bulk imported ${importedMembers.length} members`, 'MEMBERS');
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
        case 'INVITATIONS': return <div className="p-10 text-center text-slate-400 font-bold"><p>Invitations management coming soon</p></div>;
        case 'BILLING': return <BillingOverview />;
        case 'PLATFORM_SETTINGS': return <PlatformSettings />;
        default: return <PlatformDashboard />;
      }
    }

    if (viewingChurch) {
      setCurrentView('DASHBOARD');
    }

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} />;
      case 'MY_PORTAL':
        return <MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} activities={[]} onNavigate={setCurrentView} onUpdateProfile={(m) => { setMembers(prev => prev.map(p => p.id === m.id ? m : p)); addToast('Profile updated'); createAudit('Updated profile', 'MY_PORTAL'); }} onRSVP={() => {}} />;
      case 'MY_GIVING':
        return <MyGiving member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} onGive={() => { addToast('STK Push Sent'); createAudit('Initiated Giving STK', 'MY_GIVING'); }} />;
      case 'MEMBERS':
        return (
          <Membership 
            members={members} 
            onAddMember={(m) => { setMembers(prev => [...prev, m]); createAudit(`Added member ${m.firstName}`, 'MEMBERS'); }} 
            onAddMembersBulk={handleAddMembersBulk}
            onUpdateMember={(m) => { setMembers(prev => prev.map(p => p.id === m.id ? m : p)); createAudit(`Updated member ${m.firstName}`, 'MEMBERS'); }} 
            onDeleteMember={(id) => { setMembers(prev => prev.filter(m => m.id !== id)); createAudit(`Deleted member ${id}`, 'MEMBERS', 'CRITICAL'); }} 
            transactions={transactions} 
            events={events} 
            currentUserRole={currentUser.role} 
          />
        );
      case 'FINANCE':
        return <FinanceReporting transactions={transactions} members={members} onAddTransaction={(t) => { setTransactions(prev => [t, ...prev]); createAudit(`Recorded transaction ${t.reference}`, 'FINANCE'); }} onUpdateTransaction={() => {}} onDeleteTransaction={() => {}} budgets={[]} onSetBudget={() => {}} recurringExpenses={[]} onAddRecurring={() => {}} currentUserRole={currentUser.role} />;
      case 'COMMUNICATION':
        return <CommunicationCenter members={members} logs={[]} onSendBroadcast={(log) => { addToast('Broadcast sent'); createAudit(`Sent ${log.type} broadcast to ${log.targetGroupName}`, 'COMMUNICATION'); }} currentUser={currentUser} />;
      case 'GROUPS':
        return <GroupsManagement members={members} />;
      case 'EVENTS':
        return <EventsManagement events={events} members={members} currentUser={currentUser} onRSVP={() => {}} onAddEvent={(e) => { setEvents(prev => [...prev, e]); createAudit(`Scheduled event ${e.title}`, 'EVENTS'); }} onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} onUpdateAttendance={(id, ids) => setEvents(prev => prev.map(e => e.id === id ? {...e, attendance: ids} : e))} />;
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
      <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} currentUser={currentUser} branches={branches} onBranchChange={() => {}} onRoleSwitch={(r) => { setCurrentUser({...currentUser, role: r}); addToast(`Role: ${r}`, "info"); createAudit(`Simulated role switch to ${r}`, 'SETTINGS'); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} churches={churches} activeChurchId={activeChurchId} onChurchSwitch={(id) => { setActiveChurchId(id); if (!id) setCurrentView('PLATFORM_DASHBOARD'); }} />
      
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
