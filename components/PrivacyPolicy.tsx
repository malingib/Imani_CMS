
import React from 'react';
import { Shield, Lock, Eye, FileText, UserCheck, ArrowLeft, Scale } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all group mb-8"
      >
        <ArrowLeft size={20} /> Back to Portal
      </button>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          <Scale size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Legal & Privacy Framework</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          In compliance with the <strong>Kenya Data Protection Act, 2019</strong>, Imani CMS is committed to protecting the privacy and "Sensitive Personal Data" of our church members.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-indigo-600">
            <div className="p-3 bg-indigo-50 rounded-2xl"><Eye size={24}/></div>
            <h2 className="text-2xl font-black text-slate-800">What We Collect</h2>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            We collect personal information necessary for ministry administration, including:
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            {[
              "Names and contact details (Phone/Email)",
              "Location (Residential/Fellowship areas)",
              "Financial records (Tithes via M-Pesa/Cash)",
              "Spiritual journey milestones",
              "Family and marital status"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-emerald-600">
            <div className="p-3 bg-emerald-50 rounded-2xl"><Shield size={24}/></div>
            <h2 className="text-2xl font-black text-slate-800">Sensitive Personal Data</h2>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            Under Section 2 of the Data Protection Act, <strong>religious beliefs</strong> are classified as sensitive personal data. We process this data with:
          </p>
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-4">
             <div className="flex items-start gap-4">
                <div className="mt-1"><UserCheck className="text-emerald-600" size={18}/></div>
                <div>
                   <h4 className="font-black text-emerald-900 text-sm uppercase tracking-tight">Explicit Consent</h4>
                   <p className="text-xs text-emerald-700 font-medium leading-relaxed">Processing is only done with the member's clear and documented consent or as part of the legitimate activities of the church.</p>
                </div>
             </div>
          </div>
        </section>

        <section className="bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-indigo-300">
              <div className="p-3 bg-white/10 rounded-2xl"><FileText size={24}/></div>
              <h2 className="text-2xl font-black">Your Data Subject Rights</h2>
            </div>
            <p className="text-indigo-100/70 mt-4 leading-relaxed font-medium">
              Every member has the following rights under the Act:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {[
                { title: "Right to Information", desc: "Know how your data is being used." },
                { title: "Right to Access", desc: "Request a copy of your personal records." },
                { title: "Right to Correction", desc: "Fix inaccurate or misleading data." },
                { title: "Right to Deletion", desc: "Request erasure of your personal data." }
              ].map((right, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                   <h4 className="font-black text-indigo-300 text-sm mb-1">{right.title}</h4>
                   <p className="text-xs text-indigo-100/60 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
        </section>

        {/* Fix: Correctly close the footer tag to match its opening tag */}
        <footer className="text-center py-8">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Last Updated: October 2023 • Office of the Data Protection Commissioner (ODPC) Standards
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
