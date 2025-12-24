
import React, { useState, useMemo } from 'react';
import { 
  Filter, Download, TrendingUp, TrendingDown, 
  Search, Wallet, Calendar, PieChart as PieIcon,
  Tag, Plus, X, Settings2, Smartphone, Repeat, 
  BarChart3, AlertCircle, Save
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
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
  onUpdateTransaction, 
  onAddTransaction,
  budgets,
  onSetBudget,
  recurringExpenses,
  onAddRecurring
}) => {
  const [filterType, setFilterType] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMPesaModal, setShowMPesaModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // Constants
  const customCategories = ['Utilities', 'Staff Salaries', 'Mission Outreach', 'Maintenance', 'Sound & Media'];
  const incomeTypes = ['Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence'];
  const expenseTypes = ['Expense'];

  // MPesa Form State
  const [mpesaForm, setMpesaForm] = useState({ memberId: '', amount: 0, reference: '', phone: '' });
  
  // Budget Form State
  const [budgetForm, setBudgetForm] = useState({ category: customCategories[0], amount: 0, month: new Date().toISOString().slice(0, 7) });

  // Recurring Form State
  const [recurringForm, setRecurringForm] = useState({ name: '', amount: 0, category: customCategories[0], frequency: 'Monthly' as const });

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'All' || t.type === filterType;
      const matchesMethod = filterMethod === 'All' || t.paymentMethod === filterMethod;
      const matchesDate = (!dateRange.start || t.date >= dateRange.start) && (!dateRange.end || t.date <= dateRange.end);
      const matchesSearch = 
        t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.subCategory && t.subCategory.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesMethod && matchesDate && matchesSearch;
    });
  }, [transactions, filterType, filterMethod, dateRange, searchTerm]);

  const totalIncome = filtered.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netPosition = totalIncome - totalExpenses;

  // Budget vs Actual Chart Data
  const budgetVsActualData = useMemo(() => {
    return customCategories.map(cat => {
      const budget = budgets.find(b => b.category === cat)?.amount || 0;
      const actual = transactions
        .filter(t => t.category === 'Expense' && t.subCategory === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat, budget, actual };
    });
  }, [budgets, transactions]);

  // Income Breakdown for Pie
  const incomeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.filter(t => t.category === 'Income').forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + t.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleRecordMPesa = () => {
    const member = members.find(m => m.id === mpesaForm.memberId);
    if (!member || !mpesaForm.reference) return;

    const newTrx: Transaction = {
      id: Date.now().toString(),
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      amount: mpesaForm.amount,
      type: 'Tithe', // Default to Tithe for recording
      paymentMethod: 'M-Pesa',
      date: new Date().toISOString().split('T')[0],
      reference: mpesaForm.reference,
      category: 'Income',
      phoneNumber: mpesaForm.phone
    };
    onAddTransaction(newTrx);
    setShowMPesaModal(false);
    setMpesaForm({ memberId: '', amount: 0, reference: '', phone: '' });
  };

  const handleSaveBudget = () => {
    onSetBudget({ id: Date.now().toString(), ...budgetForm });
    setShowBudgetModal(false);
  };

  const handleSaveRecurring = () => {
    onAddRecurring({ 
      id: Date.now().toString(), 
      ...recurringForm, 
      nextDueDate: new Date().toISOString().split('T')[0], 
      isActive: true 
    });
    setShowRecurringModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Finance Management</h2>
          <p className="text-slate-500 mt-2 text-lg">M-Pesa reconciliation, budget tracking & recurring dues.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowRecurringModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Repeat size={20} /> Recurring Dues
          </button>
          <button onClick={() => setShowBudgetModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <BarChart3 size={20} /> Set Budgets
          </button>
          <button onClick={() => setShowMPesaModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Smartphone size={20} /> Record M-Pesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Revenue (This Range)</p>
          <h4 className="text-4xl font-black text-emerald-600 mt-4 tracking-tighter">KES {totalIncome.toLocaleString()}</h4>
          <p className="text-xs text-slate-400 mt-2">From {filtered.filter(i => i.category === 'Income').length} entries</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Expenditure</p>
          <h4 className="text-4xl font-black text-rose-600 mt-4 tracking-tighter">KES {totalExpenses.toLocaleString()}</h4>
          <p className="text-xs text-slate-400 mt-2">Target savings: 30%</p>
        </div>
        <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <p className="text-indigo-300 text-xs font-black uppercase tracking-widest">Church Net Fund</p>
          <h4 className="text-4xl font-black mt-4 tracking-tighter">KES {netPosition.toLocaleString()}</h4>
          <p className="text-indigo-200 text-xs mt-2">Liquidity Score: Optimal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Search & Filters */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search member, ref ID, or sub-category..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 outline-none" onChange={e => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                {[...incomeTypes, ...expenseTypes].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 outline-none" onChange={e => setFilterMethod(e.target.value)}>
                <option value="All">Methods</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">Transaction History</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Results</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                      <tr>
                         <th className="px-8 py-4">Reference</th>
                         <th className="px-8 py-4">Member / Payee</th>
                         <th className="px-8 py-4">Category</th>
                         <th className="px-8 py-4 text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filtered.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                           <td className="px-8 py-6 font-mono text-xs text-indigo-600 font-bold">{t.reference}</td>
                           <td className="px-8 py-6">
                              <p className="font-bold text-slate-800">{t.memberName}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">{t.paymentMethod} {t.phoneNumber ? `• ${t.phoneNumber}` : ''}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex gap-2">
                                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${t.category === 'Expense' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.type}</span>
                                 {t.subCategory && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{t.subCategory}</span>}
                              </div>
                           </td>
                           <td className={`px-8 py-6 text-right font-black text-lg ${t.category === 'Expense' ? 'text-rose-600' : 'text-slate-900'}`}>
                             {t.category === 'Expense' ? '-' : ''}{t.amount.toLocaleString()}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Budget vs Actual Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3"><BarChart3 size={20} className="text-indigo-600"/> Budget vs Actual</h4>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={budgetVsActualData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" hide />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar dataKey="budget" fill="#e2e8f0" radius={[8, 8, 8, 8]} barSize={20} name="Budgeted" />
                      <Bar dataKey="actual" fill="#4f46e5" radius={[8, 8, 8, 8]} barSize={20} name="Actual" />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Income Breakdown Pie */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3"><PieIcon size={20} className="text-emerald-500"/> Income Mix</h4>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {incomeBreakdown.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                   </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Recurring Expense Status */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
             <h4 className="font-black mb-6 flex items-center gap-3 text-indigo-300"><Repeat size={20}/> Active Recurring Dues</h4>
             <div className="space-y-4">
                {recurringExpenses.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                     <div>
                        <p className="font-bold text-sm">{r.name}</p>
                        <p className="text-[10px] text-indigo-300 uppercase tracking-widest">{r.frequency} • {r.category}</p>
                     </div>
                     <p className="font-black text-indigo-400">KES {r.amount.toLocaleString()}</p>
                  </div>
                ))}
                {recurringExpenses.length === 0 && <p className="text-center text-white/30 text-xs font-bold py-4">No recurring expenses set.</p>}
             </div>
          </div>
        </div>
      </div>

      {/* M-Pesa Recording Modal */}
      {showMPesaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-slate-800">Record M-Pesa</h3>
            <div className="space-y-4">
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                value={mpesaForm.memberId}
                onChange={e => setMpesaForm({...mpesaForm, memberId: e.target.value})}
              >
                <option value="">Select Member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
              <input type="number" placeholder="Amount (KES)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setMpesaForm({...mpesaForm, amount: Number(e.target.value)})} />
              <input type="text" placeholder="Transaction Reference (e.g. RJL90...)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setMpesaForm({...mpesaForm, reference: e.target.value})} />
              <input type="text" placeholder="Sender Phone Number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setMpesaForm({...mpesaForm, phone: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowMPesaModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl">Cancel</button>
              <button onClick={handleRecordMPesa} className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700">Record Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-slate-800">Set Category Budget</h3>
            <div className="space-y-4">
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}>
                {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Monthly Limit (KES)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setBudgetForm({...budgetForm, amount: Number(e.target.value)})} />
              <input type="month" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={budgetForm.month} onChange={e => setBudgetForm({...budgetForm, month: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl">Cancel</button>
              <button onClick={handleSaveBudget} className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700">Save Budget</button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Expense Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-slate-800">Recurring Payment</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Payee Name (e.g. KPLC, Landlord)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setRecurringForm({...recurringForm, name: e.target.value})} />
              <input type="number" placeholder="Amount (KES)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setRecurringForm({...recurringForm, amount: Number(e.target.value)})} />
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setRecurringForm({...recurringForm, category: e.target.value})}>
                {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" onChange={e => setRecurringForm({...recurringForm, frequency: e.target.value as any})}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowRecurringModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl">Cancel</button>
              <button onClick={handleSaveRecurring} className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700">Set Recurring</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReporting;
