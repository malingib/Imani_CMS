import React, { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Users, MessageSquare, Wallet, CalendarDays, HandCoins, UserPlus,
  CalendarPlus, ArrowUpRight, Clock3, ChevronRight
} from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView, MemberStatus } from '../types';

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

const currency = (amount: number) => `KES ${Math.round(amount).toLocaleString('en-KE')}`;
const validDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Dashboard: React.FC<DashboardProps> = ({
  members, transactions, lifetimeTitheTransactions, events, onAddMember, onSendSMS, onNavigate
}) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  const dateLabel = now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const activeMembers = members.filter(member =>
    member.status === MemberStatus.ACTIVE || member.status === 'ACTIVE'
  ).length;

  const stats = useMemo(() => {
    const monthIncome = transactions.reduce((sum, transaction) => {
      const date = validDate(transaction.date);
      return transaction.category === 'Income' && date && date >= startOfMonth && date < startOfNextMonth ? sum + transaction.amount : sum;
    }, 0);
    const newMembers = members.filter(member => {
      const date = validDate(member.joinDate);
      return date && date >= startOfMonth;
    }).length;
    const upcomingEvents = events.filter(event => {
      const date = validDate(event.date);
      return date && date >= startOfToday;
    }).length;
    return [
      { label: 'Total members', value: members.length.toLocaleString('en-KE'), detail: `${activeMembers.toLocaleString('en-KE')} active members`, icon: Users, view: 'MEMBERS' as AppView },
      { label: 'Income this month', value: currency(monthIncome), detail: monthLabel, icon: Wallet, view: 'FINANCE' as AppView },
      { label: 'Upcoming events', value: upcomingEvents.toLocaleString('en-KE'), detail: 'Scheduled from today', icon: CalendarDays, view: 'EVENTS' as AppView },
      { label: 'New members', value: newMembers.toLocaleString('en-KE'), detail: `Joined in ${monthLabel}`, icon: UserPlus, view: 'MEMBERS' as AppView },
    ];
  }, [transactions, members, events, activeMembers, startOfMonth.getTime(), startOfNextMonth.getTime(), startOfToday.getTime(), monthLabel]);

  const performanceData = useMemo(() => {
    const monthly = new Map<string, number>();
    lifetimeTitheTransactions.forEach(transaction => {
      if (transaction.type !== 'Tithe' || transaction.category !== 'Income') return;
      const date = validDate(transaction.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly.set(key, (monthly.get(key) || 0) + transaction.amount);
    });
    return Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([key, tithes]) => {
      const [year, month] = key.split('-').map(Number);
      return { name: new Date(year, month - 1, 1).toLocaleDateString('en-KE', { month: 'short' }), tithes };
    });
  }, [lifetimeTitheTransactions]);

  const recentActivity = useMemo(() => [...transactions]
    .sort((a, b) => (validDate(b.date)?.getTime() || 0) - (validDate(a.date)?.getTime() || 0))
    .slice(0, 6), [transactions]);

  const upcomingEvents = useMemo(() => [...events]
    .filter(event => {
      const date = validDate(event.date);
      return date && date >= startOfToday;
    })
    .sort((a, b) => (validDate(a.date)?.getTime() || 0) - (validDate(b.date)?.getTime() || 0))
    .slice(0, 4), [events, startOfToday.getTime()]);

  const shortcuts = [
    { label: 'Add member', description: 'Register a person', icon: UserPlus, action: onAddMember },
    { label: 'Record payment', description: 'Log income or giving', icon: HandCoins, action: () => onNavigate('FINANCE') },
    { label: 'Plan an event', description: 'Manage church calendar', icon: CalendarPlus, action: () => onNavigate('EVENTS') },
    { label: 'Send a message', description: 'Reach your congregation', icon: MessageSquare, action: onSendSMS },
  ];

  return (
    <div className="imani-dashboard space-y-7 pb-10 text-slate-900">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-primary">{dateLabel}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Church overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A clear view of membership, giving, and what is coming up next.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onAddMember} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            <UserPlus size={16} /> Add member
          </button>
          <button onClick={() => onNavigate('FINANCE')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            <HandCoins size={16} /> Record payment
          </button>
        </div>
      </header>

      <section aria-label="Church key metrics">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Key figures</h2>
          <span className="text-xs text-slate-500">Updated from recorded data</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <button key={stat.label} onClick={() => onNavigate(stat.view)} className="group min-w-0 rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-brand-primary-300 hover:bg-brand-primary-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{stat.value}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-50 text-brand-primary"><stat.icon size={18} aria-hidden="true" /></span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{stat.detail}</p>
                <ArrowUpRight size={15} className="shrink-0 text-slate-400 transition-colors group-hover:text-brand-primary" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="shortcuts-heading">
        <div className="mb-3">
          <h2 id="shortcuts-heading" className="text-sm font-semibold text-slate-800">Quick actions</h2>
          <p className="mt-1 text-xs text-slate-500">Common tasks, one click away.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(item => (
            <button key={item.label} onClick={item.action} className="flex min-h-[76px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-brand-primary-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-primary"><item.icon size={19} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{item.label}</span><span className="mt-1 block text-xs text-slate-500">{item.description}</span></span>
              <ChevronRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-3" aria-labelledby="giving-trend-heading">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="giving-trend-heading" className="text-base font-semibold text-slate-900">Tithe income trend</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly totals from recorded tithe income</p>
            </div>
            <button onClick={() => onNavigate('REPORTS')} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">View reports <ChevronRight size={15} /></button>
          </div>
          <div className="h-[280px] w-full">
            {performanceData.some(item => item.tithes > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }} formatter={(value) => [currency(Number(value)), 'Tithe income']} />
                  <Bar dataKey="tithes" name="Tithe income" fill="#285653" radius={[4, 4, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 px-6 text-center"><p className="max-w-sm text-sm text-slate-500">No tithe income recorded yet. Once payments are recorded, the monthly trend will appear here.</p></div>}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2" aria-labelledby="recent-activity-heading">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><h2 id="recent-activity-heading" className="text-base font-semibold text-slate-900">Recent financial activity</h2><p className="mt-1 text-sm text-slate-500">Latest recorded transactions</p></div>
            <button onClick={() => onNavigate('FINANCE')} aria-label="Open finance" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-primary"><ArrowUpRight size={18} /></button>
          </div>
          {recentActivity.length ? <ul className="divide-y divide-slate-100">
            {recentActivity.map(transaction => (
              <li key={transaction.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Wallet size={15} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{transaction.memberName || transaction.type}</p><p className="mt-1 text-xs text-slate-500">{transaction.type} · {transaction.paymentMethod} · {transaction.date}</p></div>
                <div className="shrink-0 text-right"><p className="text-sm font-semibold tabular-nums text-slate-900">{currency(transaction.amount)}</p><p className={transaction.category === 'Income' ? 'mt-1 text-xs font-medium text-emerald-700' : 'mt-1 text-xs font-medium text-rose-700'}>{transaction.category}</p></div>
              </li>
            ))}
          </ul> : <div className="flex min-h-40 flex-col items-center justify-center text-center"><Clock3 size={22} className="text-slate-400" /><p className="mt-3 text-sm font-medium text-slate-700">No activity yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Recorded income and expenses will appear here.</p></div>}
          <button onClick={() => onNavigate('FINANCE')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open finance <ChevronRight size={15} /></button>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="upcoming-events-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 id="upcoming-events-heading" className="text-base font-semibold text-slate-900">Coming up</h2><p className="mt-1 text-sm text-slate-500">Upcoming church events</p></div>
          <button onClick={() => onNavigate('EVENTS')} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">Open calendar <ChevronRight size={15} /></button>
        </div>
        {upcomingEvents.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {upcomingEvents.map(event => {
            const eventDate = validDate(event.date);
            return <button key={event.id} onClick={() => onNavigate('EVENTS')} className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-brand-primary-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              <span className="flex w-12 shrink-0 flex-col items-center rounded-md bg-brand-primary-50 px-2 py-2 text-brand-primary"><span className="text-[10px] font-semibold uppercase">{eventDate?.toLocaleDateString('en-KE', { month: 'short' })}</span><span className="text-lg font-semibold leading-5">{eventDate?.getDate()}</span></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{event.title}</span><span className="mt-1 block text-xs text-slate-500">{event.time || 'Time not set'}</span><span className="mt-1 block truncate text-xs text-slate-500">{event.location || 'Location not set'}</span></span>
            </button>;
          })}
        </div> : <div className="rounded-lg border border-dashed border-slate-200 px-5 py-8 text-center"><p className="text-sm font-medium text-slate-700">No upcoming events scheduled</p><p className="mt-1 text-sm text-slate-500">Add a service or event to make it visible here.</p><button onClick={() => onNavigate('EVENTS')} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"><CalendarPlus size={15} /> Add an event</button></div>}
      </section>
    </div>
  );
};

export default Dashboard;
