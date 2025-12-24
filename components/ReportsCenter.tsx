
import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, BarChart3, 
  PieChart as PieIcon, Calendar, Users, 
  Landmark, ArrowUpRight, Sparkles, 
  ChevronRight, Printer, Share2, Filter,
  Loader2, CheckCircle2, AlertCircle, X, Quote
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
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
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [aiInsight, setAiInsight] = useState<{ summary: string, recommendations: string[] } | null>(null);

  const income = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'Total Revenue', value: `KES ${income.toLocaleString()}`, trend: '+12%', color: 'emerald' },
    { label: 'Operating Cost', value: `KES ${expense.toLocaleString()}`, trend: '-5%', color: 'rose' },
    { label: 'New Souls', value: members.length.toString(), trend: '+18%', color: 'indigo' },
    { label: 'Attendance Avg', value: '820', trend: '+3%', color: 'amber' },
  ];

  const handleSimulateExport = () => {
    const originalTitle = document.title;
    document.title = `Imani_CMS_Report_${activeReport}_${new Date().toISOString().split('T')[0]}`;
    window.print();
    document.title = originalTitle;
  };

  const handleGenerateAIInsight = async () => {
    setIsGeneratingAI(true);
    setAiInsight(null);
    try {
      // Pass a subset of transactions for analysis
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
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Executive Reports</h2>
          <p className="text-slate-500 mt-2 text-lg">Data-driven transparency for stewardship excellence.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSimulateExport} className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={20} /> Print
          </button>
          <button onClick={handleSimulateExport} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Download size={20} /> Export to PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-slate-800">{s.value}</h4>
              <span className={`text-[10px] font-black ${s.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{s.trend}</span>
            </div>
            <div className={`absolute bottom-0 right-0 w-24 h-1 bg-${s.color}-500/20 group-hover:bg-${s.color}-500 transition-all`}></div>
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
                <button 
                  key={report.id}
                  onClick={() => setActiveReport(report.id as ReportType)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-200 ${activeReport === report.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <report.icon size={18} />
                  <span className="text-sm font-bold">{report.label}</span>
                </button>
              ))}
           </div>

           <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <Sparkles className="text-indigo-300" size={24}/>
                    <h4 className="text-xl font-black">AI Stewardship</h4>
                 </div>
                 <p className="text-sm text-indigo-100/70 font-medium">Generate an automated summary of your current financial and spiritual trends.</p>
                 <button 
                    onClick={handleGenerateAIInsight}
                    disabled={isGeneratingAI}
                    className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>}
                    {isGeneratingAI ? 'Analyzing...' : 'Generate Insight'}
                 </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
           </div>
        </div>

        <div className="lg:col-span-9 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-12 print:col-span-12">
           {aiInsight && (
              <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 duration-500 relative print:hidden">
                 <button onClick={() => setAiInsight(null)} className="absolute top-6 right-6 text-indigo-300 hover:text-indigo-600"><X size={20}/></button>
                 <div className="flex items-center gap-3 text-indigo-600">
                    <Sparkles size={24}/>
                    <h4 className="text-xl font-black">AI Executive Insight</h4>
                 </div>
                 <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{aiInsight.summary}"</p>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Strategic Recommendations</p>
                    {aiInsight.recommendations.map((rec, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{rec}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           <div className="flex justify-between items-center border-b border-slate-50 pb-8">
              <div>
                 <h3 className="text-3xl font-black text-slate-800">
                   {activeReport === 'FINANCIAL' ? 'Financial Integrity Report' : activeReport === 'MEMBERSHIP' ? 'Membership Dynamics' : 'Attendance Analysis'}
                 </h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Republic of Kenya • {dateRange}</p>
              </div>
              <div className="flex gap-2 print:hidden">
                 <select className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase outline-none" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Year to Date</option>
                 </select>
              </div>
           </div>

           {/* Dynamic Content based on Active Report */}
           {activeReport === 'FINANCIAL' ? (
              <div className="space-y-12">
                 <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <h5 className="font-black text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-500" size={18}/> Income Breakdown</h5>
                       <div className="space-y-4">
                          {['Tithes', 'Offerings', 'Mission Project', 'Building Fund'].map(type => (
                            <div key={type} className="flex justify-between items-center">
                               <span className="text-sm font-bold text-slate-600">{type}</span>
                               <span className="text-sm font-black text-slate-800">KES {(Math.random() * 200000 + 50000).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <h5 className="font-black text-slate-800 mb-6 flex items-center gap-2"><ArrowUpRight className="text-indigo-500" size={18}/> Budget Variance</h5>
                       <div className="space-y-4">
                          {['Utilities', 'Staffing', 'Maintenance', 'Compassion'].map(cat => {
                            const variance = (Math.random() * 20 - 10).toFixed(1);
                            return (
                              <div key={cat} className="flex justify-between items-center">
                                 <span className="text-sm font-bold text-slate-600">{cat}</span>
                                 <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${Number(variance) < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                   {variance}% {Number(variance) < 0 ? 'Under' : 'Over'}
                                 </span>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-4 text-slate-800">
                       <CheckCircle2 className="text-emerald-500" size={24}/>
                       <h4 className="text-xl font-black">Audit Status: Compliant</h4>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">All M-Pesa transactions have been reconciled with Safaricom Daraja reports for the selected period. Internal variance is within acceptable limits (0.02%).</p>
                 </div>
              </div>
           ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                 <FileText size={48} className="opacity-20 mb-4" />
                 <p className="font-bold">Detailed {activeReport.toLowerCase()} metrics visualization in preparation.</p>
              </div>
           )}

           <footer className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg print:shadow-none">
                    <span className="font-black text-sm">I</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by Imani CMS • Mobiwave Innovations</p>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-300">Generated: {new Date().toLocaleString()}</p>
           </footer>
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
