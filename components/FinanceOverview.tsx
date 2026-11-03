import React,{useMemo} from 'react';
import {Landmark,ReceiptText,TrendingDown,TrendingUp} from 'lucide-react';
import {Bar,BarChart,CartesianGrid,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import type {Budget,Transaction} from '../types';
type Props={transactions:Transaction[];budgets:Budget[]};
const money=(v:number)=>new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(v);
const monthKey=(v:string)=>v.slice(0,7);
const FinanceOverview:React.FC<Props>=({transactions,budgets})=>{
 const now=new Date(),month=String(now.getFullYear())+'-'+String(now.getMonth()+1).padStart(2,'0'),year=String(now.getFullYear());
 const totals=useMemo(()=>{
  const income=transactions.filter(t=>t.category==='Income').reduce((s,t)=>s+Number(t.amount||0),0);
  const expenses=transactions.filter(t=>t.category==='Expense').reduce((s,t)=>s+Number(t.amount||0),0);
  const monthIncome=transactions.filter(t=>t.category==='Income'&&monthKey(t.date)===month).reduce((s,t)=>s+Number(t.amount||0),0);
  return {income,expenses,net:income-expenses,monthIncome};
 },[transactions,month]);
 const trend=useMemo(()=>Array.from({length:12},(_,i)=>{
  const key=year+'-'+String(i+1).padStart(2,'0'),rows=transactions.filter(t=>monthKey(t.date)===key);
  return {month:new Date(Number(year),i,1).toLocaleDateString('en-KE',{month:'short'}),income:rows.filter(t=>t.category==='Income').reduce((s,t)=>s+Number(t.amount||0),0),expenses:rows.filter(t=>t.category==='Expense').reduce((s,t)=>s+Number(t.amount||0),0)};
 }),[transactions,year]);
 const breakdown=useMemo(()=>{
  const map=new Map<string,number>();transactions.filter(t=>t.category==='Expense').forEach(t=>map.set(t.type,(map.get(t.type)||0)+Number(t.amount||0)));
  return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,5);
 },[transactions]);
 const budget=budgets.filter(b=>b.month===month).reduce((s,b)=>s+Number(b.amount||0),0);
 const spent=transactions.filter(t=>t.category==='Expense'&&monthKey(t.date)===month).reduce((s,t)=>s+Number(t.amount||0),0);
 const pct=budget?Math.min(100,Math.round(spent/budget*100)):0;
 const cards=[
  {label:'Total revenue',value:totals.income,detail:'All recorded income',icon:TrendingUp,tone:'text-emerald-700 bg-emerald-50'},
  {label:'Total expenses',value:totals.expenses,detail:'All recorded expenses',icon:TrendingDown,tone:'text-rose-700 bg-rose-50'},
  {label:'Net position',value:totals.net,detail:'Revenue less expenses',icon:Landmark,tone:'text-slate-700 bg-slate-100'},
  {label:'This month',value:totals.monthIncome,detail:'Income received this month',icon:ReceiptText,tone:'text-sky-700 bg-sky-50'}
 ];
 return <section className="space-y-5" aria-label="Finance overview">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><article key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-600">{c.label}</p><span className={'flex h-9 w-9 items-center justify-center rounded-lg '+c.tone}><c.icon size={17}/></span></div><p className="mt-4 truncate text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{money(c.value)}</p><p className="mt-1 text-xs text-slate-500">{c.detail}</p></article>)}</div>
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
   <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-8"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">Revenue vs expenses</h3><p className="mt-1 text-xs text-slate-500">Monthly totals · {year}</p></div><div className="flex gap-4 text-xs text-slate-600"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-teal-700"/>Revenue</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-amber-500"/>Expenses</span></div></div>
    <div className="h-[260px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={trend} margin={{top:8,right:8,left:-18,bottom:0}} barGap={4}><CartesianGrid stroke="#eef1f4" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>v>=1000000?(v/1000000).toFixed(1)+'m':v>=1000?Math.round(v/1000)+'k':String(v)}/><Tooltip formatter={v=>money(Number(v))}/><Bar dataKey="income" name="Revenue" fill="#0f766e" radius={[4,4,0,0]} maxBarSize={22}/><Bar dataKey="expenses" name="Expenses" fill="#d97706" radius={[4,4,0,0]} maxBarSize={22}/></BarChart></ResponsiveContainer></div>
   </article>
   <div className="space-y-4 xl:col-span-4">
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="text-base font-semibold text-slate-900">Expense breakdown</h3><p className="mt-1 text-xs text-slate-500">Recorded expenses by category</p>{breakdown.length?<div className="mt-2 grid grid-cols-[112px_1fr] items-center gap-2"><div className="h-[132px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={34} outerRadius={54} paddingAngle={2}>{breakdown.map((e,i)=><Cell key={e.name} fill={['#0f766e','#d97706','#64748b','#0ea5e9','#a3a3a3'][i%5]}/>)}</Pie><Tooltip formatter={(v:number)=>money(Number(v))}/></PieChart></ResponsiveContainer></div><div className="space-y-2">{breakdown.slice(0,4).map((e,i)=><div key={e.name} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 text-slate-600"><i className="h-2 w-2 rounded-full" style={{backgroundColor:['#0f766e','#d97706','#64748b','#0ea5e9'][i]}}/><span className="truncate">{e.name}</span></span><strong className="shrink-0 text-slate-900">{money(e.value)}</strong></div>)}</div></div>:<p className="py-10 text-center text-sm text-slate-500">No expense records yet.</p>}</article>
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">Monthly budget</h3><p className="mt-1 text-xs text-slate-500">{now.toLocaleDateString('en-KE',{month:'long',year:'numeric'})}</p></div><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{budget?pct+'% used':'Not set'}</span></div><p className="mt-4 text-2xl font-semibold text-slate-950">{money(spent)} <span className="text-sm font-normal text-slate-500">/ {money(budget)}</span></p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={'h-full rounded-full '+(pct>=100?'bg-rose-600':'bg-teal-700')} style={{width:pct+'%'}}/></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Expenses this month</span><span>{money(Math.max(0,budget-spent))} remaining</span></div>{!budget&&<p className="mt-2 text-xs text-slate-500">Set a monthly expense budget to track utilisation.</p>}</article>
   </div>
  </div>
 </section>;
};
export default FinanceOverview;
