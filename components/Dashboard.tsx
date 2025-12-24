
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Wallet, 
  Smartphone,
  CheckCircle2,
  Gift,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Member, Transaction, ChurchEvent } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, events, onAddMember, onSendSMS }) => {
  const lineData = [
    { name: 'May', tithes: 320000, offerings: 180000 },
    { name: 'Jun', tithes: 410000, offerings: 220000 },
    { name: 'Jul', tithes: 450000, offerings: 240000 },
    { name: 'Aug', tithes: 480000, offerings: 310000 },
    { name: 'Sep', tithes: 550000, offerings: 290000 },
    { name: 'Oct', tithes: 610000, offerings: 380000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SaaS Status Ticker */}
      <div className="flex items-center gap-6 px-4 py-2 bg-indigo-900 text-white rounded-2xl overflow-hidden relative">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          <Zap size={12} className="text-amber-400 animate-pulse" />
          System Status: <span className="text-emerald-400">All Nodes Operational</span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
          <Smartphone size={12} />
          M-Pesa Webhook: <span className="text-white">Active (Till 908123)</span>
        </div>
        <div className="absolute right-0 top-0 h-full flex items-center pr-4 bg-gradient-to-l from-indigo-900 via-indigo-900 to-transparent">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">v4.2.0 Enterprise</p>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Monitoring the spiritual and financial health of Imani Central Parish.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onSendSMS} className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <MessageSquare size={20} /> SMS Broadcast
          </button>
          <button onClick={onAddMember} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Plus size={20} /> Add New Member
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Congregation</p>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">1,250</p>
            <div className="mt-2 flex items-center gap-1"><span className="text-emerald-500 font-bold text-xs">↗ +5.2%</span><span className="text-slate-400 text-xs">monthly growth</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Net Tithe</p>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Wallet size={24} /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">KES 150k</p>
            <div className="mt-2 flex items-center gap-1"><span className="text-emerald-500 font-bold text-xs">↗ +12%</span><span className="text-slate-400 text-xs">vs prev wk</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">M-Pesa Webhooks</p>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Smartphone size={24} /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">KES 85k</p>
            <div className="mt-2 flex items-center gap-1"><span className="text-emerald-500 font-bold text-xs">↗ +8%</span><span className="text-slate-400 text-xs">of total revenue</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Avg Attendance</p>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><CheckCircle2 size={24} /></div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">850</p>
            <div className="mt-2 flex items-center gap-1"><span className="text-emerald-500 font-bold text-xs">↗ +3%</span><span className="text-slate-400 text-xs">capacity reached</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div><h3 className="text-2xl font-bold text-slate-800">Financial Growth</h3><p className="text-slate-400 text-sm font-medium">6-Month Performance Trend</p></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-xs font-semibold text-slate-500">Tithes</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs font-semibold text-slate-500">Offerings</span></div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10}/>
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                  <Line type="monotone" dataKey="tithes" stroke="#4f46e5" strokeWidth={6} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="offerings" stroke="#10b981" strokeWidth={6} dot={false} activeDot={{ r: 8, strokeWidth: 0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6"><Gift size={24} className="opacity-80" /><p className="text-[10px] uppercase tracking-widest font-black opacity-80">Anniversaries</p></div>
              <h3 className="text-4xl font-black mb-1 leading-none">12 Members</h3>
              <p className="text-indigo-100 text-sm font-medium mb-8">Celebrating service this week</p>
              <button className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white hover:text-indigo-600 transition-all rounded-xl font-bold text-sm flex items-center justify-center gap-2">Send Blessings <ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Upcoming Events</h3>
            <div className="space-y-6">
              {[
                { date: 'OCT 28', title: "Men's Breakfast", time: '8:00 AM • Main Hall' },
                { date: 'OCT 29', title: 'Sunday Service', time: '9:00 AM • Sanctuary' },
              ].map((ev, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black bg-indigo-50 text-indigo-600 flex-shrink-0`}>
                    <span className="text-[10px] opacity-70 mb-1">{ev.date.split(' ')[0]}</span>
                    <span className="text-lg">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors leading-tight">{ev.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
