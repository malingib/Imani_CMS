
import React from 'react';
import { Lock, Shield, Server, Smartphone, Key, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';

interface SecurityOverviewProps {
  onBack: () => void;
}

const SecurityOverview: React.FC<SecurityOverviewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all group mb-8"
      >
        <ArrowLeft size={20} /> Back to Portal
      </button>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          <Shield size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Military-Grade Defense</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security Overview</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          State-of-the-art encryption and infrastructure designed to protect ministry assets and member confidentiality.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit"><Key size={28}/></div>
           <h3 className="text-2xl font-black text-slate-800">Data Encryption</h3>
           <p className="text-sm text-slate-500 font-medium leading-relaxed">
             We use <strong>AES-256 bit encryption</strong> at rest to ensure that even if our storage is breached, the data remains unreadable. Communication between your browser and our servers is protected via <strong>TLS 1.3</strong>.
           </p>
           <ul className="space-y-3 pt-4">
              {['End-to-End Encryption', 'Zero-Knowledge Storage', 'Automated Daily Backups'].map(item => (
                <li key={item} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                   <CheckCircle2 size={16} className="text-emerald-500" /> {item}
                </li>
              ))}
           </ul>
        </div>

        <div className="bg-indigo-950 p-8 rounded-[3rem] text-white shadow-xl space-y-6 relative overflow-hidden">
           <div className="p-3 bg-white/10 text-indigo-300 rounded-2xl w-fit relative z-10"><Smartphone size={28}/></div>
           <h3 className="text-2xl font-black relative z-10">M-Pesa Safe-Pay</h3>
           <p className="text-sm text-indigo-100/70 font-medium leading-relaxed relative z-10">
             Our integration uses Safaricom's <strong>Daraja API OAuth2.0</strong> authentication. We never store member M-Pesa PINs or full credit card details.
           </p>
           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl relative z-10">
              <div className="flex items-center gap-2 text-indigo-300 mb-2">
                 <Zap size={14}/>
                 <span className="text-[10px] font-black uppercase tracking-widest">Instant Validation</span>
              </div>
              <p className="text-[11px] text-indigo-100/50">Receipts are only generated after Safaricom returns a successful "ResultCode: 0" webhook response.</p>
           </div>
           <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
         <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Server size={24} className="text-slate-400"/> Infrastructure & Resilience
         </h3>
         <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">Server Location</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Hosted on Tier-IV data centers with regional presence in Africa to reduce latency and satisfy local sovereignty preferences.</p>
            </div>
            <div className="space-y-3">
               <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">Access Control</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Multi-Factor Authentication (MFA) and Role-Based Access Control (RBAC) ensure only authorized ministry leaders can view sensitive data.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SecurityOverview;
