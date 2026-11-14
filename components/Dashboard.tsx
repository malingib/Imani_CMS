import React, { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  ArrowUpRight, CalendarDays, ChevronRight,
  Clock3, HandCoins, Plus, UserRoundPlus, Users, Wallet,
} from 'lucide-react';
import { AppView, ChurchEvent, Member, MemberStatus, Transaction } from '../types';

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
const dateOf = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Dashboard: React.FC<DashboardProps> = ({
  members, transactions, lifetimeTitheTransactions, events,
  onAddMember, onSendSMS, onNavigate,
}) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  const dateLabel = now.toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const activeMembers = members.filter(member =>
    member.status === MemberStatus.ACTIVE || member.status === 'ACTIVE',
  ).length;
  const incomeThisMonth = transactions.reduce((sum, item) => {
    const date = dateOf(item.date);
    return item.category === 'Income' && date && date >= monthStart && date < nextMonth
      ? sum + item.amount
      : sum;
  }, 0);
  const newMembersThisMonth = members.filter(member => {
    const date = dateOf(member.joinDate);
    return date && date >= monthStart && date < nextMonth;
  }).length;
  const upcomingEvents = useMemo(() => [...events]
    .filter(event => {
      const date = dateOf(event.date);
      return date && date >= today;
    })
    .sort((a, b) => (dateOf(a.date)?.getTime() || 0) - (dateOf(b.date)?.getTime() || 0))
    .slice(0, 4), [events, today.getTime()]);

  const metrics = [
    { label: 'Total members', value: members.length.toLocaleString('en-KE'), note: `${activeMembers.toLocaleString('en-KE')} active`, icon: Users, view: 'MEMBERS' as AppView, change: `${newMembersThisMonth} joined this month` },
    { label: 'Giving this month', value: currency(incomeThisMonth), note: monthLabel, icon: Wallet, view: 'FINANCE' as AppView, change: 'Recorded income' },
    { label: 'Upcoming events', value: upcomingEvents.length.toString(), note: 'Scheduled from today', icon: CalendarDays, view: 'EVENTS' as AppView, change: 'View church calendar' },
    { label: 'New members', value: newMembersThisMonth.toString(), note: `Joined in ${monthLabel}`, icon: UserRoundPlus, view: 'MEMBERS' as AppView, change: 'Member register' },
  ];

  const givingByMonth = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return { key, name: date.toLocaleDateString('en-KE', { month: 'short' }), amount: 0 };
    });
    const totals = new Map(months.map(month => [month.key, 0]));
    lifetimeTitheTransactions.forEach(item => {
      if (item.category !== 'Income') return;
      const date = dateOf(item.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (totals.has(key)) totals.set(key, (totals.get(key) || 0) + item.amount);
    });
    return months.map(month => ({ ...month, amount: totals.get(month.key) || 0 }));
  }, [lifetimeTitheTransactions, now.getFullYear(), now.getMonth()]);

  const recentTransactions = useMemo(() => [...transactions]
    .sort((a, b) => (dateOf(b.date)?.getTime() || 0) - (dateOf(a.date)?.getTime() || 0))
    .slice(0, 6), [transactions]);

  return (
    <div className="imani-dashboard space-y-6 pb-8 text-slate-900">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>Workspace</span><span aria-hidden="true">/</span><span className="font-medium text-slate-700">Dashboard</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span><span className="hidden sm:inline">{dateLabel}</span>
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-slate-950">Church overview</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigate('FINANCE')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <HandCoins size={16} aria-hidden="true" /> Record giving
          </button>
          <button type="button" onClick={onAddMember} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#18312f] px-3.5 text-sm font-semibold text-white hover:bg-[#102725]">
            <Plus size={16} aria-hidden="true" /> Add member
          </button>
          <button type="button" onClick={onSendSMS} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium text-slate-600 hover:text-[#18312f]">
            Send a message
          </button>
        </div>
      </header>

      <section aria-label="Church summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <button key={metric.label} type="button" onClick={() => onNavigate(metric.view)} className="group min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-slate-600">{metric.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${index === 1 ? 'bg-[#f7f3e9] text-[#8a6a2f]' : 'bg-[#edf4f1] text-[#285653]'}`}><metric.icon size={17} aria-hidden="true" /></span>
            </div>
            <p className="mt-3 truncate text-[25px] font-semibold leading-none tracking-[-0.03em] text-slate-950 tabular-nums">{metric.value}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-slate-100 pt-3">
              <span className="truncate text-xs text-slate-500">{metric.note}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#35665f]"><ArrowUpRight size={13} />{metric.change}</span>
            </div>
          </button>
        ))}
      </section>

      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="giving-analytics-heading">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="giving-analytics-heading" className="text-base font-semibold text-slate-900">Giving analytics</h2><p className="mt-1 text-xs text-slate-500">Monthly tithe income · last six months</p></div>
            <button type="button" onClick={() => onNavigate('FINANCE')} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#285653] hover:bg-[#f3f7f5]">Finance hub <ChevronRight size={14} /></button>
          </div>
          <div className="h-[260px] min-w-0">
            {givingByMonth.some(month => month.amount > 0) ? <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={givingByMonth} margin={{ top: 8, right: 8, left: 2, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e8eeeb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71817d', fontSize: 11 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71817d', fontSize: 10 }} width={48} tickFormatter={value => Number(value) >= 1000 ? `${Math.round(Number(value) / 1000)}k` : String(value)} />
                <Tooltip cursor={{ fill: '#f5f8f6' }} contentStyle={{ borderRadius: 8, border: '1px solid #dfe8e5', boxShadow: '0 4px 16px rgba(23,59,58,.08)', fontSize: 12 }} formatter={value => [currency(Number(value)), 'Tithe income']} />
                <Bar dataKey="amount" fill="#285653" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 px-6 text-center"><p className="max-w-sm text-sm text-slate-500">Tithe income from the last six months will appear here as it is recorded.</p></div>}
          </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-3" aria-labelledby="recent-transactions-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 id="recent-transactions-heading" className="text-base font-semibold text-slate-900">Recent transactions</h2><p className="mt-1 text-xs text-slate-500">Latest recorded income and expenses</p></div>
            <button type="button" onClick={() => onNavigate('FINANCE')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#285653] hover:underline">View all <ChevronRight size={14} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead><tr className="bg-[#f8faf9] text-[10px] font-semibold uppercase tracking-wide text-slate-500"><th scope="col" className="px-5 py-3">Transaction</th><th scope="col" className="px-3 py-3">Member</th><th scope="col" className="px-3 py-3">Date</th><th scope="col" className="px-3 py-3">Method</th><th scope="col" className="px-3 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map(item => {
                  const date = dateOf(item.date);
                  return <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><span className="block font-semibold text-slate-800">{item.type}</span><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.category === 'Income' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{item.category}</span></td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{item.memberName || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{date?.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{item.paymentMethod}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums text-slate-900">{currency(item.amount)}</td>
                  </tr>;
                })}
                {!recentTransactions.length && <tr><td colSpan={5} className="px-5 py-10 text-center"><p className="font-medium text-slate-700">No transactions recorded yet</p><button type="button" onClick={() => onNavigate('FINANCE')} className="mt-2 font-semibold text-[#285653] hover:underline">Open finance</button></td></tr>}
              </tbody>
            </table>
          </div>
          {!!recentTransactions.length && <div className="border-t border-slate-100 px-5 py-3"><button type="button" onClick={() => onNavigate('FINANCE')} className="text-xs font-semibold text-[#285653] hover:underline">Open finance ledger</button></div>}
        </section>

        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="upcoming-events-heading">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div><h2 id="upcoming-events-heading" className="text-base font-semibold text-slate-900">Upcoming events</h2><p className="mt-1 text-xs text-slate-500">What’s next in your church calendar</p></div>
              <button type="button" onClick={() => onNavigate('EVENTS')} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Open calendar"><CalendarDays size={17} /></button>
            </div>
            {upcomingEvents.length ? <ul className="divide-y divide-slate-100">
              {upcomingEvents.map(event => {
                const eventDate = dateOf(event.date);
                return <li key={event.id}><button type="button" onClick={() => onNavigate('EVENTS')} className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50/70">
                  <span className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-[#edf4f1] py-1.5 text-[#285653]"><span className="text-[9px] font-semibold uppercase">{eventDate?.toLocaleDateString('en-KE', { month: 'short' })}</span><span className="text-base font-semibold leading-5 tabular-nums">{eventDate?.getDate()}</span></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{event.title}</span><span className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={12} />{event.time || 'Time not set'}{event.location ? ` · ${event.location}` : ''}</span></span>
                  <ChevronRight size={15} className="shrink-0 text-slate-400" />
                </button></li>;
              })}
            </ul> : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center"><p className="text-sm font-medium text-slate-700">No upcoming events</p><button type="button" onClick={() => onNavigate('EVENTS')} className="mt-1 text-xs font-semibold text-[#285653] hover:underline">Open calendar</button></div>}
            <button type="button" onClick={() => onNavigate('EVENTS')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#285653] hover:underline">View calendar <ChevronRight size={14} /></button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
