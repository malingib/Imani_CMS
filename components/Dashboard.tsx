
import React, { useState, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
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
  Zap,
  X,
  Cake,
  Heart,
  Star,
  Send,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Activity,
  HandCoins,
  CalendarPlus,
  UserPlus,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, events, onAddMember, onSendSMS, onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [isSendingBlessings, setIsSendingBlessings] = useState(false);
  const [blessingSent, setBlessingSent] = useState(false);

  const sparkData = [ { v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 48 }, { v: 60 }, { v: 75 } ];

  const celebrations = useMemo(() => [
    { id: 'c1', name: 'Mary Wambui', type: 'Birthday', date: 'Oct 26', avatar: 'https://i.pravatar.cc/100?img=32' },
    { id: 'c2', name: 'David & Sarah Ochieng', type: 'Wedding', date: 'Oct 27', avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 'c3', name: 'Kennedy Kamau', type: 'Membership', date: 'Oct 28', avatar: 'https://i.pravatar.cc/100?img=44' },
  ], []);

  const performanceData = useMemo(() => [
    { name: 'Mon', tithes: 12000, attendance: 120 },
    { name: 'Tue', tithes: 8000, attendance: 90 },
    { name: 'Wed', tithes: 45000, attendance: 310 },
    { name: 'Thu', tithes: 15000, attendance: 85 },
    { name: 'Fri', tithes: 22000, attendance: 220 },
    { name: 'Sat', tithes: 35000, attendance: 180 },
    { name: 'Sun', tithes: 580000, attendance: 1150 },
  ], []);

  const systemHealth = [
    { label: 'Database Sync', val: '99.9%', status: 'optimal' },
    { label: 'M-Pesa Webhook', val: '12ms', status: 'optimal' },
    { label: 'Cloud Resilience', val: 'Nairobi-West', status: 'optimal' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-3 bg-brand-primary text-white rounded-[1.5rem] relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-6 z-10 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Node: <span className="text-emerald-400">Nairobi East (Region-01)</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-4">
            {systemHealth.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap">
                <Server size={12} className="text-brand-gold opacity-50"/>
                {h.label}: <span className="text-white">{h.val}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl z-10 w-full lg:w-auto justify-between lg:justify-start">
          {(['7D', '30D', '90D', '1Y'] as const).map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeRange === range ? 'bg-white text-brand-primary shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-brand-indigo/20 to-transparent pointer-events-none hidden lg:block" />
      </div>

      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-indigo-50 text-brand-indigo rounded-xl">
               <ShieldCheck size={24} />
            </div>
            <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Ministry Command</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Real-time ministry trajectory for the Imani Global Parish network.</p>
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-3">
          <button onClick={() => onNavigate('COMMUNICATION')} className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <MessageSquare size={18} className="text-brand-indigo" /> Outreach Hub
          </button>
          <button onClick={() => onNavigate('FINANCE')} className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20">
            <Smartphone size={18} className="text-brand-gold"/> Record Settlement
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Congregation', val: members.length.toLocaleString(), icon: Users, color: 'indigo', trend: '+5.2%' },
          { label: 'Net Tithe', val: `KES ${(transactions.filter(t=>t.type==='Tithe').reduce((s,t)=>s+t.amount,0)/1000).toFixed(1)}k`, icon: Wallet, color: 'emerald', trend: '+12.4%' },
          { label: 'Digital Flows', val: '86%', icon: Smartphone, color: 'gold', trend: '+2.1%' },
          { label: 'Service Pulse', val: '942', icon: Activity, color: 'primary', trend: '+3.8%' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1">{stat.label}</p>
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.val}</h4>
              </div>
              <div className={`p-4 bg-brand-${stat.color}-50 text-brand-${stat.color}-500 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-brand-emerald font-black text-xs">{stat.trend}</span>
                <ArrowUpRight size={14} className="text-brand-emerald" />
              </div>
              <div className="h-8 w-24">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={sparkData}>
                      <Area type="monotone" dataKey="v" stroke={i % 2 === 0 ? '#4F46E5' : '#10B981'} fill="transparent" strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ministry Vitality</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Stewardship vs. Presence</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-primary" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tithing</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-gold" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Attendance</span></div>
                </div>
             </div>
             
             <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorTithes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                    <Area type="monotone" dataKey="tithes" stroke="#1E293B" strokeWidth={5} fillOpacity={1} fill="url(#colorTithes)" />
                    <Area type="monotone" dataKey="attendance" stroke="#FFB800" strokeWidth={5} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: 'Tithe', icon: HandCoins, color: 'emerald', action: () => onNavigate('FINANCE') },
               { label: 'Convert', icon: UserPlus, color: 'indigo', action: onAddMember },
               { label: 'Service', icon: CalendarPlus, color: 'primary', action: () => onNavigate('EVENTS') },
               { label: 'Outreach', icon: MessageSquare, color: 'gold', action: () => onNavigate('COMMUNICATION') }
             ].map((btn, i) => (
               <button 
                 key={i} 
                 onClick={btn.action}
                 className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 group"
               >
                 <div className={`p-4 bg-brand-${btn.color}-50 text-brand-${btn.color}-500 rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                    <btn.icon size={28} />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{btn.label}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                   <Smartphone size={20} className="text-brand-indigo" /> Live Stream
                 </h4>
                 <div className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-lg text-[10px] font-black uppercase tracking-widest">REAL-TIME</div>
              </div>
              
              <div className="space-y-6">
                 {transactions.slice(0, 4).map((trx, i) => (
                   <div key={trx.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-indigo font-black text-xs flex-shrink-0">
                         {trx.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-800 truncate pr-2">{trx.memberName}</p>
                            <span className="text-brand-emerald font-black text-xs">KES {trx.amount.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate">{trx.type}</p>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{trx.date}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={() => onNavigate('FINANCE')} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                 View Treasury Vault <ExternalLink size={12}/>
              </button>
           </div>

           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <Gift size={28} className="text-brand-gold animate-bounce" />
                    <h4 className="text-xl font-black uppercase tracking-tight">Milestone Pulse</h4>
                 </div>
                 <p className="text-slate-300 text-base font-medium leading-relaxed">
                   <span className="text-white font-black">{celebrations.length} Members</span> marking spiritual or personal anniversaries this week.
                 </p>
                 <button 
                   onClick={() => setShowAnniversaryModal(true)}
                   className="w-full py-4 bg-white text-brand-primary rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-gold transition-all"
                 >
                   Send Kingdom Blessings
                 </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-brand-indigo rounded-full blur-[80px] opacity-10 group-hover:scale-125 transition-transform duration-1000" />
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3 mb-8">
                 <ShieldCheck size={20} className="text-brand-gold" /> System Integrity
              </h4>
              <div className="space-y-6">
                 {[
                   { label: 'Data Encryption', val: 'AES-256', color: 'emerald' },
                   { label: 'Audit Compliance', val: 'Active', color: 'indigo' },
                   { label: 'Regional Uptime', val: '99.9%', color: 'gold' }
                 ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-500">{h.label}</span>
                     <span className={`px-3 py-1 bg-brand-${h.color}-50 text-brand-${h.color}-500 rounded-lg text-[10px] font-black uppercase`}>{h.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {showAnniversaryModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-10 bg-brand-primary text-white relative">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="text-brand-gold" size={24} />
                    <h3 className="text-3xl font-black tracking-tight uppercase leading-tight">Kingdom Celebrations</h3>
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Automatic blessing dispatch via SMS and WhatsApp.</p>
                </div>
                <button onClick={() => setShowAnniversaryModal(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {celebrations.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all">
                    <img src={item.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-lg truncate">{item.name}</h4>
                      <p className="text-[10px] font-black uppercase text-brand-indigo tracking-widest">{item.type} • {item.date}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-brand-emerald animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowAnniversaryModal(false)} className="flex-1 py-5 font-black text-slate-500 hover:bg-slate-200 rounded-[1.5rem] transition-all uppercase tracking-widest text-xs">Dismiss</button>
              <button 
                onClick={() => {
                  setIsSendingBlessings(true);
                  setTimeout(() => {
                    setIsSendingBlessings(false);
                    setBlessingSent(true);
                    setTimeout(() => setShowAnniversaryModal(false), 1500);
                  }, 2000);
                }}
                className="flex-[2] py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3"
              >
                {isSendingBlessings ? <Loader2 className="animate-spin" /> : <Send size={20} />} {isSendingBlessings ? 'Dispatching...' : 'Blast Blessings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
