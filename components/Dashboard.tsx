
import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Users, MessageSquare, Wallet, Smartphone, Gift, HandCoins, CalendarPlus, UserPlus, ExternalLink } from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  dashboardTransactions: Transaction[];
  lifetimeTitheTransactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, dashboardTransactions, lifetimeTitheTransactions, events, onAddMember, onSendSMS, onNavigate }) => {
  const celebrations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = (month: number, day: number) => {
      const nextDate = new Date(today.getFullYear(), month, day);
      if (nextDate < today) nextDate.setFullYear(nextDate.getFullYear() + 1);
      return Math.round((nextDate.getTime() - today.getTime()) / 86400000);
    };
    const items: { id: string; name: string; type: string; date: string; daysAway: number }[] = [];
    members.forEach(member => {
      if (member.birthday) {
        const birthday = new Date(member.birthday);
        if (!Number.isNaN(birthday.getTime())) {
          const daysAway = daysUntil(birthday.getMonth(), birthday.getDate());
          if (daysAway <= 7) items.push({
            id: `bday-${member.id}`,
            name: `${member.firstName} ${member.lastName}`,
            type: 'Birthday',
            date: member.birthday,
            daysAway,
          });
        }
      }
      const joined = new Date(member.joinDate);
      if (!Number.isNaN(joined.getTime())) {
        const daysAway = daysUntil(joined.getMonth(), joined.getDate());
        if (daysAway <= 7) items.push({
          id: `ann-${member.id}`,
          name: `${member.firstName} ${member.lastName}`,
          type: 'Membership anniversary',
          date: member.joinDate,
          daysAway,
        });
      }
    });
    return items.sort((a, b) => a.daysAway - b.daysAway).slice(0, 10);
  }, [members]);

  const performanceData = useMemo(() => {
    const monthly = new Map<string, number>();
    lifetimeTitheTransactions.forEach(transaction => {
      if (transaction.type !== 'Tithe' || transaction.category !== 'Income') return;
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly.set(key, (monthly.get(key) || 0) + transaction.amount);
    });
    return Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, tithes]) => {
      const [year, month] = key.split('-').map(Number);
      return { name: new Date(year, month - 1, 1).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }), tithes };
    });
  }, [lifetimeTitheTransactions]);

  const recentTithes = useMemo(() => [...lifetimeTitheTransactions]
    .filter(t => t.type === 'Tithe' && t.category === 'Income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5), [lifetimeTitheTransactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
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
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                 <div>
                   <p className="text-base font-semibold text-slate-900">Lifetime tithe income by month</p>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-primary" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tithing</span></div>
                   
                 </div>
              </div>
             
             <div className="h-[320px] w-full">
                {performanceData.some(day => day.tithes > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorTithes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Tithes']} />
                      <Area type="monotone" dataKey="tithes" stroke="#1E293B" strokeWidth={2} fillOpacity={1} fill="url(#colorTithes)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                    <p className="max-w-sm text-sm text-slate-500">No tithe records have been recorded for this church yet.</p>
                  </div>
                )}
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
                 className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-4"
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
           <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                   <HandCoins size={20} className="text-brand-indigo" /> Recent Tithes
                 </h4>
                 <span className="text-xs text-slate-500">Latest 5 records</span>
              </div>
              
              <div className="space-y-6">
                 {recentTithes.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No tithe transactions recorded yet.</p> : recentTithes.map((trx, i) => (
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
                   {celebrations.length === 0
                     ? 'No birthdays or membership anniversaries in the next 7 days.'
                     : `${celebrations.length} upcoming birthdays and membership anniversaries.`}
                 </p>
                 {celebrations.length > 0 && (
                   <ul className="space-y-2">
                     {celebrations.slice(0, 3).map(item => (
                       <li key={item.id} className="flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-sm">
                         <span className="truncate font-medium text-white">{item.name}</span>
                         <span className="shrink-0 text-xs text-slate-300">{item.daysAway === 0 ? 'Today' : `In ${item.daysAway}d`}</span>
                       </li>
                     ))}
                   </ul>
                 )}
                 <button
                   onClick={() => onNavigate('COMMUNICATION')}
                   className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                 >
                   Open communications
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
