
import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, TrendingUp, TrendingDown, 
  Search, Wallet, Calendar, PieChart as PieIcon,
  Tag, Plus, X, Settings2, Smartphone, Repeat, 
  BarChart3, AlertCircle, Save, CheckCircle2,
  Loader2, Landmark, History, Search as SearchIcon,
  Banknote, MoreHorizontal, Edit2, Trash2, Eye,
  ArrowUpRight, ArrowDownRight, Sparkles, Receipt,
  Printer, ShieldCheck, CreditCard, ChevronDown,
  Clock, CalendarClock, BellRing, Target, User,
  PauseCircle, PlayCircle, AlertTriangle, Heart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { Transaction, Member, Budget, RecurringExpense, RecurringContribution, UserRole, TransactionType } from '../types';

interface FinanceReportingProps {
  transactions: Transaction[];
  members: Member[];
  onAddTransaction: (trx: Transaction) => void;
  onUpdateTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  budgets: Budget[];
  onSetBudget: (budget: Budget) => void;
  recurringExpenses: RecurringExpense[];
  onAddRecurringExpense: (expense: RecurringExpense) => void;
  recurringContributions: RecurringContribution[];
  onAddRecurringContribution: (contribution: RecurringContribution) => void;
  currentUserRole: UserRole;
}

type FinanceTab = 'LEDGER' | 'RECURRING' | 'BUDGETS';

