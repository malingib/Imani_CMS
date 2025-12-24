
import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, BarChart3, Landmark, 
  Users, Sparkles, Printer, X, Loader2, CheckCircle2 
} from 'lucide-react';
import { Transaction, Member, ChurchEvent } from '../types';
import { analyzeFinances } from '../services/geminiService';

interface ReportsCenterProps {
  transactions: Transaction[];
  members: Member[];
  events: ChurchEvent[];
}

type ReportType = 'FINANCIAL' | 'MEMBERSHIP' | 'ATTENDANCE';

const ReportsCenter: React.FC<ReportsCenterProps> = ({ transactions, members, events }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('FINANCIAL');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ summary: string, recommendations: string[] } | null>(null);

  const stats = [
    { label: 'Revenue', value: 'KES 820k', color: 'emerald' },
    { label: 'Operating', value: 'KES 240k', color: 'brand-secondary' },
    { label: 'New Souls', value: members.length.toString(), color: 'brand-primary' },
    { label: 'Avg Presence', value: '820', color: 'brand-gold' },
  ];

  const handleGenerateAIInsight = async () => {
    setIsGeneratingAI(true);
    setAiInsight(null);
    try {
      const res = await analyzeFinances(transactions.slice(0, 10));
      setAiInsight(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Executive Reports</h2>
          <p className="text-slate-500 mt-2 text-lg">Data-driven transparency for stewardship excellence.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={20} /> Print
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Download size={20} /> Export to PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-2">{s.label}</p>
            <h4 className="text-2xl font-black text-slate-800">{s.value}</h4>
            <div className={`absolute bottom-0 right-0 w-24 h-1 ${s.color === 'brand-primary' ? 'bg-indigo-500' : s.color === 'brand-secondary' ? 'bg-sky-500' : s.color === 'brand-gold' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-4 print:hidden">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2">Report Type</p>
              {[
                { id: 'FINANCIAL', label: 'Financial Integrity', icon: Landmark },
                { id: 'MEMBERSHIP', label: 'Membership Vitality', icon: Users },
                { id: 'ATTENDANCE', label: 'Service Attendance', icon: BarChart3 },
              ].map(report => (
                <button key={report.id} onClick={() => setActiveReport(report.id as ReportType)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${activeReport === report.id ? 'bg-brand-primary text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <report.icon size={18} /> <span className="text-sm font-bold">{report.label}</span>
                </button>
              ))}
           </div>
           <div className="bg-brand-solid p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3"><Sparkles className="text-brand-gold" size={24}/><h4 className="text-xl font-black uppercase">AI Stewardship</h4></div>
                 <p className="text-sm text-slate-400 font-medium">Generate an automated summary of trends.</p>
                 <button onClick={handleGenerateAIInsight} disabled={isGeneratingAI} className="w-full py-4 bg-white text-brand-solid rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>} {isGeneratingAI ? 'Analyzing...' : 'Generate Insight'}
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-9 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
           {aiInsight && (
              <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 relative">
                 <button onClick={() => setAiInsight(null)} className="absolute top-6 right-6 text-brand-primary/40"><X size={20}/></button>
                 <div className="flex items-center gap-3 text-brand-primary"><Sparkles size={24}/><h4 className="text-xl font-black">AI Executive Insight</h4></div>
                 <p className="text-sm text-slate-700 font-medium italic">"{aiInsight.summary}"</p>
                 <div className="space-y-3">
                    {aiInsight.recommendations.map((rec, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                          <span className="w-6 h-6 rounded-lg bg-brand-primary text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                          <p className="text-xs font-bold text-slate-600">{rec}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           <div className="flex justify-between items-center border-b border-slate-50 pb-8">
              <h3 className="text-3xl font-black text-brand-primary uppercase">{activeReport} Analysis</h3>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
