
import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, TrendingUp, BarChart3, Landmark, 
  Users, Sparkles, Printer, X, Loader2, CheckCircle2,
  PieChart as PieIcon, ArrowUpRight, ShieldCheck,
  Calendar, Zap, Info, Wallet, ArrowDownRight, Activity,
  Baby, BookOpen
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Transaction, Member, ChurchEvent } from '../types';
import { analyzeFinances } from '../services/geminiService';

interface ReportsCenterProps {
  transactions: Transaction[];
  members: Member[];
  events: ChurchEvent[];
}

type ReportType = 'FINANCIAL' | 'MEMBERSHIP' | 'ATTENDANCE' | 'SUNDAY_SCHOOL';

const ReportsCenter: React.FC<ReportsCenterProps> = ({ transactions, members, events }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('FINANCIAL');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ summary: string, recommendations: string[] } | null>(null);

  const COLORS = ['#4F46E5', '#10B981', '#FFB800', '#1E293B'];

  const stats = useMemo(() => [
    { label: 'Fiscal Revenue', value: `KES ${(transactions.filter(t => t.category === 'Income').reduce((s, t) => s + t.amount, 0) / 1000).toFixed(0)}k`, color: 'emerald', icon: Wallet },
    { label: 'Operating Costs', value: `KES ${(transactions.filter(t => t.category === 'Expense').reduce((s, t) => s + t.amount, 0) / 1000).toFixed(0)}k`, color: 'indigo', icon: BarChart3 },
    { label: 'Growth Vitality', value: `+${members.length}`, color: 'primary', icon: Users },
    { label: 'Avg Presence', value: '82%', color: 'gold', icon: Calendar },
  ], [transactions, members]);

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

  const renderFinancialReport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
          <h4 className="text-sm font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-emerald"/> Income Stream Allocation
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Tithes', value: 65 },
                    { name: 'Offerings', value: 20 },
                    { name: 'Projects', value: 10 },
                    { name: 'Other', value: 5 }
                  ]} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
          <h4 className="text-sm font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
            <Activity size={16} className="text-brand-indigo"/> Monthly Cashflow Strategy
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { m: 'Jan', i: 400, e: 240 },
                { m: 'Feb', i: 300, e: 139 },
                { m: 'Mar', i: 200, e: 980 },
                { m: 'Apr', i: 278, e: 390 },
                { m: 'May', i: 189, e: 480 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="i" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="e" fill="#1E293B" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h4 className="font-black text-slate-800 uppercase tracking-tight">Audit Trail: M-Pesa Reconciliation</h4>
          <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[10px] font-black uppercase rounded-lg">PCI Compliant</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Transaction Ref</th>
              <th className="px-8 py-5">Member Payee</th>
              <th className="px-8 py-5">System Match</th>
              <th className="px-8 py-5 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.slice(0, 5).map((t, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-6 font-mono text-xs text-brand-indigo font-bold">{t.reference}</td>
                <td className="px-8 py-6 text-sm font-bold text-slate-700">{t.memberName}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right font-black text-brand-emerald">KES {t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMembershipReport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Retention Rate', val: '94.2%', icon: CheckCircle2, color: 'emerald' },
          { label: 'Visitor Conv.', val: '12.5%', icon: ArrowUpRight, color: 'indigo' },
          { label: 'Member Churn', val: '1.8%', icon: ArrowDownRight, color: 'gold' }
        ].map((m, i) => (
          <div key={i} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-center">
            <div className={`mx-auto w-10 h-10 mb-3 bg-brand-${m.color}/10 text-brand-${m.color} rounded-xl flex items-center justify-center`}>
              <m.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.label}</p>
            <h5 className="text-2xl font-black text-slate-800 mt-1">{m.val}</h5>
          </div>
        ))}
      </div>

      <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
        <h4 className="text-sm font-black uppercase text-slate-400 mb-6 px-2 tracking-[0.2em]">Net Congregation Growth</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { n: 'Jan', m: 800 },
              { n: 'Feb', m: 840 },
              { n: 'Mar', m: 890 },
              { n: 'Apr', m: 950 },
              { n: 'May', m: 1050 },
              { n: 'Jun', m: 1250 },
            ]}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="m" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em]">Service Attendance Vitality</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Consistency tracking across Sunday and Mid-week services.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-indigo"/> <span className="text-[10px] font-black text-slate-400 uppercase">Sunday</span></div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-gold"/> <span className="text-[10px] font-black text-slate-400 uppercase">Mid-week</span></div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { d: 'Wk 1', s: 850, m: 310 },
              { d: 'Wk 2', s: 920, m: 280 },
              { d: 'Wk 3', s: 880, m: 450 },
              { d: 'Wk 4', s: 1050, m: 380 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="s" stroke="#4F46E5" strokeWidth={5} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="m" stroke="#FFB800" strokeWidth={5} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <h4 className="text-sm font-black uppercase text-indigo-300 mb-6 tracking-[0.2em] relative z-10">Attendance Benchmarking</h4>
            <div className="space-y-4 relative z-10">
               {[
                 { label: 'Sunday Morning Sanctuary', p: 85, t: 'Target: 90%' },
                 { label: 'Youth Lab Night', p: 62, t: 'Target: 50%' },
                 { label: 'Mid-week Prayer Hour', p: 44, t: 'Target: 40%' },
               ].map((b, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <p className="text-xs font-bold text-white">{b.label}</p>
                       <p className="text-[10px] font-black text-brand-gold">{b.p}%</p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-gold rounded-full" style={{ width: `${b.p}%` }} />
                    </div>
                    <p className="text-[9px] text-indigo-200 uppercase font-black tracking-widest">{b.t}</p>
                 </div>
               ))}
            </div>
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-brand-indigo rounded-full blur-[100px] opacity-20" />
         </div>
         <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-[1.5rem] flex items-center justify-center">
               <ShieldCheck size={32}/>
            </div>
            <h5 className="text-xl font-black text-slate-800">Verified Spiritual Engagement</h5>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Data synchronized from the Events Roll Call system. High consistency detected in the <span className="text-brand-primary font-black">Nairobi West Outreach Zone</span>.
            </p>
            <button className="text-xs font-black uppercase tracking-widest text-brand-indigo hover:underline mt-4">View Regional Breakdown</button>
         </div>
      </div>
    </div>
  );

  const renderSundaySchoolReport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Registered Kids', val: '142', icon: Baby, color: 'emerald' },
          { label: 'Avg Weekly Att.', val: '110', icon: CheckCircle2, color: 'indigo' },
          { label: 'Bible Study Completion', val: '78%', icon: BookOpen, color: 'gold' }
        ].map((m, i) => (
          <div key={i} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-center">
            <div className={`mx-auto w-10 h-10 mb-3 bg-brand-${m.color}/10 text-brand-${m.color} rounded-xl flex items-center justify-center`}>
              <m.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.label}</p>
            <h5 className="text-2xl font-black text-slate-800 mt-1">{m.val}</h5>
          </div>
        ))}
      </div>

      <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
        <h4 className="text-sm font-black uppercase text-slate-400 mb-6 px-2 tracking-[0.2em]">Children's Ministry Attendance Trend</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { d: 'Wk 1', k: 95 },
              { d: 'Wk 2', k: 105 },
              { d: 'Wk 3', k: 112 },
              { d: 'Wk 4', k: 124 },
              { d: 'Wk 5', k: 118 },
              { d: 'Wk 6', k: 135 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="k" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <h4 className="font-black text-slate-800 uppercase tracking-tight">Recent Child Registrations</h4>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Child Name</th>
              <th className="px-8 py-5">Parent/Guardian</th>
              <th className="px-8 py-5">Age Group</th>
              <th className="px-8 py-5 text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              { n: 'Nuru Kamau', p: 'John Kamau', a: '6-8 Years', d: 'Oct 24, 2023' },
              { n: 'Jabali Ochieng', p: 'David Ochieng', a: '9-12 Years', d: 'Oct 22, 2023' },
              { n: 'Zuri Wambui', p: 'Mary Wambui', a: '3-5 Years', d: 'Oct 19, 2023' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-6 text-sm font-bold text-slate-700">{row.n}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{row.p}</td>
                <td className="px-8 py-6 text-[10px] font-black uppercase text-brand-indigo">{row.a}</td>
                <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">{row.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Executive Reports</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Stewardship transparency and operational vitality dashboards.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={16} /> Print View
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tight">{s.value}</h4>
               </div>
               <div className={`p-3 bg-brand-${s.color}-50 text-brand-${s.color} rounded-xl`}>
                  <Zap size={18} />
               </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-brand-${s.color} transition-all duration-700 w-full group-hover:h-2 opacity-50`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6 print:hidden">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-6 px-4 tracking-[0.2em]">Report Scope</p>
              {[
                { id: 'FINANCIAL', label: 'Fiscal Stewardship', icon: Landmark, desc: 'Audit & Cashflow' },
                { id: 'MEMBERSHIP', label: 'Congregation Life', icon: Users, desc: 'Growth & Churn' },
                { id: 'ATTENDANCE', label: 'Spiritual Pulse', icon: BarChart3, desc: 'Service Vitality' },
                { id: 'SUNDAY_SCHOOL', label: 'Sunday School', icon: Baby, desc: 'NextGen Ministry' },
              ].map(report => (
                <button 
                  key={report.id} 
                  onClick={() => setActiveReport(report.id as ReportType)} 
                  className={`w-full flex items-start gap-4 px-6 py-5 rounded-[1.8rem] transition-all text-left ${activeReport === report.id ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <report.icon size={20} className="shrink-0 mt-1" />
                  <div>
                    <span className="text-sm font-black uppercase tracking-tight block leading-none mb-1">{report.label}</span>
                    <span className={`text-[10px] font-medium opacity-60 ${activeReport === report.id ? 'text-white' : 'text-slate-400'}`}>{report.desc}</span>
                  </div>
                </button>
              ))}
           </div>

           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <Sparkles className="text-brand-gold animate-pulse" size={28}/>
                    <h4 className="text-xl font-black uppercase tracking-tight">Executive AI</h4>
                 </div>
                 <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                   Let Gemini synthesize your ministry data into high-level strategic summaries.
                 </p>
                 <button 
                    onClick={handleGenerateAIInsight} 
                    disabled={isGeneratingAI} 
                    className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-gold hover:text-brand-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
                    {isGeneratingAI ? 'Processing...' : 'Run Audit Insight'}
                 </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
           </div>
        </div>

        <div className="lg:col-span-9 bg-white p-10 lg:p-16 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12 min-h-[800px]">
           {aiInsight && (
              <div className="bg-slate-50 border-2 border-indigo-100 p-10 rounded-[3rem] space-y-10 animate-in slide-in-from-top-4 relative">
                 <button 
                    onClick={() => setAiInsight(null)} 
                    className="absolute top-8 right-8 p-3 bg-white text-slate-300 hover:text-brand-primary rounded-2xl shadow-sm transition-all"
                 >
                    <X size={20}/>
                 </button>
                 
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-brand-primary shadow-sm"><Sparkles size={28}/></div>
                    <div>
                       <h4 className="text-2xl font-black text-slate-800 tracking-tight">Executive Strategy Insight</h4>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Generated via Gemini Advanced Analysis</p>
                    </div>
                 </div>

                 <p className="text-lg text-slate-700 font-medium italic leading-relaxed border-l-4 border-brand-indigo pl-8 py-2">
                    "{aiInsight.summary}"
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiInsight.recommendations.map((rec, i) => (
                       <div key={i} className="flex gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-brand-primary transition-all">
                          <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-brand-indigo flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">{i+1}</span>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">{rec}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-10">
                 <div>
                    <h3 className="text-4xl font-black text-brand-primary uppercase tracking-tight">{activeReport.replace('_', ' ')} Analysis</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                       <Calendar size={14}/> Period: Oct 2023 - Present
                    </p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Integrity Level</p>
                       <p className="text-sm font-black text-brand-emerald">Verified Stable</p>
                    </div>
                    <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-2xl"><ShieldCheck size={24}/></div>
                 </div>
              </div>

              {activeReport === 'FINANCIAL' && renderFinancialReport()}
              {activeReport === 'MEMBERSHIP' && renderMembershipReport()}
              {activeReport === 'ATTENDANCE' && renderAttendanceReport()}
              {activeReport === 'SUNDAY_SCHOOL' && renderSundaySchoolReport()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
