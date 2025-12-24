
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
  Calendar,
  Gift,
  ArrowRight
} from 'lucide-react';
import { Member, Transaction, Activity, ChurchEvent } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, events, onAddMember, onSendSMS }) => {
  // Mock performance data for the chart
  const lineData = [
    { name: 'May', tithes: 320000, offerings: 180000 },
    { name: 'Jun', tithes: 410000, offerings: 220000 },
    { name: 'Jul', tithes: 450000, offerings: 240000 },
    { name: 'Aug', tithes: 480000, offerings: 310000 },
    { name: 'Sep', tithes: 550000, offerings: 290000 },
    { name: 'Oct', tithes: 610000, offerings: 380000 },
  ];

  const recentActivities: Activity[] = [
    { id: '1', action: 'New Member Added', user: 'Admin', date: 'Today, 10:23 AM', status: 'Completed' },
    { id: '2', action: 'M-Pesa Reconciliation', user: 'System', date: 'Today, 09:00 AM', status: 'Verified' },
    { id: '3', action: 'Weekly Newsletter Sent', user: 'Ps. John', date: 'Yesterday, 4:15 PM', status: 'Sent' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome back, Pastor John</h2>
          <p className="text-slate-500 mt-2 text-lg">
            Here is an overview of your church metrics for <span className="text-indigo-600 font-semibold">October 25, 2023</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onSendSMS}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <MessageSquare size={20} /> SMS Blast
          </button>
          <button 
            onClick={onAddMember}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} /> Add New Member
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Total Members</p>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users size={24} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">1,250</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-bold text-xs">↗ +5.2%</span>
              <span className="text-slate-400 text-xs">vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Weekly Tithe</p>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet size={24} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">KES 150k</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-bold text-xs">↗ +12%</span>
              <span className="text-slate-400 text-xs">vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">M-Pesa Collections</p>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Smartphone size={24} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">KES 85k</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-bold text-xs">↗ +8%</span>
              <span className="text-slate-400 text-xs">of total giving</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Sunday Attendance</p>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800">850</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-bold text-xs">↗ +3%</span>
              <span className="text-slate-400 text-xs">vs last Sunday</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Giving Trends</h3>
                <p className="text-slate-400 text-sm">Last 6 Months Performance</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-semibold text-slate-500">Tithes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-slate-500">Offerings</span>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-baseline gap-4">
              <p className="text-5xl font-black text-slate-800 tracking-tighter">KES 3.2M</p>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-lg">
                +15% vs prev period
              </span>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tithes" 
                    stroke="#4f46e5" 
                    strokeWidth={6} 
                    dot={false}
                    activeDot={{ r: 8, strokeWidth: 0 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="offerings" 
                    stroke="#10b981" 
                    strokeWidth={6} 
                    dot={false}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase text-slate-400 tracking-widest font-black border-b border-slate-50">
                  <tr>
                    <th className="pb-4 px-2">Action</th>
                    <th className="pb-4 px-2">User</th>
                    <th className="pb-4 px-2">Date</th>
                    <th className="pb-4 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentActivities.map((act) => (
                    <tr key={act.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            act.action.includes('Member') ? 'bg-indigo-50 text-indigo-600' :
                            act.action.includes('M-Pesa') ? 'bg-emerald-50 text-emerald-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            <Users size={18} />
                          </div>
                          <span className="font-bold text-slate-700">{act.action}</span>
                        </div>
                      </td>
                      <td className="py-5 px-2 text-sm font-medium text-slate-500">{act.user}</td>
                      <td className="py-5 px-2 text-sm font-medium text-slate-500">{act.date}</td>
                      <td className="py-5 px-2 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${
                          act.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          act.status === 'Verified' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">Upcoming Events</h3>
              <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {[
                { date: 'OCT 28', title: "Men's Fellowship Breakfast", time: 'Sat, 8:00 AM • Main Hall', color: 'indigo' },
                { date: 'OCT 29', title: 'Sunday Service', time: 'Sun, 9:00 AM • Sanctuary', color: 'blue' },
                { date: 'NOV 02', title: 'Worship Team Rehearsal', time: 'Wed, 6:00 PM • Studio', color: 'indigo' },
              ].map((ev, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black leading-none flex-shrink-0 ${
                    ev.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                  }`}>
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
            <button className="w-full mt-10 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-indigo-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Plus size={16} /> Add New Event
            </button>
          </div>

          {/* Birthdays Card */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Gift size={24} className="opacity-80" />
                <p className="text-[10px] uppercase tracking-widest font-black opacity-80">Birthdays This Week</p>
              </div>
              <h3 className="text-4xl font-black mb-1 leading-none">12 Members</h3>
              <p className="text-indigo-100 text-sm font-medium mb-8">Celebrating this week</p>
              <button className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white hover:text-indigo-600 transition-all rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                Send Wishes <ArrowRight size={16} />
              </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform"></div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Sunday Roster</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-700">Ushering</span>
                   <span className="text-xs font-medium text-slate-400">Team Alpha (8)</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-700">Worship</span>
                   <span className="text-xs font-medium text-slate-400">Ps. David (Lead)</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
