
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, 
  HelpCircle, Package, Calendar, Smartphone, Search, 
  Filter, Download, Info, BarChart3, Users, 
  ChevronRight, X, Receipt, Activity, Clock, 
  FileText, Printer, Mail, Database, Terminal
} from 'lucide-react';
import { Tenant } from '../types';

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  metrics: {
    basePrice: number;
    memberOverage: number;
    smsCount: number;
    smsCost: number;
    dbStorage: string;
  };
}

const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Tenant list for MRR breakdown
  const tenantBillings: Tenant[] = [
    { id: 'T1', name: 'Nairobi Central Parish', subdomain: 'nairobi-central', plan: 'Enterprise', status: 'Active', ownerEmail: 'admin@imani.org', region: 'Nairobi', memberCount: 4200, mrr: 8500, renewalDate: 'Nov 15, 2024', healthScore: 98, usageMetrics: { cpu: 12, memory: 24, dbConnections: 4, smsSent: 1240 } },
    { id: 'T2', name: 'Mombasa Gateway Church', subdomain: 'mombasa-gateway', plan: 'Pro', status: 'Active', ownerEmail: 'pastor@imani.org', region: 'Coast', memberCount: 1200, mrr: 4500, renewalDate: 'Nov 12, 2024', healthScore: 92, usageMetrics: { cpu: 8, memory: 15, dbConnections: 2, smsSent: 540 } },
    { id: 'T3', name: 'Kisumu Outreach Center', subdomain: 'kisumu-outreach', plan: 'Basic', status: 'Trialing', ownerEmail: 'sec@imani.org', region: 'Western', memberCount: 450, mrr: 1200, renewalDate: 'Dec 01, 2024', healthScore: 85, usageMetrics: { cpu: 4, memory: 8, dbConnections: 1, smsSent: 80 } },
  ];

  const [invoices, setInvoices] = useState<Invoice[]>([
    { 
      id: 'INV-2024-881', 
      tenantId: 'T1', 
      tenantName: 'Nairobi Central Parish', 
      plan: 'Enterprise', 
      amount: 10240, 
      date: '2024-10-15', 
      status: 'Paid',
      metrics: { basePrice: 8500, memberOverage: 500, smsCount: 1240, smsCost: 1240, dbStorage: '15GB' }
    },
    { 
      id: 'INV-2024-882', 
      tenantId: 'T2', 
      tenantName: 'Mombasa Gateway Church', 
      plan: 'Pro', 
      amount: 5040, 
      date: '2024-10-12', 
      status: 'Paid',
      metrics: { basePrice: 4500, memberOverage: 0, smsCount: 540, smsCost: 540, dbStorage: '5GB' }
    }
  ]);

  const handleSyncBilling = () => {
    setIsSyncing(true);
    // Simulating automated invoice generation cycle updating MRR figures
    setTimeout(() => {
      const newInvoice: Invoice = {
        id: `INV-2024-${Math.floor(Math.random() * 900) + 100}`,
        tenantId: 'T3',
        tenantName: 'Kisumu Outreach Center',
        plan: 'Basic',
        amount: 1500,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        metrics: { basePrice: 1200, memberOverage: 200, smsCount: 100, smsCost: 100, dbStorage: '1GB' }
      };
      setInvoices([newInvoice, ...invoices]);
      setIsSyncing(false);
    }, 2000);
  };

  const planFeatures: Record<string, string[]> = {
    Basic: ['Up to 500 Members', 'Manual Finance Ledger', 'Email Outreach'],
    Pro: ['Up to 2,500 Members', 'M-Pesa Express Integration', 'SMS Broadcasts', 'Demographics AI'],
    Enterprise: ['Unlimited Members', 'Full Multi-Cluster Resilience', 'Executive AI Reports', 'White-labeled Outreach']
  };

  const totalMrr = useMemo(() => {
    return tenantBillings.reduce((sum, t) => sum + t.mrr, 0);
  }, [tenantBillings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">SaaS Revenue Operations</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Subscription ledger and detailed MRR breakdown by parish tier.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncBilling}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-white text-brand-primary border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Activity size={16} className="animate-spin" /> : <Clock size={16} />} 
            Run Billing Cycle
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20">
             <Download size={16} /> Export Financial Ledger
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Subscriptions</p>
            <h4 className="text-4xl font-black text-slate-800">{tenantBillings.length}</h4>
            <div className="flex items-center gap-2 text-brand-emerald text-[10px] font-black uppercase">
               <ArrowUpRight size={14}/> +12 this month
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global MRR (KES)</p>
            <h4 className="text-4xl font-black text-slate-800">{totalMrr.toLocaleString()}</h4>
            <div className="flex items-center gap-2 text-brand-emerald text-[10px] font-black uppercase">
               <ArrowUpRight size={14}/> +18.4%
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected LTV</p>
            <h4 className="text-4xl font-black text-slate-800">12.4M</h4>
            <p className="text-[10px] font-black text-slate-300 uppercase">Per annum basis</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-xl font-black text-brand-primary uppercase">Tenant MRR Breakdown</h3>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search parishes..." 
                className="w-full pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Parish Tier</th>
                <th className="px-10 py-6">Usage Metrics</th>
                <th className="px-10 py-6">Features Active</th>
                <th className="px-10 py-6 text-right">Monthly (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenantBillings.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${t.plan === 'Enterprise' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                           <Package size={20}/>
                        </div>
                        <div>
                           <p className="font-black text-slate-800 text-base">{t.name}</p>
                           <p className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">{t.plan} Subscription</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 text-[10px] font-black text-slate-400"><Users size={10}/> {t.memberCount} Souls</div>
                           <div className="flex items-center gap-1 text-[10px] font-black text-slate-400"><Smartphone size={10}/> {t.usageMetrics?.smsSent} SMS</div>
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase italic">Next cycle: {t.renewalDate}</p>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex flex-wrap gap-1 max-w-xs">
                        {planFeatures[t.plan]?.slice(0, 2).map((feat, i) => (
                           <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black uppercase text-slate-500">{feat}</span>
                        ))}
                        {(planFeatures[t.plan]?.length || 0) > 2 && <span className="text-[8px] font-black text-brand-primary">+{(planFeatures[t.plan]?.length || 0) - 2} more</span>}
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <p className="font-black text-slate-900 text-xl tracking-tight">{t.mrr.toLocaleString()}</p>
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${t.status === 'Active' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-rose-500 text-white'}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
           <h3 className="text-xl font-black text-brand-primary uppercase">Global Invoicing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Invoice #</th>
                <th className="px-10 py-6">Parish Entity</th>
                <th className="px-10 py-6">Billing Period</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Amount (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setViewingInvoice(inv)}
                  className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                >
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3">
                        <Receipt size={16} className="text-brand-indigo" />
                        <span className="font-mono text-xs font-black text-slate-800">{inv.id}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <p className="font-black text-slate-800 text-sm">{inv.tenantName}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.plan} Subscription</p>
                  </td>
                  <td className="px-10 py-8">
                     <p className="text-xs font-bold text-slate-600">{new Date(inv.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</p>
                  </td>
                  <td className="px-10 py-8">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        inv.status === 'Paid' ? 'bg-brand-emerald/10 text-brand-emerald' : 
                        inv.status === 'Pending' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-rose-500 text-white'
                     }`}>
                        {inv.status}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-right flex items-center justify-end gap-3">
                     <p className="font-black text-slate-900 text-lg tracking-tight">{inv.amount.toLocaleString()}</p>
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 sm:p-12 bg-slate-50 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10 flex items-center gap-6">
                  <div className="p-4 bg-brand-primary text-white rounded-2xl shadow-xl">
                     <Receipt size={32}/>
                  </div>
                  <div>
                     <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Invoice Breakdown</h3>
                     <p className="font-mono text-xs font-black text-slate-400 mt-1">REF: {viewingInvoice.id}</p>
                  </div>
               </div>
               <button onClick={() => setViewingInvoice(null)} className="relative z-10 p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-500 transition-all shadow-sm"><X size={24}/></button>
            </div>

            <div className="p-8 sm:p-12 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Billed To</p>
                     <p className="text-lg font-black text-slate-800">{viewingInvoice.tenantName}</p>
                     <p className="text-xs font-medium text-slate-500">Tier: {viewingInvoice.plan}</p>
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Issue Date</p>
                     <p className="text-sm font-bold text-slate-800">{new Date(viewingInvoice.date).toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 space-y-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-brand-indigo" /> Usage-Based Overage Breakdown
                  </h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-600">Base Subscription ({viewingInvoice.plan})</span>
                        <span className="font-black text-slate-800">KES {viewingInvoice.metrics.basePrice.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <div className="space-y-0.5">
                           <span className="font-bold text-slate-600">SMS Outreach Dispatches</span>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{viewingInvoice.metrics.smsCount} units @ KES 1.00</p>
                        </div>
                        <span className="font-black text-slate-800">KES {viewingInvoice.metrics.smsCost.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <div className="space-y-0.5">
                           <span className="font-bold text-slate-600">Member Record Storage Overage</span>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Database: {viewingInvoice.metrics.dbStorage}</p>
                        </div>
                        <span className="font-black text-slate-800">KES {viewingInvoice.metrics.memberOverage.toLocaleString()}</span>
                     </div>
                     <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                        <span className="text-xl font-black text-brand-primary uppercase tracking-tight">Total Amount</span>
                        <span className="text-3xl font-black text-brand-primary">KES {viewingInvoice.amount.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                     <Printer size={16}/> Print
                  </button>
                  <button onClick={() => setViewingInvoice(null)} className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-indigo transition-all shadow-xl">Close</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
