import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, CreditCard, Download, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import type { BillingInvoice, BillingSubscription } from '../src/lib/billing-service';

interface BillingProps {
  churchId: string;
}

const money = (amount: number) => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', maximumFractionDigits: 0,
}).format(amount);

const dateLabel = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusClass = (status: string) => {
  const value = status.toLowerCase();
  if (['active', 'paid', 'trialing'].includes(value)) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  if (['overdue', 'past_due', 'cancelled', 'canceled', 'suspended', 'failed'].includes(value)) return 'bg-rose-50 text-rose-700 ring-rose-600/20';
  return 'bg-amber-50 text-amber-700 ring-amber-600/20';
};

const Billing: React.FC<BillingProps> = ({ churchId }) => {
  const [subscriptions, setSubscriptions] = useState<BillingSubscription[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBilling = useCallback(async () => {
    if (!churchId) {
      setSubscriptions([]);
      setInvoices([]);
      setError('A church account must be selected before billing details can be shown.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [subscriptionResult, invoiceResult] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('church_id', churchId).order('start_date', { ascending: false }),
        supabase.from('invoices').select('*').eq('church_id', churchId).order('due_date', { ascending: false }),
      ]);
      if (subscriptionResult.error) throw new Error(subscriptionResult.error.message);
      if (invoiceResult.error) throw new Error(invoiceResult.error.message);
      setSubscriptions((subscriptionResult.data || []) as BillingSubscription[]);
      setInvoices((invoiceResult.data || []) as BillingInvoice[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Billing information could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [churchId]);

  useEffect(() => { void loadBilling(); }, [loadBilling]);

  const currentSubscription = useMemo(() => subscriptions.find(s => ['active', 'trialing', 'past_due'].includes(s.status.toLowerCase())) || subscriptions[0] || null, [subscriptions]);
  const outstanding = useMemo(() => invoices.filter(i => ['pending', 'overdue', 'unpaid'].includes(i.status.toLowerCase())).reduce((sum, i) => sum + Number(i.amount || 0), 0), [invoices]);
  const paidTotal = useMemo(() => invoices.filter(i => i.status.toLowerCase() === 'paid').reduce((sum, i) => sum + Number(i.amount || 0), 0), [invoices]);

  const exportInvoices = () => {
    const quote = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const rows = [
      ['Invoice ID', 'Amount (KES)', 'Status', 'Due date', 'Paid at'],
      ...invoices.map(invoice => [invoice.id, invoice.amount, invoice.status, invoice.due_date, invoice.paid_at || '']),
    ];
    const csv = rows.map(row => row.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imani-billing-invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="imani-page imani-page--billing mx-auto max-w-6xl space-y-8 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Subscription & billing</h1>
          <p className="mt-2 text-sm text-slate-500">Review your church subscription and invoice history.</p>
        </div>
        <button onClick={() => void loadBilling()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">Billing data unavailable</p><p className="mt-1 break-words">{error}</p><p className="mt-2 text-rose-700">No sample billing data is shown. Check the billing tables and account permissions, then retry.</p></div><button onClick={() => void loadBilling()} className="shrink-0 font-semibold underline">Retry</button></div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><CreditCard size={16} /> Subscription status</div>
          {loading ? <div className="mt-3 h-7 w-28 animate-pulse rounded bg-slate-100" /> : currentSubscription ? <div className="mt-3"><span className={'inline-flex rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset ' + statusClass(currentSubscription.status)}>{currentSubscription.status}</span><p className="mt-2 text-xs text-slate-500">{currentSubscription.tier || 'Plan not specified'}</p></div> : <p className="mt-3 text-sm font-medium text-slate-700">No subscription record</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Clock3 size={16} /> Outstanding invoices</div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{loading ? '—' : money(outstanding)}</p>
          <p className="mt-1 text-xs text-slate-500">Based on unpaid invoice records</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 size={16} /> Paid invoices total</div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{loading ? '—' : money(paidTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">Recorded payments only</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-slate-900">Current subscription</h2><p className="mt-1 text-sm text-slate-500">Details from the subscription record for this church.</p></div>
          <ShieldCheck size={20} className="text-slate-400" />
        </div>
        {loading ? <div className="space-y-3 p-5"><div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" /><div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" /></div> : currentSubscription ? (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-xs font-medium text-slate-500">Plan</dt><dd className="mt-1 font-medium text-slate-900">{currentSubscription.tier || 'Not specified'}</dd></div>
            <div><dt className="text-xs font-medium text-slate-500">Status</dt><dd className="mt-1"><span className={'inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ' + statusClass(currentSubscription.status)}>{currentSubscription.status}</span></dd></div>
            <div><dt className="text-xs font-medium text-slate-500">Started</dt><dd className="mt-1 text-sm text-slate-900">{dateLabel(currentSubscription.start_date)}</dd></div>
            <div><dt className="text-xs font-medium text-slate-500">End date</dt><dd className="mt-1 text-sm text-slate-900">{dateLabel(currentSubscription.end_date)}</dd></div>
          </dl>
        ) : <div className="p-8 text-center"><CreditCard size={24} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-800">No subscription found</p><p className="mt-1 text-sm text-slate-500">Contact your church or platform administrator to confirm the account plan.</p></div>}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-slate-900">Invoice history</h2><p className="mt-1 text-sm text-slate-500">Invoices linked to this church account.</p></div>
          <button onClick={exportInvoices} disabled={loading || invoices.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Download size={16} /> Export CSV</button>
        </div>
        {loading ? <div className="space-y-3 p-5"><div className="h-10 animate-pulse rounded bg-slate-100" /><div className="h-10 animate-pulse rounded bg-slate-100" /></div> : invoices.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Due date</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Paid at</th></tr></thead><tbody className="divide-y divide-slate-100">{invoices.map(invoice => <tr key={invoice.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-mono text-xs text-slate-700">{invoice.id.slice(0, 12)}</td><td className="px-5 py-4 text-slate-600">{dateLabel(invoice.due_date)}</td><td className="px-5 py-4 font-medium text-slate-900">{money(Number(invoice.amount || 0))}</td><td className="px-5 py-4"><span className={'inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ' + statusClass(invoice.status)}>{invoice.status}</span></td><td className="px-5 py-4 text-slate-600">{dateLabel(invoice.paid_at)}</td></tr>)}</tbody></table></div>
        ) : <div className="p-10 text-center"><FileText size={24} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-800">No invoices recorded</p><p className="mt-1 text-sm text-slate-500">Invoice records will appear here when issued for this church.</p></div>}
      </section>
      <p className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} /> Figures reflect saved billing records, not a live payment gateway.</p>
    </div>
  );
};

export default Billing;
