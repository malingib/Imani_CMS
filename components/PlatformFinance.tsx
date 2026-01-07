
import React, { useMemo } from 'react';
import { 
  TrendingUp, CreditCard, Users, Landmark, 
  ArrowUpRight, Download, Calendar, Receipt,
  Zap, PieChart as PieIcon, Activity, ArrowDownRight,
  ShieldCheck, Banknote, Smartphone, RefreshCcw,
  BarChart3, Target, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const PlatformFinance: React.FC = () => {
  const mrrData = [
    { m: 'Jan', r: 420000, l: 380000 },
    { m: 'Feb', r: 485000, l: 410000 },
    { m: 'Mar', r: 530000, l: 440000 },
    { m: 'Apr', r: 655000, l: 490000 },
    { m: 'May', r: 772000, l: 520000 },
    { m: 'Jun', r: 842500, l: 580000 },
  ];

  const planSplit = [
    { name: 'Basic', value: 45, color: '#94A3B8' },
    { name: 'Pro', value: 35, color: '#4F46E5' },
    { name: 'Enterprise', value: 20, color: '#FFB800' },
  ];

  const platformStats = [
    { label: 'Active MRR', val: 'KES 842,500', icon: CreditCard, color: 'emerald', trend: '+18.4%' },
    { label: 'Customer LTV', val: 'KES 142k', icon: Target, color: 'indigo', trend: '+4.2%' },
    { label: 'Net Retention', val: '104%', icon: Activity, color: 'primary', trend: '+2.1%' },
    { label: 'Platform Churn', val: '1.2%', icon: ArrowDownRight, color: 'gold', trend: '-0.4%' }
  ];

  const invoices = [
    { id: 'INV-2024-001', tenant: 'Nairobi Central', amt: 8500, date: 'Oct 20', status: 'Paid' },
    { id: 'INV-2024-002', tenant: 'Mombasa Gateway', amt: 4500, date: 'Oct 19', status: 'Paid' },
    { id: 'INV-2024-003', tenant: 'Kisumu Outreach', amt: 0, date: 'Oct 18', status: 'Trial' },
    { id: 'INV-2024-004', tenant: 'Nakuru Valley', amt: 8500, date: 'Oct 15', status: 'Failed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-brand-primary text-brand-gold rounded-2xl shadow-xl">
                 <Receipt size={28}/>
              </div>
              <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase leading-none">Global Revenue</h2>
           </div>
           <p className="text-slate-500 text-lg font-medium">SaaS financial trajectory, subscription health, and payout orchestration.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18}/> Fiscal Report
           </button>
           <button className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-brand-primary/20">
              <RefreshCcw size={18}/> Re-Sync Billing
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 bg-brand-${s.color}-50 text-brand-${s.color}-500 rounded-2xl group-hover:scale-110 transition-transform`}>
                <s.icon size={24} />
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${s.trend.startsWith('+') ? 'text-brand-emerald' : 'text-slate-400'}`}>
                   {s.trend}
                </span>
                <p className="text-[8px] text-slate-300 font-bold uppercase">Growth</p>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{s.val}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 relative z-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Platform MRR Progression</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Monthly Recurring Revenue Trends</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-primary"/><span className="text-[10px] font-black text-slate-400 uppercase">Gross Revenue</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-gold"/><span className="text-[10px] font-black text-slate-400 uppercase">Operational LTV</span></div>
               </div>
            </div>
            
            <div className="h-[400px] w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mrrData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                     <YAxis hide />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                     <Area type="monotone" dataKey="r" stroke="#1E293B" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                     <Area type="monotone" dataKey="l" stroke="#FFB800" strokeWidth={5} fill="transparent" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                  <PieIcon size={20} className="text-brand-indigo"/> Plan Adoption
               </h4>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={planSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                           {planSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Landmark size={24}/></div>
                     <h4 className="text-xl font-black uppercase tracking-tight">Fintech Status</h4>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-xs font-bold opacity-60">Safaricom Payouts</span>
                        <span className="text-[10px] font-black uppercase text-brand-emerald">VERIFIED</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-xs font-bold opacity-60">Paystack Node</span>
                        <span className="text-[10px] font-black uppercase text-brand-emerald">VERIFIED</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold opacity-60">Global Float</span>
                        <span className="text-[10px] font-black uppercase">KES 1.4M</span>
                     </div>
                  </div>
               </div>
               <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:scale-125 transition-transform duration-1000" />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tight">Platform Invoicing Ledger</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all">
               <Download size={14}/> CSV Archive
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                     <th className="px-10 py-6">Identity Ref</th>
                     <th className="px-10 py-6">Tenant Parish</th>
                     <th className="px-10 py-6">Billing Period</th>
                     <th className="px-10 py-6">Status</th>
                     <th className="px-10 py-6 text-right">Settled (KES)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-8 font-mono text-xs text-brand-indigo font-black">{inv.id}</td>
                       <td className="px-10 py-8">
                          <p className="font-bold text-slate-700 text-sm">{inv.tenant} Parish</p>
                       </td>
                       <td className="px-10 py-8 text-xs font-bold text-slate-500">{inv.date}, 2024</td>
                       <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            inv.status === 'Paid' ? 'bg-brand-emerald/10 text-brand-emerald' : 
                            inv.status === 'Trial' ? 'bg-brand-indigo/10 text-brand-indigo' : 
                            'bg-rose-500 text-white'
                          }`}>
                             {inv.status}
                          </span>
                       </td>
                       <td className="px-10 py-8 text-right font-black text-lg text-slate-900">
                          {inv.amt.toLocaleString()}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default PlatformFinance;
