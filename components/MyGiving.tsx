import React, { useMemo, useState } from 'react';
import { Wallet, Smartphone, Printer, X, Search, Target, Zap, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Member, Transaction, StewardshipPledge } from '../types';

interface MyGivingProps { member: Member | null; transactions: Transaction[]; onGive: () => void; }

const MyGiving: React.FC<MyGivingProps> = ({ member, transactions, onGive }) => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftType, setGiftType] = useState('Tithe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const myGifts = useMemo(() => {
    if (!member) return [];
    const query = searchTerm.toLowerCase();
    return transactions.filter(t => t.memberId === member.id).filter(t => {
      const matchesSearch = t.reference.toLowerCase().includes(query) || t.type.toLowerCase().includes(query);
      return matchesSearch && (typeFilter === 'All' || t.type === typeFilter) && t.date.startsWith(yearFilter);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, member, searchTerm, typeFilter, yearFilter]);

  const pledges: StewardshipPledge[] = useMemo(() => {
    if (!member) return [];
    const totals = myGifts.reduce<Record<string, number>>((acc, t) => { acc[t.type] = (acc[t.type] || 0) + t.amount; return acc; }, {});
    const generated = Object.entries(totals).filter(([, total]) => total > 0).map(([category, total]) => ({ id: `pledge-${category}`, memberId: member.id, category: category as StewardshipPledge['category'], targetAmount: Math.round(total * 1.3), period: 'Yearly' as const, startDate: `${yearFilter}-01-01`, status: 'ACTIVE' as const }));
    return generated.length ? generated : [{ id: 'pledge-default', memberId: member.id, category: 'Tithe', targetAmount: 60000, period: 'Yearly', startDate: `${yearFilter}-01-01`, status: 'ACTIVE' }];
  }, [member, myGifts, yearFilter]);

  if (!member) return <div className="flex flex-col items-center justify-center py-20"><div className="bg-white rounded-[2.5rem] shadow-xl p-12 max-w-md text-center"><h2 className="text-2xl font-black text-brand-primary mb-2">No Member Record</h2><p className="text-slate-500 font-medium">Your account is not linked to a church member profile. Contact your church admin to link your account.</p></div></div>;

  const totalGivingYear = myGifts.reduce((sum, t) => sum + t.amount, 0);
  const monthlyTrendData = Array.from({ length: 6 }, (_, idx) => ({ month: new Date(2024, idx).toLocaleString('en', { month: 'short' }), amount: myGifts.filter(t => new Date(t.date).getMonth() === idx).reduce((s, t) => s + t.amount, 0) }));

  const handleMpesaTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftAmount) return;
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setShowGiftModal(false); onGive(); setGiftAmount(''); }, 500);
  };

  return <div className="space-y-8 animate-in fade-in duration-500 pb-20">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><div className="flex items-center gap-3 mb-2"><Wallet className="text-brand-primary" size={28}/><h2 className="text-4xl font-black text-brand-primary uppercase">Giving</h2></div><p className="text-slate-500 font-medium">Track your tithes, offerings, pledges and giving history.</p></div><button onClick={() => setShowGiftModal(true)} className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">Give via M-Pesa</button></header>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><section className="lg:col-span-2 bg-brand-primary text-white rounded-[2.5rem] p-8"><p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Giving in {yearFilter}</p><h3 className="text-5xl font-black mt-3">KES {totalGivingYear.toLocaleString()}</h3><div className="h-40 mt-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyTrendData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis hide/><Tooltip/><Bar dataKey="amount" fill="#FFB800" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></section><section className="bg-white rounded-[2.5rem] border border-slate-100 p-7 shadow-sm"><div className="flex items-center gap-3"><Target className="text-brand-indigo"/><h3 className="text-xl font-black">Pledges</h3></div><div className="mt-6 space-y-5">{pledges.map(p => { const current = myGifts.filter(t => t.type === p.category).reduce((s,t) => s+t.amount,0); const progress = Math.min((current / p.targetAmount) * 100, 100); return <div key={p.id}><div className="flex justify-between text-xs font-black"><span>{p.category}</span><span>{Math.round(progress)}%</span></div><div className="h-2 bg-slate-100 rounded-full mt-2"><div className="h-full bg-brand-primary rounded-full" style={{ width: `${progress}%` }}/></div><p className="text-[9px] text-slate-400 font-bold mt-1">KES {current.toLocaleString()} / {p.targetAmount.toLocaleString()}</p></div>; })}</div></section></div>
    <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"><div className="p-7 border-b border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"><h3 className="text-2xl font-black uppercase">Giving History</h3><div className="flex gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search reference" className="pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold"/></div><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold"><option>All</option><option>Tithe</option><option>Offering</option><option>Project</option><option>Benevolence</option></select><input value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="w-24 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold"/></div></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="px-7 py-4">Type</th><th className="px-7 py-4">Date</th><th className="px-7 py-4">Reference</th><th className="px-7 py-4 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{myGifts.map(t => <tr key={t.id}><td className="px-7 py-5 font-black">{t.type}</td><td className="px-7 py-5 text-xs text-slate-500">{t.date}</td><td className="px-7 py-5 font-mono text-xs text-brand-indigo">{t.reference}</td><td className="px-7 py-5 text-right font-black">KES {t.amount.toLocaleString()}</td></tr>)}{myGifts.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-bold">No matching ledger entries.</td></tr>}</tbody></table></div></section>
    {showStatementModal && <div className="fixed inset-0 z-[600] bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white rounded-[2rem] p-8 max-w-xl w-full"><div className="flex justify-between"><h3 className="text-2xl font-black">Annual Statement</h3><button onClick={() => setShowStatementModal(false)}><X/></button></div><div className="mt-6 space-y-3 text-sm"><p>Member: <b>{member.firstName} {member.lastName}</b></p><p>Total given: <b>KES {totalGivingYear.toLocaleString()}</b></p></div><button onClick={() => window.print()} className="mt-7 w-full py-4 bg-brand-primary text-white rounded-xl font-black"><Printer className="inline mr-2" size={17}/>Print Statement</button></div></div>}
    {showGiftModal && <div className="fixed inset-0 z-[600] bg-slate-900/60 flex items-center justify-center p-4"><form onSubmit={handleMpesaTrigger} className="bg-white rounded-[2rem] p-8 max-w-lg w-full space-y-6"><div className="flex justify-between"><h3 className="text-2xl font-black">M-Pesa Express</h3><button type="button" onClick={() => setShowGiftModal(false)}><X/></button></div><div className="grid grid-cols-2 gap-3">{['Tithe','Offering','Project','Benevolence'].map(type => <button key={type} type="button" onClick={() => setGiftType(type)} className={`p-3 rounded-xl font-black text-xs ${giftType === type ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{type}</button>)}</div><input required type="number" min="1" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} placeholder="Amount (KES)" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 font-black text-2xl"/><div className="p-4 rounded-xl bg-emerald-50 text-sm text-slate-600 flex gap-2"><Zap size={18} className="text-emerald-600"/>An STK Push will be initiated for {member.phone}.</div><button disabled={isProcessing} className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black">{isProcessing ? <Loader2 className="animate-spin mx-auto"/> : 'Initiate STK Push'}</button></form></div>}
  </div>;
};

export default MyGiving;
