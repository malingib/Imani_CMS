
import React from 'react';
import { Lock, Shield, Server, Smartphone, Key, ArrowLeft, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

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
          <span className="text-[10px] font-black uppercase tracking-widest">Ministry Integrity Defense</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Security</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Your congregation's data and financial stewardship are protected by enterprise-grade protocols designed for the African fintech landscape.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit"><Key size={32}/></div>
           <h3 className="text-2xl font-black text-slate-800">Advanced Encryption</h3>
           <p className="text-sm text-slate-500 font-medium leading-relaxed">
             We utilize <strong>AES-256 bit encryption</strong> for all sensitive member data at rest. During transmission, all traffic is wrapped in <strong>TLS 1.3</strong>, preventing "man-in-the-middle" attacks on Kenyan ISP networks.
           </p>
           <div className="space-y-3 pt-4 border-t border-slate-50">
              {['End-to-End Database Encryption', 'Bcrypt Hashed Passwords', 'Automated Daily Backups'].map(item => (
                <div key={item} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                   <CheckCircle2 size={16} className="text-emerald-500" /> {item}
                </div>
              ))}
           </div>
        </div>

        <div className="bg-brand-solid p-10 rounded-[3rem] text-white shadow-xl space-y-6 relative overflow-hidden">
           <div className="p-4 bg-white/10 text-indigo-300 rounded-2xl w-fit relative z-10"><Smartphone size={32}/></div>
           <h3 className="text-2xl font-black relative z-10">Safe-Pay M-Pesa</h3>
           <p className="text-sm text-indigo-100/70 font-medium leading-relaxed relative z-10">
             Our Daraja integration operates on the <strong>STK Push</strong> model. We never see or store a member's M-Pesa PIN. Authentication is handled exclusively on the member's handset and Safaricom's core infrastructure.
           </p>
           <div className="p-5 bg-white/5 border border-white/10 rounded-2xl relative z-10">
              <div className="flex items-center gap-2 text-brand-gold mb-2">
                 <Zap size={14} fill="currentColor"/>
                 <span className="text-[10px] font-black uppercase tracking-widest">Real-time Validation</span>
              </div>
              <p className="text-[11px] text-indigo-100/50 leading-relaxed">Webhook endpoints are IP-whitelisted to only accept signals from Safaricom G2 Public IPs, preventing receipt spoofing.</p>
           </div>
           <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
        </div>
      </div>

      <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
         <div className="flex items-center gap-4">
            <Server size={32} className="text-slate-400"/>
            <h3 className="text-2xl font-black text-slate-800">Operational Security</h3>
         </div>
         <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
               <div className="p-3 bg-red-50 text-brand-primary rounded-xl w-fit"><ShieldAlert size={20}/></div>
               <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">Zero-Trust Access</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Ministry leaders are restricted to specific modules. A Treasurer cannot view Counseling transcripts, and a Secretary cannot modify Payroll without secondary admin approval.</p>
            </div>
            <div className="space-y-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit"><CheckCircle2 size={20}/></div>
               <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">System Resilience</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">99.9% Uptime SLA. Imani CMS is hosted on geo-redundant clusters. If one Nairobi data center goes offline, traffic automatically routes to our Mombasa disaster recovery site.</p>
            </div>
         </div>
      </div>

      <footer className="text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          Audit Reference: Mobiwave-Sec-2023-V4 • Managed by Mobiwave Innovations
        </p>
      </footer>
    </div>
  );
};

export default SecurityOverview;
