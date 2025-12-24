
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Membership from './components/Membership';
import SermonHistory from './components/SermonHistory';
import EventsManagement from './components/EventsManagement';
import FinanceReporting from './components/FinanceReporting';
import CommunicationCenter from './components/CommunicationCenter';
import DemographicsAnalysis from './components/DemographicsAnalysis';
import Settings from './components/Settings';
import { 
  AppView, Member, MemberStatus, Transaction, 
  ChurchEvent, MaritalStatus, MembershipType,
  User, UserRole, CommunicationLog, Budget, RecurringExpense
} from './types';
import { Search, Bell, User as UserIcon, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  
  // Auth / Role State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u1',
    name: 'Pastor John',
    role: UserRole.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100'
  });

  // Members State
  const [members, setMembers] = useState<Member[]>([
    { id: '1', firstName: 'David', lastName: 'Ochieng', phone: '0712345678', email: 'david@example.com', location: 'Nairobi West', group: 'Youth Fellowship', status: MemberStatus.ACTIVE, joinDate: '2023-01-15', maritalStatus: MaritalStatus.SINGLE, membershipType: MembershipType.FULL, age: 24, gender: 'Male' },
    { id: '2', firstName: 'Mary', lastName: 'Wambui', phone: '0722111222', email: 'mary@example.com', location: 'Kileleshwa', group: 'Women of Grace', status: MemberStatus.ACTIVE, joinDate: '2022-11-20', maritalStatus: MaritalStatus.MARRIED, membershipType: MembershipType.FULL, age: 38, gender: 'Female' },
    { id: '3', firstName: 'Kennedy', lastName: 'Kamau', phone: '0733444555', email: 'ken@example.com', location: 'Thika Road', group: 'Men of Valor', status: MemberStatus.ACTIVE, joinDate: '2024-02-10', maritalStatus: MaritalStatus.SINGLE, membershipType: MembershipType.PROBATION, age: 31, gender: 'Male' },
  ]);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'trx1', memberId: '1', memberName: 'David Ochieng', amount: 5000, type: 'Tithe', paymentMethod: 'M-Pesa', date: '2024-05-19', reference: 'QSG812L90P', category: 'Income' },
    { id: 'trx2', memberId: '2', memberName: 'Mary Wambui', amount: 12000, type: 'Offering', paymentMethod: 'M-Pesa', date: '2024-05-19', reference: 'RYH451K01X', category: 'Income' },
    { id: 'exp1', memberId: '0', memberName: 'Kenya Power', amount: 4500, type: 'Expense', paymentMethod: 'Bank Transfer', date: '2024-05-18', reference: 'KPLC-UT-01', category: 'Expense', subCategory: 'Utilities' },
  ]);

  // Budgeting State
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 'b1', category: 'Utilities', amount: 10000, month: '2024-05' },
    { id: 'b2', category: 'Staff Salaries', amount: 150000, month: '2024-05' },
  ]);

  // Recurring Expenses State
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([
    { id: 're1', name: 'Sanctuary Rent', amount: 45000, category: 'Maintenance', frequency: 'Monthly', nextDueDate: '2024-06-01', isActive: true },
  ]);

  // Events State
  const [events, setEvents] = useState<ChurchEvent[]>([
    { id: 'ev1', title: 'Sunday Worship Service', description: 'Main service.', date: '2024-05-26', time: '09:00 AM', location: 'Main Sanctuary', attendance: ['1', '2'] },
  ]);

  // Communication Logs State
  const [commsLogs, setCommsLogs] = useState<CommunicationLog[]>([
    { id: 'l1', type: 'SMS', recipientCount: 850, targetGroupName: 'All Members', subject: 'Service Reminder', content: 'Join us!', date: '2024-05-18', status: 'Sent', sender: 'Pastor John' },
  ]);

  const addMember = (m: Member) => setMembers(prev => [...prev, m]);
  const addEvent = (e: ChurchEvent) => setEvents(prev => [...prev, e]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const updateAttendance = (eventId: string, memberIds: string[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendance: memberIds } : e));
  };
  const addTransaction = (trx: Transaction) => setTransactions(prev => [trx, ...prev]);
  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };
  const addCommsLog = (log: CommunicationLog) => setCommsLogs(prev => [log, ...prev]);
  const setBudget = (budget: Budget) => {
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === budget.category && b.month === budget.month);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = budget;
        return next;
      }
      return [...prev, budget];
    });
  };
  const addRecurring = (expense: RecurringExpense) => setRecurringExpenses(prev => [...prev, expense]);

  const handleRoleSwitch = (role: UserRole) => {
    const avatars: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
      [UserRole.PASTOR]: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
      [UserRole.TREASURER]: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
      [UserRole.SECRETARY]: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100'
    };
    setCurrentUser(prev => ({ ...prev, role, avatar: avatars[role] }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard 
          members={members} 
          transactions={transactions} 
          events={events}
          onAddMember={() => setCurrentView('MEMBERS')}
          onSendSMS={() => setCurrentView('COMMUNICATION')}
        />;
      case 'MEMBERS':
        return <Membership members={members} onAddMember={addMember} />;
      case 'SERMONS':
        return <SermonHistory events={events} />;
      case 'FINANCE':
        return <FinanceReporting 
          transactions={transactions} 
          members={members}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          budgets={budgets}
          onSetBudget={setBudget}
          recurringExpenses={recurringExpenses}
          onAddRecurring={addRecurring}
        />;
      case 'EVENTS':
        return <EventsManagement events={events} members={members} onAddEvent={addEvent} onDeleteEvent={deleteEvent} onUpdateAttendance={updateAttendance} />;
      case 'COMMUNICATION':
        return <CommunicationCenter members={members} logs={commsLogs} onSendBroadcast={addCommsLog} currentUser={currentUser} />;
      case 'REPORTS':
        return <DemographicsAnalysis members={members} />;
      case 'GROUPS':
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <UserIcon size={64} className="mb-6 opacity-20" />
             <p className="text-2xl font-black text-slate-800">Small Groups & Cell Units</p>
             <p className="text-sm mt-2 font-medium">Manage home fellowship groups and church departments.</p>
          </div>
        );
      case 'ANALYTICS':
        return <DemographicsAnalysis members={members} />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
      />
      
      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 text-slate-400">
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60">Kenya Region • Nairobi Central • {currentUser.role}</p>
          </div>
          
          <div className="flex items-center gap-8">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1 font-bold">{currentUser.role}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-sm overflow-hidden">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto pb-20">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
