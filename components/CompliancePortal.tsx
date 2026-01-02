import React from 'react';
import { ShieldCheck, Scale, FileCheck, Landmark, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface CompliancePortalProps {
  onBack: () => void;
}

const CompliancePortal: React.FC<CompliancePortalProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-brand-indigo font-bold hover:gap-3 transition-all group mb-8"
      >
        <ArrowLeft size={20} /> Back to Portal
      </button>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-indigo/10 text-brand-indigo rounded-full border border-brand-indigo/20">
          <Landmark size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Regulatory Adherence</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Compliance & Governance</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Imani CMS maintains the highest standards of regulatory compliance within the Republic of Kenya, ensuring spiritual work is backed by legal integrity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center">
            <FileCheck size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">ODPC Certified</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Registered Data Controller #00-123-KE</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-brand-indigo/10 text-brand-indigo rounded-2xl flex items-center justify-center">
            <Scale size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">Financing Act</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Compliant with PBO & Societies Act Rules</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">Payment Safety</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">PCI-DSS Compliant via Daraja API</p>
        </div>
      </div>

      <section className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
             <CheckCircle2 size={24} className="text-brand-emerald"/> Ministry Governance Checklist
          </h3>
          <div className="space-y-4">
             {[
               { title: "Data Controller Registration", status: "Active", ref: "ODPC/RC/2023/1234", icon: FileCheck },
               { title: "KRA Tax Exemption Integration", status: "Enabled", ref: "Section 13 (2) Compliant", icon: Landmark },
               { title: "M-Pesa STK Push Security", status: "Verified", ref: "Daraja Production Gateway", icon: ShieldCheck },
               { title: "Local Data Residency", status: "Nairobi Node", ref: "Liquid Intelligent Tech Peer", icon: FileCheck }
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-slate-400"><item.icon size={20}/></div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{item.ref}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald text-[10px] font-black uppercase rounded-lg">
                    {item.status}
                  </span>
               </div>
             ))}
          </div>
        </div>

        <div className="p-8 bg-brand-gold/10 border border-brand-gold/20 rounded-[2rem] flex items-start gap-6">
           <AlertCircle className="text-brand-gold shrink-0" size={28}/>
           <div className="space-y-2">
              <h4 className="font-black text-brand-gold text-sm uppercase tracking-tight">System Audit Notice for Church Board</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                The church board is required under the Societies Act to maintain accurate registers of members and financial audits. Imani CMS generates automated 'Audit Logs' for every transaction and profile modification, providing you with a complete trail for annual general meetings (AGMs).
              </p>
           </div>
        </div>
      </section>
      
      <footer className="text-center text-[10px] text-slate-300 font-bold py-4">
        Powered by Mobiwave Innovations • Building Technology for the Kingdom
      </footer>
    </div>
  );
};

export default CompliancePortal;