
import React from 'react';
import { ShieldCheck, Scale, FileCheck, Landmark, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompliancePortalProps {
  onBack: () => void;
}

const CompliancePortal: React.FC<CompliancePortalProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all group mb-8"
      >
        <ArrowLeft size={20} /> Back to Portal
      </button>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          <Landmark size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Regulatory Adherence</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Compliance Portal</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Imani CMS maintains the highest standards of regulatory compliance within the Republic of Kenya.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FileCheck size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">ODPC Registered</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controller & Processor</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Scale size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">Legal Compliance</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Data Act 2019</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24}/>
          </div>
          <h4 className="font-black text-slate-800 text-sm">Fintech Safety</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Safaricom Daraja API</p>
        </div>
      </div>

      <section className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
             <CheckCircle2 size={24} className="text-emerald-500"/> Compliance Checklist
          </h3>
          <div className="space-y-4">
             {[
               { title: "Registration of Data Controller", status: "Active", ref: "ODPC/RC/2023/1234" },
               { title: "Impact Assessment (DPIA)", status: "Completed", ref: "Annual Audit Oct 23" },
               { title: "M-Pesa STK Push Integration", status: "Verified", ref: "Daraja Production" },
               { title: "Local Data Residency", status: "Compliant", ref: "Ke-Peering Active" }
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{item.ref}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg">
                    {item.status}
                  </span>
               </div>
             ))}
          </div>
        </div>

        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
           <AlertCircle className="text-amber-600 shrink-0" size={24}/>
           <div>
              <h4 className="font-black text-amber-900 text-sm mb-1 uppercase tracking-tight">System Audit Notice</h4>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                The church board is required by law to conduct periodic data audits. Imani CMS provides an automated audit trail for all data modifications to simplify this requirement.
              </p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default CompliancePortal;
