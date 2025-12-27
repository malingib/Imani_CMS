
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
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast, AuditLog, MemberActivity
} from './types';
import { Bell, Menu, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
    }
  }, []);

  const handleLogin = (user: User) => {
    const userWithBranch = { ...user, branch: user.branch || branches[0] };
    setCurrentUser(userWithBranch);
    setIsLoggedIn(true);
    localStorage.setItem('imani_user', JSON.stringify(userWithBranch));
    setCurrentView(user.role === UserRole.MEMBER ? 'MY_PORTAL' : 'DASHBOARD');
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
    { id: 'trx2', memberName: 'Kenya Power', amount: 4500, type: 'Utility', paymentMethod: 'Bank Transfer', date: '2024-05-20', reference: 'BILL-4421', category: 'Expense', source: 'MANUAL' },
  ]);

  const [events, setEvents] = useState<ChurchEvent[]>([
    { id: 'ev1', title: 'Sunday Worship Service', description: 'Main service of worship.', date: '2024-05-26', time: '09:00 AM', location: 'Main Sanctuary', type: 'WORSHIP', attendance: ['1', '2'] },
  ]);

  const handleAddMembersBulk = (importedMembers: Member[]) => {
    setMembers(prev => [...prev, ...importedMembers]);
    addToast(`Successfully imported ${importedMembers.length} souls`, 'success');
    createAudit(`Bulk imported ${importedMembers.length} members`, 'MEMBERS');
  };

  const handleAddTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    addToast(`Recorded ${t.category}: ${t.type}`, 'success');
  };

  const handleUpdateTransaction = (updatedT: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
    addToast(`Transaction updated`, 'success');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast(`Transaction deleted`, 'info');
  };

  const handleRSVP = (eventId: string, isRSVPing: boolean) => {
    if (!currentUser || !currentUser.memberId) {
      addToast("Only registered members can RSVP", "error");
      return;
    }
    
    const memberId = currentUser.memberId;
    const event = events.find(e => e.id === eventId);
    
    // 1. Update event attendance
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const newAttendance = isRSVPing 
          ? [...new Set([...e.attendance, memberId])]
          : e.attendance.filter(id => id !== memberId);
        return { ...e, attendance: newAttendance };
      }
      return e;
    }));

    // 2. Add activity log
    const newActivity: MemberActivity = {
      id: `act-${Date.now()}`,
      memberId: memberId,
      type: 'EVENT_RSVP',
      description: isRSVPing ? `RSVP'd for ${event?.title}` : `Cancelled RSVP for ${event?.title}`,
      timestamp: new Date().toISOString()
    };
    setMemberActivities(prev => [newActivity, ...prev]);
    
    addToast(isRSVPing ? "RSVP confirmed! See you there." : "RSVP cancelled.", "info");
    createAudit(`${isRSVPing ? 'RSVP' : 'Cancel RSVP'} for ${event?.title}`, 'EVENTS');
  };

  const renderView = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'COMPLIANCE') return <CompliancePortal onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'SECURITY') return <SecurityOverview onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;

    if (!isLoggedIn || !currentUser) return null;

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} />;
      case 'MY_PORTAL':
        return (
          <MemberPortal 
            member={members.find(m => m.id === currentUser.memberId) || members[0]} 
            transactions={transactions} 
            events={events} 
            activities={memberActivities.filter(a => a.memberId === currentUser.memberId)}
            onNavigate={setCurrentView} 
            onRSVP={handleRSVP}
            onUpdateProfile={(m) => { setMembers(prev => prev.map(p => p.id === m.id ? m : p)); addToast('Profile updated'); createAudit('Updated profile', 'MY_PORTAL'); }} 
          />
        );
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
        return (
          <FinanceReporting 
            transactions={transactions} 
            members={members} 
            onAddTransaction={handleAddTransaction} 
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            budgets={[]} 
            onSetBudget={() => {}} 
            recurringExpenses={[]} 
            onAddRecurring={() => {}}
            currentUserRole={currentUser.role}
          />
        );
      case 'COMMUNICATION':
        return <CommunicationCenter members={members} logs={[]} onSendBroadcast={(log) => { addToast('Broadcast sent'); createAudit(`Sent ${log.type} broadcast to ${log.targetGroupName}`, 'COMMUNICATION'); }} currentUser={currentUser} />;
      case 'GROUPS':
        return <GroupsManagement members={members} />;
      case 'EVENTS':
        return (
          <EventsManagement 
            events={events} 
            members={members} 
            currentUser={currentUser}
            onRSVP={handleRSVP}
            onAddEvent={(e) => { setEvents(prev => [...prev, e]); createAudit(`Scheduled event ${e.title}`, 'EVENTS'); }} 
            onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} 
            onUpdateAttendance={(id, ids) => setEvents(prev => prev.map(e => e.id === id ? {...e, attendance: ids} : e))} 
          />
        );
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
      case 'SERMONS':
        return <SermonHistory events={events} />;
      default:
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} onNavigate={setCurrentView} />;
    }
  };

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
      <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} currentUser={currentUser} branches={branches} onBranchChange={(b) => { setCurrentUser({...currentUser, branch: b}); createAudit(`Switched branch to ${b}`, 'DASHBOARD'); }} onRoleSwitch={(r) => { setCurrentUser({...currentUser, role: r}); addToast(`Role: ${r}`, "info"); createAudit(`Simulated role switch to ${r}`, 'SETTINGS'); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 min-h-screen lg:ml-64 transition-all">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu size={22} /></button>
            <div className="lg:hidden w-10 h-10"><ImaniLogoIcon /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate hidden sm:block">
              Imani Enterprise • {currentUser.branch}
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

export default App;
