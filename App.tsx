
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
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast, AuditLog, MemberActivity
} from './types';
import { Bell, Menu, X, CheckCircle2, AlertCircle, Info, Server, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [branches] = useState(['Nairobi Central', 'Mombasa Branch', 'Kisumu Outreach', 'Nakuru Parish']);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', userId: 'u1', userName: 'Pastor John', action: 'Login successful', module: 'DASHBOARD', timestamp: new Date().toISOString(), severity: 'INFO' }
  ]);

  const [notifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'M-Pesa Transaction', message: 'New Tithe received from Mary Wambui: KES 12,000.', time: '2 mins ago', type: 'MPESA', read: false }
  ]);

  const [memberActivities, setMemberActivities] = useState<MemberActivity[]>([
    { id: 'act1', memberId: '1', type: 'PAYMENT', description: 'Tithe of KES 5,000 received', timestamp: '2024-05-19T10:30:00Z' },
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
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setIsLoggedIn(true);
      if (parsedUser.role === UserRole.MEMBER) setCurrentView('MY_PORTAL');
      if (parsedUser.role === UserRole.SYSTEM_OWNER) setCurrentView('OWNER_DASHBOARD');
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

  const handleLogout = () => {
    createAudit('Logout', 'DASHBOARD');
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('imani_user');
    addToast("Logged out successfully", "info");
  };

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

  const handleRSVP = (eventId: string, isRSVPing: boolean) => {
    if (!currentUser || !currentUser.memberId) {
      addToast("Only registered members can RSVP", "error");
      return;
    }
    const memberId = currentUser.memberId;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: isRSVPing ? [...new Set([...e.attendance, memberId])] : e.attendance.filter(id => id !== memberId) } : e));
    addToast(isRSVPing ? "RSVP confirmed!" : "RSVP cancelled.", "info");
  };

  const renderView = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'COMPLIANCE') return <CompliancePortal onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'SECURITY') return <SecurityOverview onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;

    if (!isLoggedIn || !currentUser) return null;

    // SaaS Owner Level Screens
    if (currentUser.role === UserRole.SYSTEM_OWNER) {
      switch (currentView) {
        case 'OWNER_DASHBOARD': return <SystemOwnerDashboard />;
        case 'PARISH_REGISTRY': return <TenantRegistry />;
        case 'PLATFORM_SUPPORT': return <PlatformSupport />;
        case 'FINANCE': return <PlatformFinance />;
        case 'INFRASTRUCTURE': 
          return (
            <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in">
               <Server size={64} className="mx-auto text-slate-100" />
               <h3 className="text-2xl font-black text-slate-800 uppercase">Node Management</h3>
               <p className="text-slate-400 font-medium">Real-time infrastructure health coming to V2.5</p>
            </div>
          );
        case 'AUDIT_LOGS': return <AuditLogs logs={auditLogs} />;
        case 'SETTINGS': return <Settings currentUserRole={currentUser.role} />;
        default: return <SystemOwnerDashboard />;
      }
    }

    // Church Level Screens
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} />;
      case 'MY_PORTAL': return <MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} activities={memberActivities.filter(a => a.memberId === currentUser.memberId)} onNavigate={setCurrentView} onRSVP={handleRSVP} onUpdateProfile={(m) => { setMembers(prev => prev.map(p => p.id === m.id ? m : p)); addToast('Profile updated'); }} />;
      case 'MY_GIVING': return <MyGiving member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} onGive={() => { addToast('STK Push Sent'); }} />;
      case 'MEMBERS': return <Membership members={members} onAddMember={(m) => setMembers(prev => [...prev, m])} onAddMembersBulk={(ms) => setMembers(prev => [...prev, ...ms])} onUpdateMember={(m) => setMembers(prev => prev.map(p => p.id === m.id ? m : p))} onDeleteMember={(id) => setMembers(prev => prev.filter(m => m.id !== id))} transactions={transactions} events={events} currentUserRole={currentUser.role} />;
      // Fixed: Provided correct prop names matching FinanceReportingProps interface
      case 'FINANCE': return (
        <FinanceReporting 
          transactions={transactions} 
          members={members} 
          onAddTransaction={(t) => setTransactions(prev => [t, ...prev])} 
          onUpdateTransaction={(t) => setTransactions(prev => prev.map(tr => tr.id === t.id ? t : tr))} 
          onDeleteTransaction={(id) => setTransactions(prev => prev.filter(tr => tr.id !== id))} 
          budgets={[]} 
          onSetBudget={() => {}} 
          recurringExpenses={[]} 
          onAddRecurringExpense={() => {}} 
          recurringContributions={[]} 
          onAddRecurringContribution={() => {}} 
          currentUserRole={currentUser.role} 
        />
      );
      case 'COMMUNICATION': return <CommunicationCenter members={members} logs={[]} onSendBroadcast={(log) => addToast('Broadcast sent')} currentUser={currentUser} />;
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

  if (!isLoggedIn || !currentUser) {
    if (['PRIVACY', 'COMPLIANCE', 'SECURITY'].includes(currentView)) return renderView();
    return <Login onLogin={handleLogin} onNavigateLegal={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} currentUser={currentUser} branches={branches} onBranchChange={(b) => { setCurrentUser({...currentUser, branch: b}); }} onRoleSwitch={(r) => { setCurrentUser({...currentUser, role: r}); if(r === UserRole.SYSTEM_OWNER) setCurrentView('OWNER_DASHBOARD'); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 min-h-screen lg:ml-64 transition-all">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu size={22} /></button>
            <div className="lg:hidden w-10 h-10"><ImaniLogoIcon /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate hidden sm:block">
              Imani Enterprise • {currentUser.role === UserRole.SYSTEM_OWNER ? 'Global Command' : currentUser.branch}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50'}`}>
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white animate-pulse" />
            </button>
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

export default App;
