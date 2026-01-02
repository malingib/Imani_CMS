
import React, { useState, useMemo } from 'react';
import { 
  Wallet, TrendingUp, History, Smartphone, 
  ArrowRight, CheckCircle2, Calendar, 
  Download, Filter, Plus, SmartphoneNfc,
  Heart, Landmark, Info, Zap, Loader2, X,
  Printer, FileText, ShieldCheck, Target,
  ArrowUpRight, BarChart3, ListFilter, Search,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Member, Transaction, StewardshipPledge } from '../types';

interface MyGivingProps {
  member: Member;
  transactions: Transaction[];
  onGive: () => void;
}

const MyGiving: React.FC<MyGivingProps> = ({ member, transactions, onGive }) => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftType, setGiftType] = useState('Tithe');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('2024');

  // Simulated Pledges for the member
  const pledges: StewardshipPledge[] = useMemo(() => [
    { id: 'p1', memberId: member.id, category: 'Tithe', targetAmount: 60000, period: 'Yearly', startDate: '2024-01-01', status: 'ACTIVE' },
    { id: 'p2', memberId: member.id, category: 'Project', targetAmount: 20000, period: 'Yearly', startDate: '2024-03-15', status: 'ACTIVE' },
  ], [member.id]);

  const myGifts = useMemo(() => {
    return transactions
      .filter(t => t.memberId === member.id)
      .filter(t => {
        const matchesSearch = t.reference.toLowerCase().includes(searchTerm.toLowerCase()) || t.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || t.type === typeFilter;
        const matchesYear = t.date.startsWith(yearFilter);
        return matchesSearch && matchesType && matchesYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, member.id, searchTerm, typeFilter, yearFilter]);

  const totalGivingYear = useMemo(() => 
    myGifts.filter(t => t.date.startsWith(yearFilter)).reduce((sum, t) => sum + t.amount, 0),
  [myGifts, yearFilter]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    myGifts.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + t.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [myGifts]);

  const monthlyTrendData = useMemo(() => [
    { month: 'Jan', amount: 4500 },
    { month: 'Feb', amount: 5200 },
    { month: 'Mar', amount: 4800 },
    { month: 'Apr', amount: 6100 },
    { month: 'May', amount: 5000 },
    { month: 'Jun', amount: 0 },
  ], []);

  const handleMpesaTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftAmount) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowGiftModal(false);
      onGive();
      setGiftAmount('');
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><Landmark size={28}/></div>
              <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Kingdom Stewardship</h2>
           </div>
           <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
             "Give, and it will be given to you." Securely track your tithes, offerings, and special project pledges.
           </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowGiftModal(true)}
             className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-5 bg-brand-primary text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-brand-indigo transition-all shadow-2xl shadow-brand-primary/20"
           >
             <Smartphone size={20} className="text-brand-gold animate-bounce" /> Give via M-Pesa
           </button>
        </div>
      </header>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Year Summary Card */}
         <div className="lg:col-span-8 bg-brand-primary p-10 lg:p-14 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 grid sm:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div>
                     <p className="text-[11px] font-black uppercase text-indigo-300 tracking-[0.25em] mb-3">Fiscal Year 2024</p>
                     <h3 className="text-6xl sm:text-7xl font-black tracking-tighter">KES {totalGivingYear.toLocaleString()}</h3>
                     <div className="flex items-center gap-2 mt-4 text-brand-emerald">
                        <ArrowUpRight size={20}/>
                        <span className="font-black text-sm">+12% from last period</span>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setShowStatementModal(true)} className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
                        <FileText size={14}/> Full Audit Statement
                     </button>
                  </div>
               </div>
               <div className="h-full flex flex-col justify-end">
                  <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrendData}>
                           <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="amount" stroke="#FFB800" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 text-center mt-4">6-Month Giving Pulse</p>
               </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[120%] bg-brand-indigo rounded-full blur-[100px] opacity-20"></div>
         </div>

         {/* Pledge Tracker Card */}
         <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <Target size={24} className="text-brand-indigo"/> Pledges
               </h4>
               <button className="p-2 bg-slate-50 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all"><Plus size={18}/></button>
            </div>
            <div className="space-y-6">
               {pledges.map(p => {
                 const current = myGifts.filter(t => t.type === p.category).reduce((s,t)=>s+t.amount, 0);
                 const progress = Math.min((current/p.targetAmount)*100, 100);
                 return (
                    <div key={p.id} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-sm font-black text-slate-800">{p.category} Target</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{p.period} Plan</p>
                          </div>
                          <p className="text-xs font-black text-brand-indigo">{Math.round(progress)}%</p>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-brand-primary rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
                       </div>
                       <p className="text-[9px] font-black uppercase text-slate-400">KES {current.toLocaleString()} / {p.targetAmount.toLocaleString()}</p>
                    </div>
                 );
               })}
            </div>
            <div className="pt-4 border-t border-slate-50">
               <div className="p-4 bg-brand-gold/5 rounded-2xl flex items-start gap-4">
                  <Zap className="text-brand-gold shrink-0 mt-1" size={16}/>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                     Your faithful pledges fund our <span className="text-brand-primary font-black">2024 Sanctuary Project</span>. Asante sana!
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Ledger & Ledger Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Sidebar Filtering / Analysis */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl"><BarChart3 size={20}/></div>
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Giving Split</h4>
               </div>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={32}>
                           {categoryData.map((_, i) => <Cell key={i} fill={['#4F46E5', '#10B981', '#FFB800', '#1E293B'][i % 4]} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[3rem] space-y-6">
               <h5 className="font-black text-slate-600 uppercase text-center tracking-tight flex items-center justify-center gap-2">
                  <ListFilter size={16}/> Ledger Filters
               </h5>
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
                     <select className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Tithe">Tithe</option>
                        <option value="Offering">Offering</option>
                        <option value="Project">Project</option>
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Year</label>
                     <select className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="2024">2024 Period</option>
                        <option value="2023">2023 Period</option>
                     </select>
                  </div>
               </div>
               <button onClick={() => { setTypeFilter('All'); setYearFilter('2024'); setSearchTerm(''); }} className="w-full py-4 text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline">Reset Ledger View</button>
            </div>
         </div>

         {/* Detailed Table */}
         <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 sm:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
               <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Personal Giving Ledger</h4>
               <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" 
                    placeholder="Search Reference..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="px-10 py-6">Transaction Meta</th>
                        <th className="px-10 py-6">Identity Key</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Settled Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {myGifts.length > 0 ? myGifts.map((t, i) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className={`p-3 rounded-xl ${t.type === 'Tithe' ? 'bg-indigo-50 text-brand-primary' : 'bg-emerald-50 text-brand-emerald'}`}>
                                    <SmartphoneNfc size={18}/>
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-800">{t.type}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t.date}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 font-mono text-xs text-brand-indigo font-black uppercase tracking-wider">{t.reference}</td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></div>
                                 <span className="text-[10px] font-black uppercase text-brand-emerald tracking-widest">Reconciled</span>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <p className="font-black text-slate-900 text-xl tracking-tight">KES {t.amount.toLocaleString()}</p>
                              <p className="text-[8px] text-slate-400 font-black uppercase mt-1">{t.paymentMethod}</p>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={4} className="py-40 text-center">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                                 <History size={40}/>
                              </div>
                              <p className="font-black text-slate-400 uppercase tracking-widest">No matching ledger entries</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Showing {myGifts.length} transactions</p>
               <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all"><ChevronDown className="rotate-90" size={20}/></button>
                  <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all"><ChevronDown className="-rotate-90" size={20}/></button>
               </div>
            </div>
         </div>
      </div>

      {/* Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl p-10 sm:p-14 space-y-10 animate-in zoom-in duration-200 border border-white/20">
              <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                       <FileText size={28}/>
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">Annual Statement</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">FY 2024 Stewardship Summary</p>
                    </div>
                 </div>
                 <button onClick={() => setShowStatementModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
              </div>

              <div className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Member Identity</span>
                    <span className="text-sm font-bold text-slate-800">{member.firstName} {member.lastName}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Total Tithes</span>
                    <span className="text-sm font-bold text-slate-800">KES {myGifts.filter(t=>t.type==='Tithe').reduce((s,t)=>s+t.amount,0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Other Gifts</span>
                    <span className="text-sm font-bold text-slate-800">KES {myGifts.filter(t=>t.type!=='Tithe').reduce((s,t)=>s+t.amount,0).toLocaleString()}</span>
                 </div>
                 <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-lg font-black uppercase text-brand-primary tracking-tight">Net Stewardship</span>
                    <span className="text-2xl font-black text-brand-primary">KES {totalGivingYear.toLocaleString()}</span>
                 </div>
              </div>

              <div className="p-6 bg-brand-emerald/5 rounded-2xl border border-brand-emerald/20 flex items-start gap-4">
                 <ShieldCheck className="text-brand-emerald shrink-0 mt-1" size={20}/>
                 <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                   This document is generated by Imani CMS and is KRA compliant for tax deduction claims under Section 13(2) of the Income Tax Act.
                 </p>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setShowStatementModal(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-[1.5rem] uppercase text-xs tracking-widest transition-all">Cancel</button>
                 <button onClick={() => window.print()} className="flex-[2] py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-brand-indigo transition-all">
                    <Printer size={20}/> Print Statement
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* M-Pesa Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-brand-primary/60 backdrop-blur-xl z-[600] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <form onSubmit={handleMpesaTrigger} className="p-10 sm:p-14 space-y-10">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-[1.5rem] shadow-sm flex-shrink-0">
                          <SmartphoneNfc size={28}/>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">M-Pesa Express</h3>
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Instant Kingdom Giving</p>
                       </div>
                    </div>
                    <button type="button" onClick={() => setShowGiftModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all">
                       <X size={24}/>
                    </button>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                       {(['Tithe', 'Offering', 'Project', 'Benevolence'] as const).map(type => (
                         <button 
                            key={type}
                            type="button"
                            onClick={() => setGiftType(type)}
                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${giftType === type ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                         >
                            {type}
                         </button>
                       ))}
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Amount to Gift (KES)</label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">K</div>
                          <input 
                            required
                            autoFocus
                            type="number" 
                            className="w-full pl-14 pr-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-3xl text-brand-primary outline-none focus:ring-4 focus:ring-brand-primary/10 shadow-inner"
                            placeholder="0"
                            value={giftAmount}
                            onChange={e => setGiftAmount(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="p-6 bg-brand-emerald/5 rounded-[2rem] border border-dashed border-brand-emerald/20 flex items-start gap-4">
                       <Zap className="text-brand-emerald shrink-0 mt-1" size={20} fill="currentColor"/>
                       <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          Enter PIN on handset <span className="font-black text-brand-primary">{member.phone}</span> when prompted. Payments are auto-reconciled to your ledger within 60 seconds.
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                       disabled={isProcessing || !giftAmount}
                       className="w-full py-6 bg-brand-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:bg-brand-indigo transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                       {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Smartphone size={24}/>}
                       {isProcessing ? 'Triggering...' : 'Initiate STK Push'}
                    </button>
                    <button type="button" onClick={() => setShowGiftModal(false)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:underline">Cancel & Return</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyGiving;
