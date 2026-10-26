
import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
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
    <div className="space-y-8 sm:space-y-10 pb-10 text-slate-900">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-3">
          <button onClick={() => onNavigate('COMMUNICATION')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-slate-700 border border-slate-200 rounded-md font-medium text-sm hover:bg-slate-50 transition-colors">
            <MessageSquare size={18} className="text-brand-indigo" /> Messages
          </button>
          <button onClick={() => onNavigate('FINANCE')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-md font-medium text-sm hover:bg-brand-primary-700 transition-colors">
            <Smartphone size={18} className="text-brand-gold"/> Record Payment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 border-y border-slate-200 divide-x divide-slate-200">
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
          <div key={stat.label} className="min-w-0 px-3 py-5 sm:px-5 sm:py-6 bg-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
              </div>
              <div className="hidden sm:block text-slate-400 p-1">
                <stat.icon size={19} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-transparent py-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                 <div>
                   <p className="text-base font-semibold text-slate-950">Lifetime tithe income by month</p>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-brand-primary" /><span className="text-xs font-medium text-slate-500">Tithing</span></div>
                   
                 </div>
              </div>
             
             <div className="h-[320px] w-full">
                {performanceData.some(day => day.tithes > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }} formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Tithes']} />
                      <Bar dataKey="tithes" name="Tithes" fill="#334155" radius={[3, 3, 0, 0]} maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center border border-dashed border-slate-200 px-6 text-center">
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
                 className="p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3"
               >
                 <div className="text-slate-500">
                    <btn.icon size={28} />
                 </div>
                 <span className="text-sm font-medium text-slate-700">{btn.label}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-transparent border-t border-slate-200 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                   <HandCoins size={20} className="text-brand-indigo" /> Recent Tithes
                 </h4>
                 <span className="text-xs text-slate-500">Latest 5 records</span>
              </div>
              
              <div className="space-y-6">
                 {recentTithes.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No tithe transactions recorded yet.</p> : recentTithes.map((trx, i) => (
                   <div key={trx.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs flex-shrink-0">
                         {trx.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-slate-800 truncate pr-2">{trx.memberName}</p>
                            <span className="text-slate-700 font-semibold text-xs">KES {trx.amount.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate">{trx.type}</p>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{trx.date}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={() => onNavigate('FINANCE')} className="w-full py-2.5 bg-transparent text-slate-600 rounded-md font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                 View All <ExternalLink size={12}/>
              </button>
           </div>

           <div className="border-t border-slate-200 pt-6 text-slate-800 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
<Gift size={20} className="text-slate-500" />
                     <h4 className="text-base font-semibold tracking-tight">Celebrations</h4>
                 </div>
                 <p className="text-slate-500 text-sm leading-6">
                   {celebrations.length === 0
                     ? 'No birthdays or membership anniversaries in the next 7 days.'
                     : `${celebrations.length} upcoming birthdays and membership anniversaries.`}
                 </p>
                 {celebrations.length > 0 && (
                   <ul className="space-y-2">
                     {celebrations.slice(0, 3).map(item => (
                       <li key={item.id} className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2 text-sm">
                         <span className="truncate font-medium text-slate-800">{item.name}</span>
                         <span className="shrink-0 text-xs text-slate-500">{item.daysAway === 0 ? 'Today' : `In ${item.daysAway}d`}</span>
                       </li>
                     ))}
                   </ul>
                 )}
                 <button
                   onClick={() => onNavigate('COMMUNICATION')}
                   className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                   Open communications
                 </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
