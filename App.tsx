
import React, { useState, useEffect } from 'react';
import Sidebar, { ImaniLogoIcon } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Membership from './components/Membership';
import SermonHistory from './components/SermonHistory';
import EventsManagement from './components/EventsManagement';
import FinanceReporting from './components/FinanceReporting';
import CommunicationCenter from './components/CommunicationCenter';
import DemographicsAnalysis from './components/DemographicsAnalysis';
import GroupsManagement from './components/GroupsManagement';
import ReportsCenter from './components/ReportsCenter';
import Settings from './components/Settings';
import Login from './components/Login';
import PrivacyPolicy from './components/PrivacyPolicy';
import CompliancePortal from './components/CompliancePortal';
import SecurityOverview from './components/SecurityOverview';
import NotificationsPanel from './components/NotificationsPanel';
import MemberPortal from './components/MemberPortal';
import MyGiving from './components/MyGiving';
import AuditLogs from './components/AuditLogs';
import Billing from './components/Billing';
import SystemOwnerDashboard from './components/SystemOwnerDashboard';
import TenantRegistry from './components/TenantRegistry';
import PlatformSupport from './components/PlatformSupport';
import PlatformFinance from './components/PlatformFinance';
import InfrastructureNodes from './components/InfrastructureNodes';
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast, AuditLog, Tenant
} from './types';
import { Bell, Menu, X, ShieldAlert, ArrowLeftCircle, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const branches = ['Nairobi Central', 'Mombasa Branch', 'Kisumu Outreach', 'Nakuru Parish'];

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', userId: 'u1', userName: 'Pastor John', action: 'Login successful', module: 'DASHBOARD', timestamp: new Date().toISOString(), severity: 'INFO' }
  ]);

  const [notifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'M-Pesa Transaction', message: 'New Tithe received from Mary Wambui: KES 12,000.', time: '2 mins ago', type: 'MPESA', read: false }
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: '1', firstName: 'David', lastName: 'Ochieng', phone: '0712345678', email: 'david@example.com', location: 'Nairobi West', groups: ['Youth Fellowship', 'Media & Tech'], status: MemberStatus.ACTIVE, joinDate: '2023-01-15', maritalStatus: MaritalStatus.SINGLE, membershipType: MembershipType.FULL, age: 24, gender: 'Male' },
    { id: '2', firstName: 'Mary', lastName: 'Wambui', phone: '0722111222', email: 'mary@example.com', location: 'Kileleshwa', groups: ['Women of Grace'], status: MemberStatus.ACTIVE, joinDate: '2022-11-20', maritalStatus: MaritalStatus.MARRIED, membershipType: MembershipType.FULL, age: 38, gender: 'Female' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'trx1', memberId: '1', memberName: 'David Ochieng', amount: 5000, type: 'Tithe', paymentMethod: 'M-Pesa', date: '2024-05-19', reference: 'QSG812L90P', category: 'Income', source: 'INTEGRATED' },
  ]);

  const [events, setEvents] = useState<ChurchEvent[]>([
    { id: 'ev1', title: 'Sunday Worship Service', description: 'Main service of worship.', date: '2024-05-26', time: '09:00 AM', location: 'Main Sanctuary', type: 'WORSHIP', attendance: ['1', '2'] },
  ]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  };

  const createAudit = (action: string, module: AppView, severity: AuditLog['severity'] = 'INFO') => {
    if (!currentUser) return;
    const log: AuditLog = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, action, module, timestamp: new Date().toISOString(), severity };
    setAuditLogs(prev => [log, ...prev]);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('imani_user');
    const impersonated = localStorage.getItem('imani_proxy_origin');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
        if (impersonated) setOriginalUser(JSON.parse(impersonated));
        
        if (parsedUser.role === UserRole.MEMBER) setCurrentView('MY_PORTAL');
        else if (parsedUser.role === UserRole.SYSTEM_OWNER) setCurrentView('OWNER_DASHBOARD');
      } catch (e) {
        console.error("Session restore failed", e);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    const userWithBranch = { ...user, branch: user.branch || branches[0] };
    setCurrentUser(userWithBranch);
    setIsLoggedIn(true);
    localStorage.setItem('imani_user', JSON.stringify(userWithBranch));
    
    if (user.role === UserRole.MEMBER) setCurrentView('MY_PORTAL');
    else if (user.role === UserRole.SYSTEM_OWNER) setCurrentView('OWNER_DASHBOARD');
    else setCurrentView('DASHBOARD');

    addToast(`Logged in successfully as ${user.name}`);
    createAudit('Login success', 'DASHBOARD');
  };

  const handleImpersonate = (tenant: Tenant) => {
    if (!currentUser || currentUser.role !== UserRole.SYSTEM_OWNER) return;
    setOriginalUser(currentUser);
    localStorage.setItem('imani_proxy_origin', JSON.stringify(currentUser));
    const proxyUser: User = {
      id: `proxy-${tenant.id}`,
      name: `${tenant.name} Admin`,
      role: UserRole.ADMIN,
      avatar: 'https://i.pravatar.cc/100?img=12',
      branch: tenant.name
    };
    setCurrentUser(proxyUser);
    localStorage.setItem('imani_user', JSON.stringify(proxyUser));
    setCurrentView('DASHBOARD');
    addToast(`Entering Proxy Session: ${tenant.name}`, 'info');
  };

  const handleExitProxy = () => {
    if (!originalUser) return;
    setCurrentUser(originalUser);
    localStorage.setItem('imani_user', JSON.stringify(originalUser));
    localStorage.removeItem('imani_proxy_origin');
    setOriginalUser(null);
    setCurrentView('OWNER_DASHBOARD');
    addToast('Returned to Global Command', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setOriginalUser(null);
    localStorage.removeItem('imani_user');
    localStorage.removeItem('imani_proxy_origin');
    addToast("Logged out successfully", "info");
  };

  const handleRSVP = (eventId: string, isRSVPing: boolean) => {
    if (!currentUser || !currentUser.memberId) {
      addToast("Only registered members can RSVP", "error");
      return;
    }
    const mId = currentUser.memberId;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: isRSVPing ? [...new Set([...e.attendance, mId])] : e.attendance.filter(id => id !== mId) } : e));
    addToast(isRSVPing ? "RSVP confirmed!" : "RSVP cancelled.", "info");
  };

  const renderView = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy onBack={() => isLoggedIn ? (currentUser?.role === UserRole.SYSTEM_OWNER ? setCurrentView('OWNER_DASHBOARD') : setCurrentView('SETTINGS')) : setCurrentView('DASHBOARD')} />;
    if (currentView === 'COMPLIANCE') return <CompliancePortal onBack={() => isLoggedIn ? (currentUser?.role === UserRole.SYSTEM_OWNER ? setCurrentView('OWNER_DASHBOARD') : setCurrentView('SETTINGS')) : setCurrentView('DASHBOARD')} />;
    if (currentView === 'SECURITY') return <SecurityOverview onBack={() => isLoggedIn ? (currentUser?.role === UserRole.SYSTEM_OWNER ? setCurrentView('OWNER_DASHBOARD') : setCurrentView('SETTINGS')) : setCurrentView('DASHBOARD')} />;

    if (!isLoggedIn || !currentUser) return null;

    if (currentUser.role === UserRole.SYSTEM_OWNER) {
      switch (currentView) {
        case 'OWNER_DASHBOARD': return <SystemOwnerDashboard />;
        case 'PARISH_REGISTRY': return <TenantRegistry onImpersonate={handleImpersonate} />;
        case 'PLATFORM_SUPPORT': return <PlatformSupport />;
        case 'FINANCE': return <PlatformFinance />;
        case 'INFRASTRUCTURE': return <InfrastructureNodes />;
        case 'AUDIT_LOGS': return <AuditLogs logs={auditLogs} />;
        case 'SETTINGS': return <Settings currentUserRole={currentUser.role} />;
        default: return <SystemOwnerDashboard />;
      }
    }

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} />;
      case 'MY_PORTAL': return <MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} activities={[]} onNavigate={setCurrentView} onRSVP={handleRSVP} onUpdateProfile={(m) => { setMembers(prev => prev.map(p => p.id === m.id ? m : p)); addToast('Profile updated'); }} />;
      case 'MY_GIVING': return <MyGiving member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} onGive={() => addToast('STK Push Sent')} />;
      case 'MEMBERS': return <Membership members={members} onAddMember={(m) => setMembers(prev => [...prev, m])} onAddMembersBulk={(ms) => setMembers(prev => [...prev, ...ms])} onUpdateMember={(m) => setMembers(prev => prev.map(p => p.id === m.id ? m : p))} onDeleteMember={(id) => setMembers(prev => prev.filter(m => m.id !== id))} transactions={transactions} events={events} currentUserRole={currentUser.role} />;
      case 'FINANCE': return <FinanceReporting transactions={transactions} members={members} onAddTransaction={(t) => setTransactions(prev => [t, ...prev])} onUpdateTransaction={(t) => setTransactions(prev => prev.map(tr => tr.id === t.id ? t : tr))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(tr => tr.id !== id))} budgets={[]} onSetBudget={() => {}} recurringExpenses={[]} onAddRecurringExpense={() => {}} recurringContributions={[]} onAddRecurringContribution={() => {}} currentUserRole={currentUser.role} />;
      case 'COMMUNICATION': return <CommunicationCenter members={members} logs={[]} onSendBroadcast={() => addToast('Broadcast sent')} currentUser={currentUser} />;
      case 'GROUPS': return <GroupsManagement members={members} />;
      case 'EVENTS': return <EventsManagement events={events} members={members} currentUser={currentUser} onRSVP={handleRSVP} onAddEvent={(e) => setEvents(prev => [...prev, e])} onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} onUpdateAttendance={(id, ids) => setEvents(prev => prev.map(e => e.id === id ? {...e, attendance: ids} : e))} />;
      case 'ANALYTICS': return <DemographicsAnalysis members={members} />;
      case 'REPORTS': return <ReportsCenter transactions={transactions} members={members} events={events} />;
      case 'AUDIT_LOGS': return <AuditLogs logs={auditLogs} />;
      case 'BILLING': return <Billing />;
      case 'SETTINGS': return <Settings currentUserRole={currentUser.role} />;
      case 'SERMONS': return <SermonHistory events={events} />;
      default: return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} onNavigateLegal={setCurrentView} />
      ) : (
        <>
          {originalUser && (
            <div className="fixed top-0 left-0 right-0 h-12 bg-rose-600 text-white z-[100] flex items-center justify-between px-6 animate-in slide-in-from-top duration-300">
               <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="animate-pulse"/>
                  <p className="text-xs font-black uppercase tracking-widest">System Proxy: <span className="text-brand-gold">{currentUser?.branch}</span></p>
               </div>
               <button onClick={handleExitProxy} className="flex items-center gap-2 px-4 py-1.5 bg-white text-rose-600 rounded-full text-[10px] font-black uppercase hover:bg-slate-100 transition-all shadow-lg pointer-events-auto">
                  <ArrowLeftCircle size={14}/> Exit Proxy
               </button>
            </div>
          )}
          <Sidebar 
            currentView={currentView} 
            setView={setCurrentView} 
            currentUser={currentUser!} 
            branches={branches} 
            onBranchChange={(b) => {
               if (currentUser) setCurrentUser({...currentUser, branch: b});
            }} 
            onRoleSwitch={(r) => { 
               if (currentUser) {
                 setCurrentUser({...currentUser, role: r}); 
                 if(r === UserRole.SYSTEM_OWNER) setCurrentView('OWNER_DASHBOARD'); 
               }
            }} 
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className={`flex-1 min-h-screen lg:ml-64 transition-all ${originalUser ? 'pt-12' : ''}`}>
            <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu size={22} /></button>
                <div className="lg:hidden w-10 h-10"><ImaniLogoIcon /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate hidden sm:block">
                  Imani Enterprise • {currentUser?.role === UserRole.SYSTEM_OWNER ? 'Global Command' : currentUser?.branch}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50'}`}>
                  <Bell size={22} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white animate-pulse" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">{currentUser?.role}</p>
                  </div>
                  <img src={currentUser?.avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-primary/10" />
                </div>
              </div>
              {isNotificationsOpen && (
                <NotificationsPanel 
                  notifications={notifications} 
                  onClose={() => setIsNotificationsOpen(false)} 
                  onMarkAsRead={() => {}} 
                  onMarkAllAsRead={() => {}} 
                  onDelete={() => {}} 
                />
              )}
            </header>
            <div className="p-10 max-w-[1600px] mx-auto pb-20">{renderView()}</div>
          </main>
        </>
      )}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2 pointer-events-none w-full max-w-[90%] sm:max-w-md">
        {toasts.map(toast => (
          <div key={toast.id} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-auto border ${toast.type === 'success' ? 'bg-brand-primary border-slate-700 text-white' : 'bg-brand-indigo border-brand-indigo text-white'}`}>
            <span className="font-bold text-sm tracking-tight flex-1">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
