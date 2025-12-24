
import React, { useState, useMemo } from 'react';
import { 
  Wallet, TrendingUp, History, Smartphone, 
  ArrowRight, CheckCircle2, Calendar, 
  Download, Filter, Plus, SmartphoneNfc,
  Heart, Landmark, Info, Zap, Loader2, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Member, Transaction } from '../types';

interface MyGivingProps {
  member: Member;
  transactions: Transaction[];
  onGive: () => void;
}

const MyGiving: React.FC<MyGivingProps> = ({ member, transactions, onGive }) => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftType, setGiftType] = useState('Tithe');
  const [isProcessing, setIsProcessing] = useState(false);

  const myGifts = useMemo(() => {
    return transactions
      .filter(t => t.memberId === member.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, member.id]);

  const totalGiving = myGifts.reduce((sum, t) => sum + t.amount, 0);
  const lastGift = myGifts[0];

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    myGifts.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + t.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [myGifts]);

  const handleMpesaTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftAmount) return;
    setIsProcessing(true);
    // Simulate STK Push
    setTimeout(() => {
      setIsProcessing(false);
      setShowGiftModal(false);
      onGive();
      setGiftAmount('');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Stewardship Portal</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Tracking your faithful support for the ministry.</p>
        </div>
        <button 
          onClick={() => setShowGiftModal(true)}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-brand-indigo transition-all shadow-2xl shadow-brand-primary/20"
        >
          <Smartphone size={20} className="text-brand-gold" /> Initiate M-Pesa Gift
        </button>
      </header>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group col-span-1 lg:col-span-2">
           <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                 <div className="p-4 bg-white/10 rounded-2xl text-brand-gold backdrop-blur-md">
                    <Heart size={32} fill="currentColor"/>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em]">Member ID</p>
                    <p className="text-sm font-bold text-white font-mono">#{member.id.padStart(6, '0')}</p>
                 </div>
              </div>
              <div>
                 <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Total Contributions</p>
                 <h3 className="text-5xl sm:text-7xl font-black tracking-tighter">KES {totalGiving.toLocaleString()}</h3>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-gold"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Stewardship</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-indigo-300"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Audited Ledger</span>
                 </div>
              </div>
           </div>
           <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] bg-brand-indigo rounded-full blur-[100px] opacity-20 group-hover:scale-125 transition-transform duration-1000"></div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Last Gift Summary</p>
              {lastGift ? (
                <div className="space-y-6">
                   <div>
                      <h4 className="text-3xl font-black text-slate-800 tracking-tight">KES {lastGift.amount.toLocaleString()}</h4>
                      <p className="text-xs font-bold text-brand-primary mt-1">{lastGift.type} • {lastGift.date}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">M-Pesa Reference</p>
                      <p className="text-sm font-black text-slate-700 font-mono tracking-wider">{lastGift.reference}</p>
                   </div>
                </div>
              ) : (
                <p className="text-slate-300 font-bold italic">No records found yet.</p>
              )}
           </div>
           <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 mt-8">
              <Download size={14}/> Annual Statement
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Breakdown */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
           <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <Landmark className="text-brand-indigo" size={20}/> Gift Distribution
           </h4>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <Tooltip 
                       contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={32}>
                       {categoryData.map((_, i) => <Cell key={i} fill={['#4F46E5', '#10B981', '#FFB800', '#1E293B'][i % 4]} />)}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <div className="flex items-start gap-4">
                 <Info className="text-brand-indigo shrink-0" size={18}/>
                 <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Your contributions help support our mission in <span className="text-brand-primary font-black">{member.location}</span> and beyond. God loves a cheerful giver!
                 </p>
              </div>
           </div>
        </div>

        {/* Detailed List */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Audit Trail</h4>
              <div className="flex gap-2">
                 <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-primary transition-all"><Filter size={18}/></button>
                 <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-primary transition-all"><Download size={18}/></button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <tr>
                       <th className="px-10 py-6">Reference & Channel</th>
                       <th className="px-10 py-6">Category</th>
                       <th className="px-10 py-6">Date Processed</th>
                       <th className="px-10 py-6 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {myGifts.map((t, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-10 py-8">
                             <p className="font-mono text-xs text-brand-indigo font-black mb-1">{t.reference}</p>
                             <div className="flex items-center gap-1.5">
                                <Smartphone size={10} className="text-slate-300"/>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t.paymentMethod}</span>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {t.type}
                             </span>
                          </td>
                          <td className="px-10 py-8 text-xs font-bold text-slate-500">{t.date}</td>
                          <td className="px-10 py-8 text-right font-black text-slate-900 text-lg">KES {t.amount.toLocaleString()}</td>
                       </tr>
                    ))}
                    {myGifts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                           <Landmark size={48} className="mx-auto text-slate-200 mb-4" />
                           <p className="text-slate-400 font-bold uppercase tracking-widest">No contribution history found</p>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

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
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Safe & Instant Kingdom Giving</p>
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
                          Upon clicking 'Initiate Push', you will receive an STK prompt on your phone <span className="font-black text-brand-primary">{member.phone}</span>. Please enter your PIN to complete the gift.
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