const FinanceReporting: React.FC<FinanceReportingProps> = ({ 
  transactions, 
  members, 
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  budgets,
  onSetBudget,
  recurringExpenses,
  onAddRecurringExpense,
  recurringContributions,
  onAddRecurringContribution,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('LEDGER');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState<Transaction | 'NEW_INCOME' | 'NEW_EXPENSE' | null>(null);
  const [showRecurringModal, setShowRecurringModal] = useState<'EXPENSE' | 'CONTRIBUTION' | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'Tithe',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    memberName: '',
    category: 'Income'
  });

  const [recurringFormData, setRecurringFormData] = useState<any>({
    frequency: 'Monthly',
    amount: 0,
    category: 'Utility',
    recipient: '',
    memberName: '',
    memberId: '',
    type: 'Tithe',
    nextDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'All' || t.type === filterType;
      const matchesSearch = 
        t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.reference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const totalIncome = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  const isDueSoon = (dateStr: string) => {
    const today = new Date();
    const dueDate = new Date(dateStr);
    const diff = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const handleOpenForm = (mode: 'NEW_INCOME' | 'NEW_EXPENSE' | Transaction) => {
    if (typeof mode === 'string') {
      setFormData({
        type: mode === 'NEW_INCOME' ? 'Tithe' : 'Salary',
        paymentMethod: mode === 'NEW_INCOME' ? 'M-Pesa' : 'Bank Transfer',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        memberName: '',
        category: mode === 'NEW_INCOME' ? 'Income' : 'Expense',
        reference: mode === 'NEW_INCOME' ? '' : `EXP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });
      setShowFormModal(mode);
    } else {
      setFormData(mode);
      setShowFormModal(mode);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      if (typeof showFormModal !== 'string' && showFormModal) {
        onUpdateTransaction({ ...showFormModal, ...formData } as Transaction);
      } else {
        const newTrx: Transaction = {
          ...formData as Transaction,
          id: `trx-${Date.now()}`,
          source: 'MANUAL',
          reference: formData.paymentMethod === 'Cash' && !formData.reference 
            ? `CSH-${Math.random().toString(36).substr(2, 6).toUpperCase()}` 
            : formData.reference || `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        };
        onAddTransaction(newTrx);
      }
      setIsProcessing(false);
      setShowFormModal(null);
    }, 1000);
  };

  const handleRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      if (showRecurringModal === 'EXPENSE') {
        onAddRecurringExpense({
          id: `rec-exp-${Date.now()}`,
          category: recurringFormData.category,
          recipient: recurringFormData.recipient,
          amount: parseFloat(recurringFormData.amount),
          frequency: recurringFormData.frequency,
          nextDate: recurringFormData.nextDate,
          status: 'ACTIVE'
        });
      } else {
        const selectedMember = members.find(m => m.id === recurringFormData.memberId);
        onAddRecurringContribution({
          id: `rec-con-${Date.now()}`,
          memberId: recurringFormData.memberId,
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Guest',
          type: recurringFormData.type,
          amount: parseFloat(recurringFormData.amount),
          frequency: recurringFormData.frequency,
          nextDueDate: recurringFormData.nextDate,
          status: 'ACTIVE'
        });
      }
      setIsProcessing(false);
      setShowRecurringModal(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Finance Management</h2>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Full-cycle financial control: M-Pesa, Cash, and Scheduled transactions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={() => handleOpenForm('NEW_EXPENSE')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white text-brand-gold border border-brand-gold/20 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-brand-gold/5 transition-all shadow-sm"
              >
                <TrendingDown size={18} /> Record Expense
              </button>
              <button 
                onClick={() => handleOpenForm('NEW_INCOME')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20"
              >
                <Plus size={18} /> Record Income
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.8rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar glass-card self-start">
        {[
          { id: 'LEDGER', label: 'Main Ledger', icon: Receipt },
          { id: 'RECURRING', label: 'Scheduled', icon: CalendarClock },
          { id: 'BUDGETS', label: 'Budgets', icon: Target }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FinanceTab)}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                : 'text-slate-400 hover:text-brand-primary'
            }`}
          >
            <tab.icon size={16}/> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'LEDGER' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { label: 'Total Revenue', val: totalIncome, color: 'emerald', icon: TrendingUp, trend: '+14%' },
              { label: 'Operating Costs', val: totalExpenses, color: 'gold', icon: TrendingDown, trend: '-2%' },
              { label: 'Net Cash Position', val: totalIncome - totalExpenses, color: 'primary', icon: Landmark, trend: '+8%' }
            ].map((c, i) => (
              <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white relative overflow-hidden group hover:shadow-xl transition-all">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 bg-brand-${c.color}-50 text-brand-${c.color}-500 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                        <c.icon size={24}/>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${c.trend.startsWith('+') ? 'text-brand-emerald' : 'text-brand-gold'}`}>{c.trend}</p>
                        <p className="text-[8px] text-slate-300 font-bold uppercase">vs last month</p>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{c.label}</p>
                    <h4 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">KES {c.val.toLocaleString()}</h4>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm min-h-[500px]">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-xl font-black text-brand-primary uppercase tracking-tight">Financial Ledger</h3>
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                      <input className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                   </div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6">Transaction Meta</th>
                      <th className="px-10 py-6">Payer / Recipient</th>
                      <th className="px-10 py-6">Type</th>
                      <th className="px-10 py-6 text-right">Settled (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-10 py-8">
                           <p className="font-mono text-[10px] text-brand-indigo font-black">{t.reference}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">{t.date}</p>
                        </td>
                        <td className="px-10 py-8 font-black text-slate-700 text-sm">{t.memberName}</td>
                        <td className="px-10 py-8">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${t.category === 'Income' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-gold/10 text-brand-gold'}`}>
                              {t.type}
                           </span>
                        </td>
                        <td className={`px-10 py-8 text-right font-black text-lg ${t.category === 'Expense' ? 'text-brand-gold' : 'text-slate-900'}`}>
                           {t.category === 'Expense' ? '-' : ''}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'RECURRING' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Recurring Expenses (Debits) */}
             <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-brand-gold/10 text-brand-gold rounded-2xl"><TrendingDown size={28}/></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Scheduled Expenses</h3>
                         <p className="text-slate-400 text-xs font-bold uppercase">Automated Utilities & Salaries</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowRecurringModal('EXPENSE')}
                     className="p-3 bg-brand-primary text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-brand-primary/20"
                   >
                      <Plus size={20}/>
                   </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                   {recurringExpenses.length > 0 ? recurringExpenses.map(exp => (
                      <div key={exp.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                         <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-brand-gold ${isDueSoon(exp.nextDate) ? 'ring-2 ring-brand-gold' : ''}`}>
                               <CalendarClock size={24}/>
                            </div>
                            <div>
                               <p className="font-black text-slate-800">{exp.recipient}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400">{exp.category} • {exp.frequency}</span>
                                  {isDueSoon(exp.nextDate) && (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded border border-rose-100 animate-pulse">Due Soon</span>
                                  )}
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-black text-brand-gold">KES {exp.amount.toLocaleString()}</p>
                            <p className="text-[9px] font-black uppercase text-slate-300">Next: {exp.nextDate}</p>
                         </div>
                      </div>
                   )) : (
                      <div className="py-20 text-center space-y-4">
                         <AlertTriangle className="mx-auto text-slate-200" size={48}/>
                         <p className="text-slate-400 font-bold uppercase text-xs">No recurring expenses configured</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Recurring Contributions (Credits) */}
             <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      {/* Fixed: Use Heart icon after adding it to imports */}
                      <div className="p-4 bg-brand-emerald/10 text-brand-emerald rounded-2xl"><Heart size={28}/></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Scheduled Giving</h3>
                         <p className="text-slate-400 text-xs font-bold uppercase">Automated Tithes & Pledges</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowRecurringModal('CONTRIBUTION')}
                     className="p-3 bg-brand-primary text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-brand-primary/20"
                   >
                      <Plus size={20}/>
                   </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                   {recurringContributions.length > 0 ? recurringContributions.map(con => (
                      <div key={con.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-brand-indigo">
                               <Smartphone size={24}/>
                            </div>
                            <div>
                               <p className="font-black text-slate-800">{con.memberName}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400">{con.type} • {con.frequency}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-black text-brand-emerald">KES {con.amount.toLocaleString()}</p>
                            <p className="text-[9px] font-black uppercase text-slate-300">Next: {con.nextDueDate}</p>
                         </div>
                      </div>
                   )) : (
                      <div className="py-20 text-center space-y-4">
                         <Sparkles className="mx-auto text-slate-200" size={48}/>
                         <p className="text-slate-400 font-bold uppercase text-xs">No scheduled givers found</p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="p-10 bg-brand-primary rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10 grid md:grid-cols-3 gap-12 items-center">
                <div className="space-y-6">
                   <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                      <Landmark size={24} className="text-brand-gold"/> Projected Monthly
                   </h4>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-indigo-300">Net Commitments</p>
                      <h5 className="text-5xl font-black tracking-tighter">KES {(recurringContributions.reduce((s,c)=>s+c.amount,0) - recurringExpenses.reduce((s,e)=>s+e.amount,0)).toLocaleString()}</h5>
                   </div>
                </div>
                <div className="md:col-span-2">
                   <p className="text-lg font-medium text-indigo-100 leading-relaxed italic border-l-4 border-white/20 pl-8">
                     "Faithful stewardship leads to sustainable ministry. Scheduled transactions ensure our essential operations are covered while allowing congregants to give consistently without friction."
                   </p>
                </div>
             </div>
             <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 transition-transform duration-1000 group-hover:scale-110"></div>
          </div>
        </div>
      )}

      {/* Forms & Modals */}
      {showRecurringModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
               <form onSubmit={handleRecurringSubmit} className="p-10 sm:p-14 space-y-10">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                           <Repeat size={32}/>
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                              {showRecurringModal === 'EXPENSE' ? 'Schedule Expense' : 'Automated Contribution'}
                           </h3>
                           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Kingdom Continuity Engine</p>
                        </div>
                     </div>
                     <button type="button" onClick={() => setShowRecurringModal(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all">
                        <X size={24}/>
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {showRecurringModal === 'EXPENSE' ? (
                        <>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Recipient / Payee</label>
                              <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="e.g. Kenya Power" value={recurringFormData.recipient} onChange={e => setRecurringFormData({...recurringFormData, recipient: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={recurringFormData.category} onChange={e => setRecurringFormData({...recurringFormData, category: e.target.value})}>
                                 <option>Utility</option>
                                 <option>Salary</option>
                                 <option>Maintenance</option>
                                 <option>Rent</option>
                              </select>
                           </div>
                        </>
                     ) : (
                        <>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Member Identity</label>
                              <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={recurringFormData.memberId} onChange={e => setRecurringFormData({...recurringFormData, memberId: e.target.value})}>
                                 <option value="">Select Member</option>
                                 {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sacrifice Type</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={recurringFormData.type} onChange={e => setRecurringFormData({...recurringFormData, type: e.target.value as TransactionType})}>
                                 <option>Tithe</option>
                                 <option>Offering</option>
                                 <option>Project</option>
                              </select>
                           </div>
                        </>
                     )}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Settlement Amount (KES)</label>
                        <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl" value={recurringFormData.amount} onChange={e => setRecurringFormData({...recurringFormData, amount: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cycle Frequency</label>
                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={recurringFormData.frequency} onChange={e => setRecurringFormData({...recurringFormData, frequency: e.target.value})}>
                           <option>Weekly</option>
                           <option>Monthly</option>
                           <option>Quarterly</option>
                           <option>Yearly</option>
                        </select>
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First/Next Cycle Date</label>
                        <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={recurringFormData.nextDate} onChange={e => setRecurringFormData({...recurringFormData, nextDate: e.target.value})} />
                     </div>
                  </div>

                  <div className="p-6 bg-brand-primary/5 rounded-[2rem] border border-dashed border-brand-primary/20 flex items-start gap-4">
                     <BellRing className="text-brand-primary shrink-0 mt-1" size={20}/>
                     <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        Setting up a recurring profile will generate an internal ledger request 48 hours before the due date. {showRecurringModal === 'CONTRIBUTION' ? 'Automated STK push will be triggered.' : 'Treasury will be alerted for settlement.'}
                     </p>
                  </div>

                  <div className="flex gap-4">
                     <button type="button" onClick={() => setShowRecurringModal(null)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Cancel</button>
                     <button 
                        disabled={isProcessing}
                        className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
                        Confirm Schedule
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Transaction Entry/Modify Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <form onSubmit={handleFormSubmit} className="p-10 sm:p-14 space-y-8">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-xl ${formData.category === 'Income' ? 'bg-brand-emerald text-white' : 'bg-brand-gold text-white'}`}>
                       {formData.category === 'Income' ? <TrendingUp size={28}/> : <TrendingDown size={28}/>}
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{typeof showFormModal !== 'string' ? 'Modify Transaction' : `Record ${formData.category}`}</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Ledger Integrity Framework</p>
                    </div>
                 </div>
                 <button type="button" onClick={() => setShowFormModal(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category Type</label>
                  <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    {formData.category === 'Income' ? (
                      ['Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence'].map(t => <option key={t} value={t}>{t}</option>)
                    ) : (
                      ['Expense', 'Salary', 'Utility', 'Maintenance'].map(t => <option key={t} value={t}>{t}</option>)
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Settlement Date</label>
                  <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{formData.category === 'Income' ? 'Member Name' : 'Payee / Recipient'}</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder={formData.category === 'Income' ? "e.g. Mary Wambui" : "e.g. Kenya Power"} value={formData.memberName} onChange={e => setFormData({...formData, memberName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Amount (KES)</label>
                  <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Method</label>
                  <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}>
                    <option>M-Pesa</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowFormModal(null)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Discard</button>
                <button disabled={isProcessing} className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>} {typeof showFormModal !== 'string' ? 'Update Ledger' : 'Post Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReporting;
