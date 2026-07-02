import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createBillingService, type BillingInvoice, type BillingSubscription } from '../src/lib/billing-service';
import { CreditCard, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

const billingService = createBillingService(supabase);

const BillingOverview: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<BillingSubscription[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const overview = await billingService.getBillingOverview();
      setSubscriptions(overview.subscriptions);
      setInvoices(overview.invoices);
      setTotalRevenue(overview.totalRevenue);
    };
    fetch();
  }, []);

  const stats = [
    { label: 'Active Subscriptions', value: subscriptions.filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Total Revenue', value: `KES ${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-brand-emerald' },
    { label: 'Pending Invoices', value: invoices.filter(i => i.status === 'pending').length, icon: AlertTriangle, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-primary tracking-tight">Billing</h1>
        <p className="text-slate-500 font-medium mt-1">Subscriptions and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
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
          {subscriptions.map(sub => (
            <div key={sub.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-bold text-sm text-slate-800">{sub.church_name || sub.church_id.slice(0, 8)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">{sub.tier} · {sub.status}</p>
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${sub.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                {sub.status}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-black text-brand-primary mb-4">Recent Invoices</h3>
          {invoices.slice(0, 10).map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-bold text-sm text-slate-800">{inv.church_name || inv.church_id.slice(0, 8)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">Due {inv.due_date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-sm">KES {inv.amount.toLocaleString()}</p>
                <span className={`text-[10px] font-black uppercase ${inv.status === 'paid' ? 'text-green-500' : inv.status === 'overdue' ? 'text-rose-500' : 'text-amber-500'}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingOverview;
