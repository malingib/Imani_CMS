
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
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, AppNotification, Toast
} from './types';
import { Bell, Menu, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [churchInfo] = useState({
    name: 'Imani Central Parish',
    region: 'Kenya Region'
  });

  const [branches] = useState(['Nairobi Central', 'Mombasa Branch', 'Kisumu Outreach', 'Nakuru Parish']);

  const [notifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      title: 'M-Pesa Transaction',
      message: 'New Tithe received from Mary Wambui: KES 12,000.',
      time: '2 mins ago',
      type: 'MPESA',
      read: false
    }
  ]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('imani_user');
    addToast("Logged out successfully", "info");
  };

  const handleBranchChange = (branch: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, branch };
      setCurrentUser(updatedUser);
      localStorage.setItem('imani_user', JSON.stringify(updatedUser));
      addToast(`Switched to ${branch}`);
    }
  };

  const [members, setMembers] = useState<Member[]>([
    { id: '1', firstName: 'David', lastName: 'Ochieng', phone: '0712345678', email: 'david@example.com', location: 'Nairobi West', group: 'Youth Fellowship', status: MemberStatus.ACTIVE, joinDate: '2023-01-15', maritalStatus: MaritalStatus.SINGLE, membershipType: MembershipType.FULL, age: 24, gender: 'Male' },
    { id: '2', firstName: 'Mary', lastName: 'Wambui', phone: '0722111222', email: 'mary@example.com', location: 'Kileleshwa', group: 'Women of Grace', status: MemberStatus.ACTIVE, joinDate: '2022-11-20', maritalStatus: MaritalStatus.MARRIED, membershipType: MembershipType.FULL, age: 38, gender: 'Female' },
  ]);

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addToast("Profile updated successfully");
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    addToast("Member record deleted", "error");
  };

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'trx1', memberId: '1', memberName: 'David Ochieng', amount: 5000, type: 'Tithe', paymentMethod: 'M-Pesa', date: '2024-05-19', reference: 'QSG812L90P', category: 'Income' },
  ]);

  const [events, setEvents] = useState<ChurchEvent[]>([
    { id: 'ev1', title: 'Sunday Worship Service', description: 'Main service of worship.', date: '2024-05-26', time: '09:00 AM', location: 'Main Sanctuary', attendance: ['1', '2'] },
  ]);

  const handleUpdateAttendance = (eventId: string, memberIds: string[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: memberIds } : e));
    addToast("Roll call updated successfully");
  };

  const renderView = () => {
    if (currentView === 'PRIVACY') return <PrivacyPolicy onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'COMPLIANCE') return <CompliancePortal onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;
    if (currentView === 'SECURITY') return <SecurityOverview onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} />;

    if (!isLoggedIn || !currentUser) return null;

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} />;
      case 'MY_PORTAL':
        return <MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} onNavigate={setCurrentView} onUpdateProfile={handleUpdateMember} />;
      case 'MEMBERS':
        return <Membership 
          members={members} 
          onAddMember={(m) => { setMembers(prev => [...prev, m]); addToast("Member added successfully"); }} 
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          transactions={transactions} 
          events={events} 
          currentUserRole={currentUser.role}
        />;
      case 'GROUPS':
        return <GroupsManagement members={members} />;
      case 'SERMONS':
        return <SermonHistory events={events} />;
      case 'FINANCE':
        return <FinanceReporting 
          transactions={transactions} 
          members={members} 
          onAddTransaction={(t) => { setTransactions(prev => [t, ...prev]); addToast("Transaction recorded"); }}
          budgets={[]} onSetBudget={() => {}} recurringExpenses={[]} onAddRecurring={() => {}}
        />;
      case 'EVENTS':
        return <EventsManagement events={events} members={members} onAddEvent={(e) => { setEvents(prev => [...prev, e]); addToast("Event scheduled"); }} onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} onUpdateAttendance={handleUpdateAttendance} />;
      case 'COMMUNICATION':
        return <CommunicationCenter members={members} logs={[]} onSendBroadcast={() => addToast("Broadcast sent")} currentUser={currentUser} />;
      case 'REPORTS':
        return <ReportsCenter transactions={transactions} members={members} events={events} />;
      case 'ANALYTICS':
        return <DemographicsAnalysis members={members} />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} />;
    }
  };

  if (!isLoggedIn || !currentUser) {
    if (['PRIVACY', 'COMPLIANCE', 'SECURITY'].includes(currentView)) return renderView();
    return <Login onLogin={handleLogin} onNavigateLegal={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      {/* Toast System */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2 pointer-events-none w-full max-w-[90%] sm:max-w-md">
        {toasts.map(toast => (
          <div key={toast.id} className={`w-full flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-auto border ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
            toast.type === 'error' ? 'bg-brand-primary border-slate-700 text-white' : 
            'bg-brand-primary border-slate-800 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18}/> : toast.type === 'error' ? <AlertCircle size={18}/> : <Info size={18}/>}
            <span className="font-bold text-xs sm:text-sm tracking-tight flex-1">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16}/></button>
          </div>
        ))}
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar 
        currentView={currentView} 
        setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        currentUser={currentUser} 
        branches={branches}
        onBranchChange={handleBranchChange}
        onRoleSwitch={(r) => { 
          setCurrentUser({...currentUser, role: r}); 
          addToast(`Role switched to ${r}`, "info"); 
        }} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 min-h-screen lg:ml-64 transition-all">
        <header className="h-16 h-20 bg-white border-b border-slate-100 px-4 sm:px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><Menu size={22} /></button>
            
            {/* Mobile Logo Visibility */}
            <div className="lg:hidden w-10 h-10">
              <ImaniLogoIcon />
            </div>

            <div className="max-w-[150px] sm:max-w-none">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60 truncate">
                {churchInfo.region} • {currentUser.branch || branches[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50'}`}>
              <Bell size={22} />
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white animate-pulse" />}
            </button>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} onDelete={() => {}} />}
            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="" className="w-8 h-8 h-10 rounded-xl object-cover ring-2 ring-brand-primary/10" />
            </div>
          </div>
        </header>
        <div className="p-4 p-6 lg:p-10 max-w-[1600px] mx-auto pb-20">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
