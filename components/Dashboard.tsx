
import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Wallet, 
  Smartphone,
  CheckCircle2,
  Gift,
  ArrowRight,
  Zap,
  X,
  Cake,
  Heart,
  Star,
  Send,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Activity,
  HandCoins,
  CalendarPlus,
  UserPlus,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, events, onAddMember, onSendSMS, onNavigate }) => {
  const celebrations = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const week = members.filter(m => {
      if (!m.birthday) return false;
      const bd = new Date(m.birthday);
      return bd.getMonth() === currentMonth && Math.abs(bd.getDate() - currentDay) <= 7;
    });
    const anniversaries = members.filter(m => {
      const jd = new Date(m.joinDate);
      return jd.getMonth() === currentMonth && Math.abs(jd.getDate() - currentDay) <= 7;
    });
    const items: { id: string; name: string; type: string; date: string; avatar?: string }[] = [];
    week.forEach(m => items.push({
      id: `bday-${m.id}`, name: `${m.firstName} ${m.lastName}`,
      type: 'Birthday', date: m.birthday || '',
    }));
    anniversaries.forEach(m => {
      if (!week.find(w => w.id === m.id)) {
        items.push({
          id: `ann-${m.id}`, name: `${m.firstName} ${m.lastName}`,
          type: 'Membership', date: m.joinDate,
        });
      }
    });
    return items.slice(0, 10);
  }, [members]);

  const performanceData = useMemo(() => {
    const dateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = dateKey(date);
      const dayTransactions = transactions.filter(t => t.date.slice(0, 10) === key);
      const tithes = dayTransactions
        .filter(t => t.type === 'Tithe' && t.category === 'Income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return { name: date.toLocaleDateString('en-KE', { weekday: 'short' }), tithes };
    });
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-3">
          <button onClick={() => onNavigate('COMMUNICATION')} className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <MessageSquare size={18} className="text-brand-indigo" /> Messages
          </button>
          <button onClick={() => onNavigate('FINANCE')} className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20">
            <Smartphone size={18} className="text-brand-gold"/> Record Payment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const recordedIncome = transactions
            .filter(transaction => transaction.category === 'Income')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
          const mpesaCount = transactions.filter(transaction => transaction.paymentMethod === 'M-Pesa').length;
          const mpesaShare = transactions.length ? Math.round((mpesaCount / transactions.length) * 100) : 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return !Number.isNaN(eventDate.getTime()) && eventDate >= today;
          }).length;
          return [
            { label: 'Members', value: members.length.toLocaleString(), detail: 'Registered records', icon: Users },
            { label: 'Recorded income', value: `KES ${recordedIncome.toLocaleString()}`, detail: 'All recorded income', icon: Wallet },
            { label: 'M-Pesa share', value: `${mpesaShare}%`, detail: `${mpesaCount} of ${transactions.length} transactions`, icon: Smartphone },
            { label: 'Upcoming events', value: upcomingEvents.toLocaleString(), detail: 'Scheduled from today', icon: CalendarPlus },
          ];
        })().map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
                <stat.icon size={19} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-md relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                 <div>
                   <p className="text-base font-semibold text-slate-900">Tithes recorded over the last 7 days</p>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-primary" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tithing</span></div>
                   
                 </div>
              </div>
             
             <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorTithes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                    <Area type="monotone" dataKey="tithes" stroke="#1E293B" strokeWidth={5} fillOpacity={1} fill="url(#colorTithes)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: 'Tithe', icon: HandCoins, color: 'emerald', action: () => onNavigate('FINANCE') },
               { label: 'Convert', icon: UserPlus, color: 'indigo', action: onAddMember },
               { label: 'Service', icon: CalendarPlus, color: 'primary', action: () => onNavigate('EVENTS') },
               { label: 'Outreach', icon: MessageSquare, color: 'gold', action: onSendSMS }
             ].map((btn, i) => (
               <button 
                 key={i} 
                 onClick={btn.action}
                 className="bg-white p-5 rounded-[2rem] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 group"
               >
                 <div className={`p-4 bg-brand-${btn.color}-50 text-brand-${btn.color}-500 rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                    <btn.icon size={28} />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{btn.label}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-6 rounded-[2rem] shadow-md space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                   <Smartphone size={20} className="text-brand-indigo" /> Recent Transactions
                 </h4>
                 <div className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-lg text-[10px] font-black uppercase tracking-widest">REAL-TIME</div>
              </div>
              
              <div className="space-y-6">
                 {transactions.slice(0, 4).map((trx, i) => (
                   <div key={trx.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-indigo font-black text-xs flex-shrink-0">
                         {trx.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-800 truncate pr-2">{trx.memberName}</p>
                            <span className="text-brand-emerald font-black text-xs">KES {trx.amount.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate">{trx.type}</p>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{trx.date}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={() => onNavigate('FINANCE')} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                 View All <ExternalLink size={12}/>
              </button>
           </div>

           <div className="bg-brand-primary p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
<Gift size={28} className="text-brand-gold animate-bounce" />
                     <h4 className="text-xl font-black uppercase tracking-tight">Celebrations</h4>
                 </div>
                 <p className="text-slate-300 text-sm leading-6">
                   {celebrations.length} members have birthdays or membership anniversaries coming up soon.
                 </p>
                 <button
                   onClick={() => onNavigate('COMMUNICATION')}
                   className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                 >
                   Message members
                 </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-brand-indigo rounded-full blur-[80px] opacity-10 group-hover:scale-125 transition-transform duration-1000" />
           </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
