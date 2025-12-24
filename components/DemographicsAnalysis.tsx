
import React, { useState, useMemo } from 'react';
import { 
  Users, MapPin, TrendingUp, PieChart as PieIcon, 
  UserPlus, UserCheck, Map as MapIcon, Briefcase,
  Activity, Wallet, Calendar, ChartArea, ArrowUpRight,
  TrendingDown, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts';
import { Member, MemberStatus } from '../types';

interface DemographicsAnalysisProps {
  members: Member[];
}

type AnalyticsTab = 'DEMOGRAPHICS' | 'GROWTH' | 'GIVING' | 'ENGAGEMENT';

const DemographicsAnalysis: React.FC<DemographicsAnalysisProps> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('DEMOGRAPHICS');
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => counts[m.location] = (counts[m.location] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [members]);

  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => counts[m.gender || 'Not Specified'] = (counts[m.gender || 'Not Specified'] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [members]);

  const ageGroupData = useMemo(() => {
    const groups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
    members.forEach(m => {
      if (!m.age) return;
      if (m.age <= 18) groups['0-18']++;
      else if (m.age <= 35) groups['19-35']++;
      else if (m.age <= 50) groups['36-50']++;
      else groups['51+']++;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [members]);

  const growthData = [
    { month: 'May', newMembers: 12, total: 1180 },
    { month: 'Jun', newMembers: 18, total: 1198 },
    { month: 'Jul', newMembers: 25, total: 1223 },
    { month: 'Aug', newMembers: 14, total: 1237 },
    { month: 'Sep', newMembers: 31, total: 1268 },
    { month: 'Oct', newMembers: 22, total: 1290 },
  ];

  const givingTrendData = [
    { month: 'May', tithes: 320000, offerings: 120000, projects: 50000 },
    { month: 'Jun', tithes: 340000, offerings: 115000, projects: 80000 },
    { month: 'Jul', tithes: 410000, offerings: 130000, projects: 120000 },
    { month: 'Aug', tithes: 380000, offerings: 140000, projects: 95000 },
    { month: 'Sep', tithes: 450000, offerings: 155000, projects: 150000 },
    { month: 'Oct', tithes: 480000, offerings: 160000, projects: 110000 },
  ];

  const engagementData = [
    { day: 'Sun 1', physical: 820, online: 340, target: 1000 },
    { day: 'Sun 2', physical: 780, online: 410, target: 1000 },
    { day: 'Sun 3', physical: 910, online: 280, target: 1000 },
    { day: 'Sun 4', physical: 850, online: 360, target: 1000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Ministry Analytics</h2>
          <p className="text-slate-500 mt-2 text-lg">In-depth data visualization for spiritual and operational growth.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          {[
            { id: 'DEMOGRAPHICS', label: 'Demographics', icon: Users },
            { id: 'GROWTH', label: 'Growth', icon: TrendingUp },
            { id: 'GIVING', label: 'Giving', icon: Wallet },
            { id: 'ENGAGEMENT', label: 'Engagement', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'DEMOGRAPHICS' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Avg Member Age</p>
              <p className="text-4xl font-black text-slate-800">32.4 <span className="text-sm text-slate-400 font-bold">Years</span></p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Top Region</p>
              <p className="text-2xl font-black text-slate-800 truncate">{locationData[0]?.name}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Male/Female Ratio</p>
              <p className="text-4xl font-black text-indigo-600">42/58</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Souls Registered</p>
              <p className="text-4xl font-black text-emerald-600">{members.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieIcon size={20} className="text-indigo-600"/> Age Pyramid</h4>
              <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageGroupData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 12}} width={60} /><Tooltip /><Bar dataKey="value" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={30} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieIcon size={20} className="text-emerald-500"/> Gender Split</h4>
              <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">{genderData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3"><MapIcon size={20} className="text-amber-500"/> Geo-Heatmap</h4>
                <p className="text-sm text-slate-500 mb-6 font-medium">Majority of members reside in {locationData[0]?.name}, accounting for {Math.round((locationData[0]?.value / members.length) * 100)}% of the congregation.</p>
              </div>
              <div className="space-y-3">
                {locationData.slice(0, 3).map(loc => (
                  <div key={loc.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">{loc.name}</span>
                    <span className="text-xs font-black text-indigo-600">{loc.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'GROWTH' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="text-2xl font-black text-slate-800">New Membership Trends</h4>
              <p className="text-slate-500 font-medium">Tracking souls added over the last 6 months.</p>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center gap-2">
              <TrendingUp size={24}/> <span className="font-black">+15.2%</span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="newMembers" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" name="New Souls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'GIVING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
             <h4 className="text-2xl font-black text-slate-800 mb-8">Financial Giving Demographics</h4>
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={givingTrendData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                   <YAxis hide />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="tithes" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} name="Tithes" />
                   <Bar dataKey="offerings" stackId="a" fill="#10b981" name="Offerings" />
                   <Bar dataKey="projects" stackId="a" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Projects" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="space-y-6">
             <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">Giver Statistics</p>
                <div className="space-y-6">
                   <div>
                      <p className="text-3xl font-black">72%</p>
                      <p className="text-xs text-indigo-300 font-medium">Of tithes come from the 19-35 age group.</p>
                   </div>
                   <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <p className="text-xs font-bold text-indigo-100 flex items-center gap-2"><ArrowUpRight size={14}/> Top Donor Region: Kileleshwa</p>
                   </div>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
                <h5 className="font-black text-slate-800 mb-4">M-Pesa Popularity</h5>
                <div className="flex items-end gap-3 h-24">
                   <div className="flex-1 bg-emerald-100 rounded-t-xl" style={{height: '85%'}}></div>
                   <div className="flex-1 bg-slate-100 rounded-t-xl" style={{height: '15%'}}></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase text-slate-400">
                   <span>M-Pesa</span>
                   <span>Others</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'ENGAGEMENT' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
          <h4 className="text-2xl font-black text-slate-800 mb-10">Attendance & Service Engagement</h4>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="physical" fill="#4f46e5" radius={[10, 10, 0, 0]} name="In-Person Attendance" barSize={40} />
                <Bar dataKey="online" fill="#06b6d4" radius={[10, 10, 0, 0]} name="Online Stream" barSize={40} />
                <Line type="monotone" dataKey="target" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Target Threshold" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6">
             <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={24}/></div>
             <p className="text-sm text-slate-600 font-medium">Service engagement peaked at <span className="font-black text-slate-800">1,190 souls</span> during Sun 3, likely due to the "Family Day" theme. Engagement is 12% higher than last quarter.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicsAnalysis;
