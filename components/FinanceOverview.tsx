import React, { useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Banknote, CalendarDays, Wallet } from 'lucide-react';
import type { Budget, Transaction } from '../types';

type Props = { transactions: Transaction[]; budgets: Budget[] };

const KES = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
const compactKES = (value: number) => 'KES ' + new Intl.NumberFormat('en-KE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const palette = ['#5955D1', '#16A085', '#E5A93D', '#64748B', '#D97757', '#8B5CF6'];

function monthKey(date: Date) {
  return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0');
}
function shortMonth(date: Date) {
  return date.toLocaleDateString('en-KE', { month: 'short' });
}

const FinanceOverview: React.FC<Props> = ({ transactions, budgets }) => {
  const metrics = useMemo(() => {
    const income = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const currentMonth = monthKey(new Date());
    const monthRows = transactions.filter(t => String(t.date).slice(0, 7) === currentMonth);
    const monthIncome = monthRows.filter(t => t.category === 'Income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const monthExpenses = monthRows.filter(t => t.category === 'Expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { income, expenses, net: income - expenses, monthIncome, monthExpenses, monthRows: monthRows.length };
  }, [transactions]);

  const trend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = monthKey(date);
      const rows = transactions.filter(t => String(t.date).slice(0, 7) === key);
      return {
        month: shortMonth(date),
        income: rows.filter(t => t.category === 'Income').reduce((sum, t) => sum + Number(t.amount || 0), 0),
        expenses: rows.filter(t => t.category === 'Expense').reduce((sum, t) => sum + Number(t.amount || 0), 0),
      };
    });
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.filter(t => t.category === 'Expense').forEach(t => {
      const key = t.type || 'Other';
      totals.set(key, (totals.get(key) || 0) + Number(t.amount || 0));
    });
    return [...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const currentMonth = monthKey(new Date());
  const monthlyBudgets = budgets.filter(b => b.month === currentMonth);
  const budgetTotal = monthlyBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const budgetSpent = monthlyBudgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const budgetProgress = budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : 0;
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const cards = [
    { label: 'Total revenue', value: metrics.income, note: KES.format(metrics.monthIncome) + ' this month', icon: ArrowUpRight, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Total expenses', value: metrics.expenses, note: KES.format(metrics.monthExpenses) + ' this month', icon: ArrowDownRight, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Net position', value: metrics.net, note: 'Revenue less expenses', icon: Wallet, tone: 'text-indigo-700 bg-indigo-50' },
    { label: 'This month', value: metrics.monthRows, note: 'Recorded transactions', icon: CalendarDays, tone: 'text-slate-700 bg-slate-100', count: true },
  ];

  return (
    <section className="space-y-5" aria-label="Finance overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {'count' in card ? card.value.toLocaleString('en-KE') : KES.format(card.value)}
                </p>
                <p className="mt-2 text-xs text-slate-500">{card.note}</p>
              </div>
              <span className={'rounded-lg p-2.5 ' + card.tone}><card.icon size={19} /></span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Revenue vs expenses</h3>
              <p className="mt-1 text-sm text-slate-500">Monthly financial performance · last six months</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-indigo-600" /> Revenue</span>
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-500" /> Expenses</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="financeRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5955D1" stopOpacity={0.16} /><stop offset="95%" stopColor="#5955D1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="financeExpenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E5A93D" stopOpacity={0.16} /><stop offset="95%" stopColor="#E5A93D" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF0F4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8490A2', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8490A2', fontSize: 11 }} tickFormatter={compactKES} width={72} />
                <Tooltip formatter={(value) => KES.format(Number(value || 0))} contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="income" name="Revenue" stroke="#5955D1" strokeWidth={2.5} fill="url(#financeRevenueFill)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#E5A93D" strokeWidth={2.5} fill="url(#financeExpenseFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-4">
          <h3 className="text-base font-semibold text-slate-900">Expense breakdown</h3>
          <p className="mt-1 text-sm text-slate-500">Recorded expenditure by category</p>
          {expenseBreakdown.length ? (
            <>
              <div className="relative mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={2} stroke="none">
                      {expenseBreakdown.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => KES.format(Number(value || 0))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-500">Total</span>
                  <strong className="mt-1 text-sm text-slate-900">{compactKES(metrics.expenses)}</strong>
                </div>
              </div>
              <div className="space-y-2">
                {expenseBreakdown.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-slate-600"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} /> <span className="truncate">{item.name}</span></span>
                    <strong className="shrink-0 font-medium text-slate-800">{KES.format(item.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="flex h-56 items-center justify-center text-sm text-slate-400">No expenses recorded yet.</div>}
        </article>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-4">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="text-base font-semibold text-slate-900">Monthly budget</h3><p className="mt-1 text-sm text-slate-500">Current month allocation</p></div>
            <Banknote size={20} className="text-slate-400" />
          </div>
          {budgetTotal > 0 ? <>
            <div className="mt-6 flex items-end justify-between gap-3"><strong className="text-2xl tabular-nums text-slate-900">{budgetProgress}%</strong><span className="text-xs text-slate-500">{KES.format(budgetSpent)} of {KES.format(budgetTotal)}</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: String(budgetProgress) + '%' }} /></div>
            <p className="mt-3 text-xs text-slate-500">{KES.format(Math.max(0, budgetTotal - budgetSpent))} remaining in the current budget.</p>
          </> : <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No budget has been set for this month. Add allocations in the transaction and budget workspace.</p>}
        </article>

        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h3 className="text-base font-semibold text-slate-900">Recent transactions</h3><p className="mt-1 text-xs text-slate-500">Latest income and expense records</p></div>
            <span className="text-xs text-slate-500">{recent.length} latest</span>
          </div>
          {recent.length ? <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500"><tr><th className="px-5 py-3">Reference / payer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map(t => <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3"><p className="font-medium text-slate-800">{t.memberName || t.reference || 'Unspecified payer'}</p><p className="mt-0.5 text-xs text-slate-400">{t.reference || t.type}</p></td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(t.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3"><span className={'rounded-md px-2 py-1 text-xs ' + (t.category === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{t.type}</span></td>
                  <td className={'px-5 py-3 text-right font-semibold tabular-nums ' + (t.category === 'Income' ? 'text-emerald-700' : 'text-slate-800')}>{t.category === 'Income' ? '+' : '−'}{KES.format(t.amount)}</td>
                </tr>)}
              </tbody>
            </table>
          </div> : <p className="p-6 text-sm text-slate-500">No transactions recorded yet.</p>}
        </article>
      </div>
    </section>
  );
};

export default FinanceOverview;
