
import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, TrendingUp, TrendingDown, 
  Search, Wallet, Calendar, PieChart as PieIcon,
  Tag, Plus, X, Settings2, Smartphone, Repeat, 
  BarChart3, AlertCircle, Save, CheckCircle2,
  Loader2, Landmark, History, Search as SearchIcon,
  Banknote, MoreHorizontal, Edit2, Trash2, Eye,
  ArrowUpRight, ArrowDownRight, Sparkles, Receipt,
  Printer, ShieldCheck, CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { Transaction, Member, Budget, RecurringExpense, UserRole, TransactionType } from '../types';

interface FinanceReportingProps {
  transactions: Transaction[];
  members: Member[];
  onAddTransaction: (trx: Transaction) => void;
  onUpdateTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  budgets: Budget[];
  onSetBudget: (budget: Budget) => void;
  recurringExpenses: RecurringExpense[];
  onAddRecurring: (expense: RecurringExpense) => void;
  currentUserRole: UserRole;
}

const FinanceReporting: React.FC<FinanceReportingProps> = ({ 
  transactions, 
  members, 
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  budgets,
  onSetBudget,
  recurringExpenses,
  onAddRecurring,
  currentUserRole
}) => {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState<Transaction | 'NEW_INCOME' | 'NEW_EXPENSE' | null>(null);
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

  const handleExportCSV = () => {
    const headers = "ID,Date,Reference,Payer/Recipient,Category,Type,Method,Source,Amount\n";
    const rows = filtered.map(t => 
      `${t.id},${t.date},${t.reference},${t.memberName},${t.category},${t.type},${t.paymentMethod},${t.source},${t.amount}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        // Update
        onUpdateTransaction({ ...showFormModal, ...formData } as Transaction);
      } else {
        // Create
        const newTrx: Transaction = {
          ...formData as Transaction,
          id: `trx-${Date.now()}`,
          source: 'MANUAL', // Manual entries from this form
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Finance Management</h2>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Full-cycle financial control: M-Pesa, Cash, and Expenses.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {[
          { label: 'Total Revenue', val: totalIncome, color: 'emerald', icon: TrendingUp, trend: '+14%' },
          { label: 'Operating Costs', val: totalExpenses, color: 'gold', icon: TrendingDown, trend: '-2%' },
          { label: 'Net Cash Position', val: totalIncome - totalExpenses, color: 'primary', icon: Landmark, trend: '+8%' }
        ].map((c, i) => (
          <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white relative overflow-hidden group hover:shadow-xl transition-all">
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 bg-brand-${c.color}-50 text-brand-${c.color}-500 rounded-2xl group-hover:scale-110 transition-transform`}>
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
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find records by name or reference..." 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
               <select className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer hover:border-brand-primary" onChange={e => setFilterType(e.target.value)}>
                <option value="All">All Transactions</option>
                <option value="Tithe">Tithes Only</option>
                <option value="Expense">Expenses Only</option>
                <option value="Offering">Offerings</option>
                <option value="Salary">Staff Salaries</option>
              </select>
              <button onClick={handleExportCSV} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                 <Download size={20}/>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm min-h-[500px]">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-xl font-black text-brand-primary uppercase tracking-tight">Main Ledger</h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                   <span className="text-[10px] font-black uppercase text-brand-emerald tracking-widest">Live Sync Active</span>
                </div>
             </div>
             
             {filtered.length > 0 ? (
               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                     <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                        <tr>
                           <th className="px-10 py-6">Transaction Meta</th>
                           <th className="px-10 py-6">Payer / Recipient</th>
                           <th className="px-10 py-6">Category</th>
                           <th className="px-10 py-6">Source</th>
                           <th className="px-10 py-6 text-right">Settled (KES)</th>
                           <th className="px-10 py-6"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filtered.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                             <td className="px-10 py-8">
                                <p className="font-mono text-[10px] text-brand-indigo font-black mb-1">{t.reference}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{t.date}</p>
                             </td>
                             <td className="px-10 py-8">
                                <p className="font-black text-slate-700 text-sm">{t.memberName}</p>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1 truncate max-w-[150px]">{t.notes || 'No notes'}</p>
                             </td>
                             <td className="px-10 py-8">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${t.category === 'Income' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-gold/10 text-brand-gold'}`}>
                                   {t.type}
                                </span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex flex-col">
                                   <span className={`text-[8px] font-black uppercase ${t.source === 'INTEGRATED' ? 'text-brand-indigo' : 'text-slate-400'}`}>
                                      {t.source}
                                   </span>
                                   <div className="flex items-center gap-2 mt-1">
                                      {t.paymentMethod === 'M-Pesa' ? <Smartphone size={12} className="text-brand-indigo"/> : <Banknote size={12} className="text-brand-emerald"/>}
                                      <span className="text-[10px] font-black text-slate-500 uppercase">{t.paymentMethod}</span>
                                   </div>
                                </div>
                             </td>
                             <td className={`px-10 py-8 text-right font-black text-lg ${t.category === 'Expense' ? 'text-brand-gold' : 'text-slate-900'}`}>
                               {t.category === 'Expense' ? '-' : ''}{t.amount.toLocaleString()}
                             </td>
                             <td className="px-6 py-8 text-right relative">
                                <button 
                                  onClick={() => setOpenActionId(openActionId === t.id ? null : t.id)}
                                  className="p-2 text-slate-300 hover:text-slate-600 transition-all"
                                >
                                   <MoreHorizontal size={20}/>
                                </button>
                                {openActionId === t.id && (
                                  <div className="absolute right-10 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                     <button 
                                      onClick={() => { setViewingTransaction(t); setOpenActionId(null); }}
                                      className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                                     >
                                        <Eye size={14} className="text-brand-primary"/> View Detail
                                     </button>
                                     {t.source === 'MANUAL' && (
                                       <>
                                         <button 
                                          onClick={() => { handleOpenForm(t); setOpenActionId(null); }}
                                          className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-brand-indigo/5 flex items-center gap-3 transition-colors border-b border-slate-50"
                                         >
                                            <Edit2 size={14} className="text-brand-indigo"/> Modify
                                         </button>
                                         <button 
                                          onClick={() => { setShowDeleteConfirm(t.id); setOpenActionId(null); }}
                                          className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                         >
                                            <Trash2 size={14} className="text-rose-500"/> Delete
                                         </button>
                                       </>
                                     )}
                                     {t.source === 'INTEGRATED' && (
                                       <div className="px-6 py-3 bg-slate-50">
                                          <p className="text-[8px] font-black uppercase text-slate-400 leading-tight">Immutable Record (Integrated)</p>
                                       </div>
                                     )}
                                  </div>
                                )}
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             ) : (
               <div className="py-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                     <History size={40} className="text-slate-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-400 uppercase">Ledger Empty</h4>
                    <p className="text-sm font-medium text-slate-300">Start recording transactions to see them here.</p>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Sparkles size={24}/></div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Financial AI Pulse</h4>
                 </div>
                 <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                   Current net position is <span className="text-white font-black">strong</span>. Expenses are 32% of total revenue. Recommended to allocate surplus to the Sanctuary Project.
                 </p>
                 <div className="pt-6 border-t border-white/10">
                    <button className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2">
                       Detailed Analysis <ArrowUpRight size={16}/>
                    </button>
                 </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-400 rounded-full blur-[80px] opacity-10" />
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                 <BarChart3 size={20} className="text-brand-indigo"/> Top Streams
              </h4>
              <div className="space-y-6">
                 {[
                   { label: 'Tithes', val: 0.65, color: 'brand-primary' },
                   { label: 'Special Project', val: 0.20, color: 'brand-indigo' },
                   { label: 'Benevolence', val: 0.10, color: 'brand-emerald' },
                   { label: 'Other', val: 0.05, color: 'slate-400' }
                 ].map(s => (
                   <div key={s.label} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-600">{s.label}</span>
                        <span className="text-[10px] font-black text-slate-400">{(s.val * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-${s.color} rounded-full`} style={{ width: `${s.val * 100}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
              <Landmark size={48} className="text-slate-200" />
              <h4 className="text-lg font-black text-slate-500 uppercase">KRA Compliance</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Ensure all donation receipts are compliant with Section 13 (2) of the Income Tax Act.</p>
              <button className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline">Download Forms</button>
           </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {viewingTransaction && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[600] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20">
              <div className="p-8 sm:p-12 space-y-10 relative">
                 <button onClick={() => setViewingTransaction(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"><X size={24}/></button>
                 
                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-5 rounded-[2rem] shadow-xl ${viewingTransaction.category === 'Income' ? 'bg-brand-emerald text-white' : 'bg-brand-gold text-white'}`}>
                       {viewingTransaction.source === 'INTEGRATED' ? <Smartphone size={40}/> : <Receipt size={40}/>}
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Transaction Detail</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit-Ready Kingdom Disbursement</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference ID</span>
                       <span className="font-mono text-sm font-black text-brand-indigo uppercase">{viewingTransaction.reference}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Member / Payee</span>
                       <span className="text-sm font-bold text-slate-800">{viewingTransaction.memberName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</span>
                       <span className="text-sm font-bold text-slate-800">{viewingTransaction.type}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Method</span>
                       <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-slate-400"/>
                          <span className="text-sm font-bold text-slate-800">{viewingTransaction.paymentMethod}</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Integrity</span>
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className={viewingTransaction.source === 'INTEGRATED' ? 'text-brand-indigo' : 'text-slate-400'}/>
                          <span className={`text-[10px] font-black uppercase ${viewingTransaction.source === 'INTEGRATED' ? 'text-brand-indigo' : 'text-slate-500'}`}>{viewingTransaction.source}</span>
                       </div>
                    </div>
                    <div className="pt-4 flex justify-between items-end">
                       <span className="text-lg font-black uppercase text-brand-primary tracking-tight">Total Settled</span>
                       <div className="text-right">
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">KES {viewingTransaction.amount.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{viewingTransaction.date} • {viewingTransaction.category}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                       <Printer size={18}/> Print Receipt
                    </button>
                    <button 
                      onClick={() => setViewingTransaction(null)}
                      className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-indigo transition-all"
                    >
                       Acknowledge
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Unified Transaction Form Modal (Modified for MANUAL source) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white h-full sm:h-auto sm:rounded-[3.5rem] w-full sm:max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col">
             <form onSubmit={handleFormSubmit} className="flex flex-col h-full max-h-[95vh]">
                <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-[1.5rem] shadow-xl ${formData.category === 'Income' ? 'bg-brand-emerald text-white' : 'bg-brand-gold text-white'}`}>
                       {formData.category === 'Income' ? <TrendingUp size={28}/> : <TrendingDown size={28}/>}
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">
                        {typeof showFormModal !== 'string' ? 'Modify Record' : `Manual ${formData.category}`}
                      </h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manual Entry Hub • Audit Required</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowFormModal(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={28}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 sm:p-12 lg:p-16 space-y-10 no-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Description / Payee</label>
                        <input 
                          required
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" 
                          placeholder={formData.category === 'Income' ? "e.g. David Ochieng" : "e.g. Nairobi Water"}
                          value={formData.memberName}
                          onChange={e => setFormData({...formData, memberName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Amount (KES)</label>
                        <input 
                          required
                          type="number"
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:ring-2 focus:ring-brand-primary outline-none text-xl" 
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Transaction Type</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                        >
                          {formData.category === 'Income' ? (
                            <>
                              <option value="Tithe">Tithe</option>
                              <option value="Offering">Offering</option>
                              <option value="Project">Special Project</option>
                              <option value="Harambee">Harambee</option>
                              <option value="Benevolence">Benevolence Giving</option>
                            </>
                          ) : (
                            <>
                              <option value="Salary">Staff Salary</option>
                              <option value="Utility">Utility Bill</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Expense">General Expense</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Payment Method</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
                          value={formData.paymentMethod}
                          onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                        >
                          <option value="Cash">Physical Cash</option>
                          <option value="M-Pesa">Manual M-Pesa (Code Check)</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Date</label>
                        <input 
                          type="date"
                          required
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Reference / Receipt #</label>
                        <input 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 uppercase focus:ring-2 focus:ring-brand-primary outline-none" 
                          placeholder="Auto-generated if empty"
                          value={formData.reference}
                          onChange={e => setFormData({...formData, reference: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Internal Memo / Notes</label>
                        <textarea 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none resize-none" 
                          rows={3}
                          placeholder="Brief explanation for the audit..."
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="p-6 bg-brand-gold/5 rounded-[2rem] border border-dashed border-brand-gold/20 flex items-start gap-4">
                      <ShieldCheck className="text-brand-gold shrink-0 mt-1" size={20}/>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Manual entries bypass integrated payment logic. Ensure physical receipts match the ledger reference to maintain financial integrity during AGMs.</p>
                   </div>
                </div>

                <div className="p-10 sm:p-14 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-4 flex-shrink-0">
                  <button type="button" onClick={() => setShowFormModal(null)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Cancel Entry</button>
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>} 
                    {isProcessing ? 'Syncing...' : (typeof showFormModal === 'string' ? 'Commit to Ledger' : 'Update Transaction')}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[700] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-200 text-center border border-white/20">
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                 <AlertCircle size={48}/>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">Remove Record?</h3>
                 <p className="text-slate-500 font-medium text-base leading-relaxed px-4">This action will permanently delete this transaction from the church ledger. This cannot be undone.</p>
              </div>
              <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => { onDeleteTransaction(showDeleteConfirm); setShowDeleteConfirm(null); }}
                   className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all"
                 >
                   Delete Permanently
                 </button>
                 <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel & Keep Record</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReporting;
