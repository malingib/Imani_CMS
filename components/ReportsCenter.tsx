
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

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const now = new Date();
    const joinedThisMonth = members.filter(member => {
      const joined = new Date(member.joinDate);
      return !Number.isNaN(joined.getTime()) && joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
    const eventsWithAttendance = events.filter(event => Array.isArray(event.attendance) && event.attendance.length > 0);
    const avgAttendance = eventsWithAttendance.length ? Math.round(eventsWithAttendance.reduce((sum, event) => sum + event.attendance.length, 0) / eventsWithAttendance.length) : null;
    return [
      { label: 'Recorded income', value: 'KES ' + totalIncome.toLocaleString(), color: 'emerald', icon: Wallet },
      { label: 'Recorded expenses', value: 'KES ' + totalExpenses.toLocaleString(), color: 'indigo', icon: BarChart3 },
      { label: 'Joined this month', value: joinedThisMonth.toLocaleString(), color: 'primary', icon: Users },
      { label: 'Avg. recorded attendance', value: avgAttendance === null ? '—' : avgAttendance.toLocaleString(), color: 'gold', icon: Calendar },
    ];
  }, [transactions, members, events]);

  const incomePieData = useMemo(() => {
    const income = transactions.filter(t => t.category === 'Income');
    const total = income.reduce((s, t) => s + t.amount, 0) || 1;
    const tithes = income.filter(t => t.type === 'Tithe').reduce((s, t) => s + t.amount, 0);
    const offerings = income.filter(t => t.type === 'Offering').reduce((s, t) => s + t.amount, 0);
    const projects = income.filter(t => t.type === 'Project').reduce((s, t) => s + t.amount, 0);
    const other = total - tithes - offerings - projects;
    return [
      { name: 'Tithes', value: Math.round(tithes / total * 100) },
      { name: 'Offerings', value: Math.round(offerings / total * 100) },
      { name: 'Projects', value: Math.round(projects / total * 100) },
      { name: 'Other', value: Math.round(other / total * 100) },
    ];
  }, [transactions]);

  const monthlyIncomeExpenseData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return !Number.isNaN(transactionDate.getTime()) && transactionDate.getFullYear() === date.getFullYear() && transactionDate.getMonth() === date.getMonth();
      });
      const income = monthTransactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);
      return { m: date.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }), i: Math.round(income / 1000), e: Math.round(expense / 1000) };
    });
  }, [transactions]);

  const membershipGrowthData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const count = members.filter(member => {
        const joined = new Date(member.joinDate);
        return !Number.isNaN(joined.getTime()) && joined.getFullYear() === date.getFullYear() && joined.getMonth() === date.getMonth();
      }).length;
      return { n: date.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }), m: count };
    });
  }, [members]);

  const attendanceChartData = useMemo(() => events
    .filter(event => !!event.date)
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-6)
    .map(event => ({ d: event.title, date: event.date, s: Array.isArray(event.attendance) ? event.attendance.length : 0 })), [events]);

  const sundaySchoolStats = useMemo(() => {
    const childrenCount = members.filter(member => (typeof member.age === 'number' && member.age <= 12) || member.groups.some(group => group.toLowerCase().includes('children'))).length;
    return [{ label: 'Registered children', val: childrenCount.toLocaleString(), icon: Baby, color: 'emerald' }];
  }, [members]);

  const childRegistrations = useMemo(() => members.filter(member =>
    (typeof member.age === 'number' && member.age <= 12) || member.groups.some(group => group.toLowerCase().includes('children'))
  ).slice().sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 20).map(child => ({
    n: child.firstName + ' ' + child.lastName,
    p: 'Not recorded',
    a: typeof child.age === 'number' ? (child.age <= 5 ? '3-5' : child.age <= 8 ? '6-8' : '9-12') + ' years' : '—',
    d: child.joinDate,
  })), [members]);

  const membershipStats = useMemo(() => {
    const activeCount = members.filter(member => member.status === 'ACTIVE').length;
    const nonActiveCount = members.length - activeCount;
    const now = new Date();
    const joinedThisMonth = members.filter(member => {
      const joined = new Date(member.joinDate);
      return !Number.isNaN(joined.getTime()) && joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
    return [
      { label: 'Active members', val: activeCount.toLocaleString(), icon: CheckCircle2, color: 'emerald' },
      { label: 'Non-active records', val: nonActiveCount.toLocaleString(), icon: ArrowDownRight, color: 'gold' },
      { label: 'Joined this month', val: joinedThisMonth.toLocaleString(), icon: ArrowUpRight, color: 'indigo' },
    ];
  }, [members]);

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
                  data={incomePieData}
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
            <Activity size={16} className="text-brand-indigo"/> Monthly Income vs Expenses
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeExpenseData}>
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
          <h4 className="font-semibold text-slate-900">Recent transaction records</h4>
          <span className="text-xs text-slate-500">Recorded transactions</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Transaction Ref</th>
              <th className="px-8 py-5">Member Payee</th>
              <th className="px-8 py-5">Record status</th>
              <th className="px-8 py-5 text-right">Amount</th>
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
                    <span className="text-xs text-slate-500">Recorded</span>
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
        {membershipStats.map((m, i) => (
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
        <h4 className="text-sm font-black uppercase text-slate-400 mb-6 px-2 tracking-[0.2em]">Membership Growth</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={membershipGrowthData}>
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
            <h4 className="text-base font-semibold text-slate-900">Attendance by event</h4>
            <p className="text-sm text-slate-500 mt-1">Counts reflect attendance lists saved on each event.</p>
          </div>

        </div>
        <div className="h-80">
          {attendanceChartData.some(event => event.s > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fill: "#64748b", fontSize: 11}} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="s" name="Recorded attendance" stroke="#334155" strokeWidth={2} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-500">No attendance has been recorded for recent events yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h4 className="font-semibold text-slate-900">Recorded attendance by event</h4>
          <p className="mt-1 text-sm text-slate-500">Only attendance explicitly saved to an event is counted.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              <tr><th className="px-5 py-3">Event</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Attendance records</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceChartData.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-500">No events have been recorded yet.</td></tr>
              ) : attendanceChartData.map((event, index) => (
                <tr key={event.date + "-" + event.d + "-" + index}>
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{event.d}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{event.date}</td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-slate-800">{event.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSundaySchoolReport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sundaySchoolStats.map((m, i) => (
          <div key={i} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-center">
            <div className={`mx-auto w-10 h-10 mb-3 bg-brand-${m.color}/10 text-brand-${m.color} rounded-xl flex items-center justify-center`}>
              <m.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.label}</p>
            <h5 className="text-2xl font-black text-slate-800 mt-1">{m.val}</h5>
          </div>
        ))}
      </div>

      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Attendance and lesson completion are not reported because those data are not currently tracked. This screen shows registered children only.</p>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <h4 className="font-semibold text-slate-900">Registered children</h4>
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
            {childRegistrations.length === 0 ? (
              <tr><td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">No children are registered by age or group.</td></tr>
            ) : childRegistrations.map((row, i) => (
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
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Reports</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">View reports on giving, attendance, and membership.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Printer size={16} /> Print view
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download size={16} /> Print / save PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tight">{s.value}</h4>
               </div>
               <div className={`p-3 bg-brand-${s.color}-50 text-brand-${s.color} rounded-xl`}>
                  <s.icon size={18} />
               </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-brand-${s.color} transition-all duration-700 w-full group-hover:h-2 opacity-50`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6 print:hidden">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-6 px-4 tracking-[0.2em]">Report Scope</p>
              {[
                { id: 'FINANCIAL', label: 'Financial', icon: Landmark, desc: 'Audit & Cashflow' },
                { id: 'MEMBERSHIP', label: 'Membership', icon: Users, desc: 'Status & growth' },
                { id: 'ATTENDANCE', label: 'Attendance', icon: BarChart3, desc: 'Recorded attendance' },
                { id: 'SUNDAY_SCHOOL', label: 'Sunday School', icon: Baby, desc: 'Children' },
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
                    <h4 className="text-xl font-black uppercase tracking-tight">AI Insights</h4>
                 </div>
                 <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                   Generate insights from your data.
                 </p>
                 <button 
                    onClick={handleGenerateAIInsight} 
                    disabled={isGeneratingAI} 
                    className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-gold hover:text-brand-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
                    {isGeneratingAI ? 'Processing...' : 'Generate Insights'}
                 </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
           </div>
        </div>

        <div className="lg:col-span-9 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-8 min-h-[600px]">
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
                       <h4 className="text-2xl font-black text-slate-800 tracking-tight">AI Analysis</h4>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Generated by AI</p>
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
                       <Calendar size={14}/> Period: All recorded data
                    </p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Report source</p>
                       <p className="text-sm font-medium text-slate-700">Saved church records</p>
                    </div>
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><FileText size={20}/></div>
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
