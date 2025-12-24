
import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, TrendingUp, TrendingDown, 
  Search, Wallet, Calendar, PieChart as PieIcon,
  Tag, Plus, X, Settings2, Smartphone, Repeat, 
  BarChart3, AlertCircle, Save, CheckCircle2,
  Loader2, Landmark, History, Search as SearchIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { Transaction, Member, Budget, RecurringExpense } from '../types';

interface FinanceReportingProps {
  transactions: Transaction[];
  members: Member[];
  onUpdateTransaction?: (updatedTrx: Transaction) => void;
  onAddTransaction: (trx: Transaction) => void;
  budgets: Budget[];
  onSetBudget: (budget: Budget) => void;
  recurringExpenses: RecurringExpense[];
  onAddRecurring: (expense: RecurringExpense) => void;
}

const FinanceReporting: React.FC<FinanceReportingProps> = ({ 
  transactions, 
  members, 
  onAddTransaction,
  budgets,
  onSetBudget,
  recurringExpenses,
  onAddRecurring
}) => {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMPesaModal, setShowMPesaModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // MPesa Form State
  const [mpesaForm, setMpesaForm] = useState({ memberId: '', amount: '', reference: '', phone: '' });
  
  const COLORS = ['#4F46E5', '#10B981', '#FFB800', '#8B5CF6'];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'All' || t.type === filterType;
      const matchesSearch = 
        t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.reference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const totalIncome = filtered.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  const handleRecordMPesa = () => {
    if (!mpesaForm.memberId || !mpesaForm.amount || !mpesaForm.reference) return;
    setIsRecording(true);
    
    setTimeout(() => {
      const member = members.find(m => m.id === mpesaForm.memberId);
      const newTrx: Transaction = {
        id: `trx${Date.now()}`,
        memberId: member?.id || 'visitor',
        memberName: member ? `${member.firstName} ${member.lastName}` : 'Guest Giver',
        amount: Number(mpesaForm.amount),
        type: 'Tithe', 
        paymentMethod: 'M-Pesa',
        date: new Date().toISOString().split('T')[0],
        reference: mpesaForm.reference.toUpperCase(),
        category: 'Income',
        phoneNumber: mpesaForm.phone
      };
      onAddTransaction(newTrx);
      setIsRecording(false);
      setShowMPesaModal(false);
      setMpesaForm({ memberId: '', amount: '', reference: '', phone: '' });
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Finance Center</h2>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Integrated M-Pesa reconciliation and budget integrity.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowMPesaModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20">
            <Smartphone size={18} /> Record M-Pesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        {[
          { label: 'Total Revenue', val: totalIncome, color: 'emerald', icon: TrendingUp },
          { label: 'Operational Cost', val: totalExpenses, color: 'gold', icon: TrendingDown },
          { label: 'Net Liquidity', val: totalIncome - totalExpenses, color: 'primary', icon: Landmark }
        ].map((c, i) => (
          <div key={i} className={`p-8 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm bg-white relative overflow-hidden group`}>
             <div className="relative z-10">
                <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 sm:mb-4">{c.label}</p>
                <h4 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter">KES {c.val.toLocaleString()}</h4>
                <div className={`mt-4 sm:mt-6 flex items-center gap-2 text-brand-${c.color}-500`}>
                   <c.icon size={16}/>
                   <span className="text-[9px] sm:text-[10px] font-black uppercase">Verified Status</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:w-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find record..." 
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer" onChange={e => setFilterType(e.target.value)}>
              <option value="All">All Transactions</option>
              <option value="Tithe">Tithes</option>
              <option value="Offering">Offerings</option>
              <option value="Expense">Expenses</option>
            </select>
          </div>

          <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-brand-primary uppercase tracking-tight">Audit Trail</h3>
                <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-indigo"><Download size={14}/> Export Ledger</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                   <thead className="bg-slate-50 text-[9px] sm:text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                      <tr>
                         <th className="px-6 sm:px-10 py-5 sm:py-6">Transaction Meta</th>
                         <th className="px-6 sm:px-10 py-5 sm:py-6">Payer Identity</th>
                         <th className="px-6 sm:px-10 py-5 sm:py-6">Category</th>
                         <th className="px-6 sm:px-10 py-5 sm:py-6 text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filtered.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                           <td className="px-6 sm:px-10 py-6 sm:py-8">
                              <p className="font-mono text-[9px] sm:text-[10px] text-brand-indigo font-black mb-1">{t.reference}</p>
                              <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">{t.date}</p>
                           </td>
                           <td className="px-6 sm:px-10 py-6 sm:py-8">
                              <p className="font-black text-slate-700 text-xs sm:text-sm">{t.memberName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                                 <span className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-tighter">{t.paymentMethod}</span>
                              </div>
                           </td>
                           <td className="px-6 sm:px-10 py-6 sm:py-8">
                              <span className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${t.category === 'Income' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-gold/10 text-brand-gold'}`}>
                                 {t.type}
                              </span>
                           </td>
                           <td className={`px-6 sm:px-10 py-6 sm:py-8 text-right font-black text-lg sm:text-xl ${t.category === 'Expense' ? 'text-brand-gold' : 'text-slate-900'}`}>
                             {t.category === 'Expense' ? '-' : ''}{t.amount.toLocaleString()}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
           <div className="bg-brand-primary p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-6 sm:mb-8">Quarterly Stewardship</h4>
              <div className="h-56 sm:h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={[{n:'Income',v:totalIncome},{n:'Costs',v:totalExpenses}]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={10} dataKey="v">
                          <Cell fill="#10B981" />
                          <Cell fill="#FFB800" />
                       </Pie>
                       <Tooltip contentStyle={{borderRadius:'16px', color:'#000', padding: '12px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
                 <div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Rate</p>
                    <p className="text-base sm:text-lg font-black text-brand-emerald">+12.4%</p>
                 </div>
                 <div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Burn Rate</p>
                    <p className="text-base sm:text-lg font-black text-brand-gold">14.2%</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-indigo-50 text-brand-indigo rounded-2xl"><Landmark size={32}/></div>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">KRA Tax Filing</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">Generate Section 13 (2) compliant donation certificates for congregants instantly.</p>
              <button className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline">Start Certificate Generator</button>
           </div>
        </div>
      </div>

      {/* Record M-Pesa Modal - Responsive Adjusted */}
      {showMPesaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white h-full sm:h-auto sm:rounded-[3.5rem] w-full sm:max-w-xl shadow-2xl p-8 sm:p-12 space-y-8 animate-in zoom-in duration-200 overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="p-3 sm:p-4 bg-indigo-50 text-brand-indigo rounded-2xl flex-shrink-0"><Smartphone size={24}/></div>
                   <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase leading-tight">M-Pesa Reconciliation</h3>
                      <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1">Manual Audit Correction</p>
                   </div>
                </div>
                <button onClick={() => setShowMPesaModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={24}/></button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Member / Contributor</label>
                   <select 
                     className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-inner"
                     value={mpesaForm.memberId}
                     onChange={e => setMpesaForm({...mpesaForm, memberId: e.target.value})}
                   >
                      <option value="">Select Member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                      <option value="guest">Guest Giver / Visitor</option>
                   </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Transaction Ref</label>
                      <input 
                        className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[1.5rem] font-black uppercase text-brand-primary placeholder:opacity-30 outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g. QSG812L90P"
                        value={mpesaForm.reference}
                        onChange={e => setMpesaForm({...mpesaForm, reference: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Amount (KES)</label>
                      <input 
                        type="number"
                        className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[1.5rem] font-black outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="0.00"
                        value={mpesaForm.amount}
                        onChange={e => setMpesaForm({...mpesaForm, amount: e.target.value})}
                      />
                   </div>
                </div>

                <div className="p-5 sm:p-6 bg-brand-primary/5 rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-brand-indigo/20 flex items-start gap-4">
                   <AlertCircle className="text-brand-indigo shrink-0 mt-1" size={18}/>
                   <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed">Ensure the Reference matches the Safaricom SMS exactly. This entry is logged for secondary board verification during month-end closing.</p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={() => setShowMPesaModal(false)} className="w-full sm:flex-1 py-4 sm:py-5 font-black text-slate-400 hover:bg-slate-50 rounded-xl sm:rounded-[1.5rem] uppercase text-[10px] sm:text-xs tracking-widest order-2 sm:order-1">Discard</button>
                <button 
                  onClick={handleRecordMPesa}
                  disabled={isRecording || !mpesaForm.reference}
                  className="w-full sm:flex-[2] py-4 sm:py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 order-1 sm:order-2"
                >
                  {isRecording ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>} {isRecording ? 'Reconciling...' : 'Confirm Entry'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReporting;
