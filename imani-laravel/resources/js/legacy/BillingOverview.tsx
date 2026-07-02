import React from 'react';
import { DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Subscription {
  id: string;
  churchId: string;
  tier: string;
  status: string;
  church_name?: string;
}

interface Invoice {
  id: string;
  churchId: string;
  amount: number;
  status: string;
  dueDate?: string;
  church_name?: string;
}

interface BillingOverviewProps {
  subscriptions: Subscription[];
  invoices: Invoice[];
}

const BillingOverview: React.FC<BillingOverviewProps> = ({ subscriptions, invoices }) => {
  const stats = [
    { label: 'Active Subscriptions', value: subscriptions.filter((s) => s.status === 'active').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Pending Invoices', value: invoices.filter((i) => i.status === 'pending').length, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Paid Invoices', value: invoices.filter((i) => i.status === 'paid').length, icon: DollarSign, color: 'text-brand-emerald' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-primary tracking-tight">Billing</h1>
        <p className="text-slate-500 font-medium mt-1">Subscriptions and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <s.icon size={28} className={s.color} />
              <div>
                <p className="text-3xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-black text-brand-primary mb-4">Subscriptions</h3>
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-bold text-sm text-slate-800">{sub.church_name || sub.churchId?.slice(0, 8)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">{sub.tier} · {sub.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-black text-brand-primary mb-4">Invoices</h3>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-bold text-sm text-slate-800">{inv.church_name || inv.churchId?.slice(0, 8)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">KES {inv.amount} · {inv.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingOverview;
