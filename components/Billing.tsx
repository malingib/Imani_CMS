
import React from 'react';
import { CreditCard, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, HelpCircle, Package, Calendar, Smartphone } from 'lucide-react';

const Billing: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Subscription & Billing</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage parish license and digital outreach credits.</p>
        </div>
        <div className="px-6 py-2 bg-brand-emerald/10 text-brand-emerald rounded-full border border-brand-emerald/20 flex items-center gap-2">
           <ShieldCheck size={16}/>
           <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Plan Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-50 pb-10">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                     <Package size={32}/>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Enterprise Parish License</h3>
                     <p className="text-slate-400 font-medium mt-1">Unlimited Members • All Modules Enabled</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">KES 4,500 <span className="text-sm font-bold text-slate-400">/mo</span></p>
                  <p className="text-[10px] font-black uppercase text-brand-indigo mt-1">Renews on Nov 15, 2024</p>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-3">
                  <Zap size={16} className="text-brand-gold"/> Digital Outreach Credits
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase">SMS Balance</p>
                     <h5 className="text-4xl font-black text-slate-800">4,280 <span className="text-xs font-bold text-slate-400">Units</span></h5>
                     <button className="w-full py-3 bg-white border border-slate-200 text-brand-indigo rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-sm">Top Up SMS</button>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase">AI Generation Tokens</p>
                     <h5 className="text-4xl font-black text-slate-800">Unlimited <span className="text-xs font-bold text-slate-400">GenAI</span></h5>
                     <p className="text-[10px] text-brand-emerald font-black uppercase">Included in Plan</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <h4 className="text-xl font-black uppercase tracking-tight">Settlement Method</h4>
                  <div className="p-6 bg-white/10 rounded-2xl border border-white/20 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold opacity-60">Primary Handset</span>
                        <CheckCircle2 size={16} className="text-brand-gold"/>
                     </div>
                     <p className="text-lg font-black tracking-widest">07XX ••• 123</p>
                     <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-brand-gold"/>
                        <span className="text-[10px] font-black uppercase">M-Pesa Standing Order</span>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-primary transition-all">Update Billing</button>
               </div>
               <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                  <Calendar size={20} className="text-brand-indigo"/> Billing History
               </h4>
               <div className="space-y-4">
                  {[
                    { date: 'Oct 15', amt: '4,500', status: 'Paid' },
                    { date: 'Sep 15', amt: '4,500', status: 'Paid' },
                    { date: 'Aug 15', amt: '4,500', status: 'Paid' },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-100 group">
                       <div>
                          <p className="text-xs font-bold text-slate-700">{inv.date}, 2024</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice #{1024 - i}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-800">KES {inv.amt}</p>
                          <p className="text-[8px] font-black uppercase text-brand-emerald">Settled</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Billing;
