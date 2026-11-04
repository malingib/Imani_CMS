import React from 'react';
import { CreditCard, FileText, ShieldAlert } from 'lucide-react';

const PlatformFinance: React.FC = () => (
  <main className="mx-auto max-w-[1440px] space-y-6 pb-12 text-slate-900">
    <header className="border-b border-slate-200 pb-6">
      <p className="text-xs font-medium text-slate-500">Platform administration / Finance</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Billing and revenue</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Subscription billing records and platform revenue across client workspaces.</p>
    </header>
    <section className="grid gap-4 sm:grid-cols-2" aria-label="Billing data availability">
      <article className="border-y border-slate-200 py-5 sm:border sm:px-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><CreditCard size={17}/>Subscription ledger</div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Live subscription totals are not connected to this screen. No estimated figures are displayed.</p>
      </article>
      <article className="border-y border-slate-200 py-5 sm:border sm:px-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><FileText size={17}/>Billing records</div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Invoices and payment statuses will appear here when the platform billing ledger is connected.</p>
      </article>
    </section>
    <section role="status" className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
      <ShieldAlert size={18} className="mt-0.5 shrink-0"/>
      <div><p className="font-semibold">Financial data unavailable</p><p className="mt-1 leading-6">This view will show totals only when they can be read from persisted billing records. The previous illustrative MRR, LTV, churn, retention and invoice figures are no longer shown.</p></div>
    </section>
  </main>
);
export default PlatformFinance;
