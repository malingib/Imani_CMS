import React from 'react';
import { Shield, Lock, Eye, FileText, UserCheck, ArrowLeft, Scale, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
          <div className="flex items-center gap-4 text-brand-indigo">
            <div className="p-3 bg-brand-indigo/10 rounded-2xl"><Eye size={24}/></div>
            <h2 className="text-2xl font-black text-slate-800">What We Collect</h2>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            Imani CMS collects personal information necessary for church administration, community engagement, and spiritual support. This includes:
          </p>
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2">Identification & Contact</h4>
              <p className="text-sm text-slate-600">Full names, M-Pesa phone numbers, email addresses, and home addresses for geographic fellowship grouping.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2">Financial Records</h4>
              <p className="text-sm text-slate-600">Transaction IDs, contribution amounts (Tithes/Offerings), and dates of payment for stewardship transparency.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2">Sensitive Data</h4>
              <p className="text-sm text-slate-600">Religious affiliation, spiritual milestones (Baptism/Confirmation), and family details which are processed under the religious exemption of the Act.</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-brand-emerald">
            <div className="p-3 bg-brand-emerald/10 rounded-2xl"><Lock size={24}/></div>
            <h2 className="text-2xl font-black text-slate-800">How We Use Your Data</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Ministry Outreach", desc: "Sending SMS/WhatsApp updates about services and fellowship meetings." },
              { title: "Stewardship", desc: "Providing faithful givers with annual contribution summaries for audit." },
              { title: "Engagement", desc: "Analyzing demographics to better serve youth and senior ministries." },
              { title: "Security", desc: "Verifying access to restricted leadership modules." }
            ].map((use, i) => (
              <div key={i} className="flex gap-4 p-4 border border-slate-50 rounded-2xl">
                <CheckCircle2 className="text-brand-emerald shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{use.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{use.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-primary p-8 lg:p-10 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-brand-indigo/80">
              <div className="p-3 bg-white/10 rounded-2xl"><FileText size={24}/></div>
              <h2 className="text-2xl font-black">Your Data Subject Rights</h2>
            </div>
            <p className="text-indigo-100/70 mt-4 leading-relaxed font-medium">
              Every member has the following rights under the Kenya Data Protection Act:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {[
                { title: "Right to be Forgotten", desc: "Request deletion of your profile if you cease to be a member." },
                { title: "Right to Portability", desc: "Request your contribution history in a structured digital format." },
                { title: "Right to Correction", desc: "Fix inaccurate personal or financial data entry." },
                { title: "Right to Information", desc: "Be notified of any breach involving your personal data within 72 hours." }
              ].map((right, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                   <h4 className="font-black text-brand-indigo/80 text-sm mb-1">{right.title}</h4>
                   <p className="text-xs text-indigo-100/60 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-indigo rounded-full blur-[80px] opacity-20"></div>
        </section>

        <footer className="text-center py-8 space-y-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Last Updated: October 2023 • Office of the Data Protection Commissioner (ODPC) Standards
          </p>
          <p className="text-[10px] text-slate-300 font-bold">
            Imani CMS by Mobiwave Innovations • Empowering Kenyan Congregations
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;