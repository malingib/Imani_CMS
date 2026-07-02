
import React from 'react';
import { CreditCard, Clock, HelpCircle } from 'lucide-react';

const Billing: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Subscription & Billing</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage your subscription and SMS credits.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
               <div className="p-6 bg-slate-50 rounded-[2rem]">
                  <Clock size={48} className="text-slate-300" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Coming Soon</h3>
                  <p className="text-slate-400 font-medium mt-2 max-w-md">
                     Subscription management and billing details will be available here. 
                     Contact your platform administrator for pricing information.
                  </p>
               </div>
               <a href="mailto:sales@imani.org" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-indigo transition-all shadow-lg">
                  <HelpCircle size={16} /> Contact Sales
               </a>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex flex-col items-center text-center py-8 space-y-4">
                  <CreditCard size={36} className="text-slate-200" />
                  <div>
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Billing History</h4>
                     <p className="text-xs text-slate-300 font-medium mt-1">Coming soon</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Billing;
