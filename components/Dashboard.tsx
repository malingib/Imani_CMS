
import React, { useState, useMemo } from 'react';
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
  Zap,
  X,
  Cake,
  Heart,
  Star,
  Send,
  Loader2
} from 'lucide-react';
import { Member, Transaction, ChurchEvent } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  onAddMember: () => void;
  onSendSMS: () => void;
}

interface Celebration {
  id: string;
  name: string;
  type: 'Birthday' | 'Wedding' | 'Membership';
  date: string;
  avatar?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, events, onAddMember, onSendSMS }) => {
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [isSendingBlessings, setIsSendingBlessings] = useState(false);
  const [blessingSent, setBlessingSent] = useState(false);

  // Mock celebrations data
  const celebrations: Celebration[] = useMemo(() => [
    { id: 'c1', name: 'Mary Wambui', type: 'Birthday', date: 'Oct 26', avatar: 'https://i.pravatar.cc/100?img=32' },
    { id: 'c2', name: 'David & Sarah Ochieng', type: 'Wedding', date: 'Oct 27', avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 'c3', name: 'Kennedy Kamau', type: 'Membership', date: 'Oct 28', avatar: 'https://i.pravatar.cc/100?img=44' },
    { id: 'c4', name: 'Alice Njeri', type: 'Birthday', date: 'Oct 29', avatar: 'https://i.pravatar.cc/100?img=43' },
    { id: 'c5', name: 'Eric Otieno', type: 'Birthday', date: 'Oct 30', avatar: 'https://i.pravatar.cc/100?img=51' },
  ], []);

  const lineData = [
    { name: 'May', tithes: 320000, offerings: 180000 },
    { name: 'Jun', tithes: 410000, offerings: 220000 },
    { name: 'Jul', tithes: 450000, offerings: 240000 },
    { name: 'Aug', tithes: 480000, offerings: 310000 },
    { name: 'Sep', tithes: 550000, offerings: 290000 },
    { name: 'Oct', tithes: 610000, offerings: 380000 },
  ];

  const handleSendBlessings = () => {
    setIsSendingBlessings(true);
    setTimeout(() => {
      setIsSendingBlessings(false);
      setBlessingSent(true);
      setTimeout(() => {
        setBlessingSent(false);
        setShowAnniversaryModal(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* SaaS Status Ticker */}
      <div className="flex items-center gap-3 sm:gap-6 px-4 py-2.5 bg-brand-primary text-white rounded-2xl overflow-hidden relative">
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          <Zap size={12} className="text-brand-gold animate-pulse" />
          <span className="hidden sm:inline">System Status:</span> <span className="text-emerald-400">Operational</span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
          <Smartphone size={12} />
          M-Pesa Webhook: <span className="text-white font-black">Active (Till 908123)</span>
        </div>
        <div className="absolute right-0 top-0 h-full flex items-center pr-4 bg-gradient-to-l from-brand-primary via-brand-primary to-transparent">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Enterprise</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight uppercase">Executive Dashboard</h2>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">Monitoring the spiritual and financial health of Imani Parish.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button onClick={onSendSMS} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <MessageSquare size={18} /> <span className="text-sm">Broadcast</span>
          </button>
          <button onClick={onAddMember} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-black hover:bg-brand-primary-700 transition-all shadow-lg shadow-brand-primary/20">
            <Plus size={18} /> <span className="text-sm">New Member</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Congregation', val: '1,250', icon: Users, color: 'brand-primary', trend: '+5.2%' },
          { label: 'Net Tithe', val: 'KES 150k', icon: Wallet, color: 'brand-primary', trend: '+12%' },
          { label: 'M-Pesa Flows', val: 'KES 85k', icon: Smartphone, color: 'emerald', trend: '+8%' },
          { label: 'Avg Presence', val: '850', icon: CheckCircle2, color: 'brand-gold', trend: '+3%' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-[9px] uppercase tracking-widest font-black">{stat.label}</p>
              <div className={`p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl`}>
                 <stat.icon size={20} className={stat.color === 'brand-primary' ? 'text-brand-primary' : stat.color === 'brand-gold' ? 'text-brand-gold' : 'text-emerald-600'} />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-800">{stat.val}</p>
              <div className="mt-1 sm:mt-2 flex items-center gap-1">
                <span className="text-emerald-500 font-bold text-[10px] sm:text-xs">↗ {stat.trend}</span>
                <span className="text-slate-400 text-[10px] sm:text-xs">this month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Financial Growth</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Performance Trend</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div><span className="text-[10px] font-semibold text-slate-500 uppercase">Tithes</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-gold"></div><span className="text-[10px] font-semibold text-slate-500 uppercase">Offerings</span></div>
              </div>
            </div>
            <div className="h-[250px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10}/>
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}}/>
                  <Line type="monotone" dataKey="tithes" stroke="#1E293B" strokeWidth={5} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="offerings" stroke="#FFB800" strokeWidth={5} dot={false} activeDot={{ r: 6, strokeWidth: 0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-brand-primary p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6"><Gift size={22} className="opacity-80" /><p className="text-[9px] uppercase tracking-widest font-black opacity-80">Anniversaries</p></div>
              <h3 className="text-3xl sm:text-4xl font-black mb-1 leading-none">{celebrations.length} Members</h3>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8">Celebrating service this week</p>
              <button 
                onClick={() => setShowAnniversaryModal(true)}
                className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white hover:text-brand-primary transition-all rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                Send Blessings <ArrowRight size={16} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 sm:mb-8">Upcoming Events</h3>
            <div className="space-y-5 sm:space-y-6">
              {[
                { date: 'OCT 28', title: "Men's Breakfast", time: '8:00 AM • Main Hall' },
                { date: 'OCT 29', title: 'Sunday Service', time: '9:00 AM • Sanctuary' },
              ].map((ev, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black bg-slate-100 text-brand-primary flex-shrink-0 transition-transform group-hover:scale-105`}>
                    <span className="text-[9px] opacity-70 mb-0.5">{ev.date.split(' ')[0]}</span>
                    <span className="text-base sm:text-lg">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-brand-primary transition-colors leading-tight truncate">{ev.title}</h4>
                    <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anniversaries Modal */}
      {showAnniversaryModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 bg-brand-primary text-white relative">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="text-brand-gold" size={28} />
                    <h3 className="text-2xl font-black tracking-tight uppercase">Kingdom Celebrations</h3>
                  </div>
                  <p className="text-slate-300 font-medium">Spiritual and personal milestones for the week.</p>
                </div>
                <button 
                  onClick={() => setShowAnniversaryModal(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {celebrations.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                      <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.type === 'Birthday' && <Cake size={12} className="text-rose-500" />}
                        {item.type === 'Wedding' && <Heart size={12} className="text-indigo-500" />}
                        {item.type === 'Membership' && <Star size={12} className="text-brand-gold" />}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.type} • {item.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="px-3 py-1 bg-white border border-slate-200 text-[9px] font-black uppercase text-slate-400 rounded-lg group-hover:border-brand-primary group-hover:text-brand-primary transition-colors">Upcoming</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-brand-primary/5 rounded-[2rem] border border-dashed border-brand-primary/20 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-brand-primary text-white rounded-lg shadow-sm">
                      <MessageSquare size={16} />
                   </div>
                   <h5 className="font-black text-brand-primary text-xs uppercase tracking-widest">Blessing Message (Preview)</h5>
                </div>
                <div className="bg-white p-4 rounded-xl text-sm text-slate-600 font-medium leading-relaxed border border-brand-primary/10 italic">
                  "Jambo {celebrations[0].name}, the Imani Parish family wishes you a blessed {celebrations[0].type.toLowerCase()}! May the Lord shine His face upon you this Oct 26. Stay favored! 🙏✨"
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowAnniversaryModal(false)}
                className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-200 rounded-2xl transition-all uppercase tracking-widest text-xs"
              >
                Dismiss
              </button>
              <button 
                onClick={handleSendBlessings}
                disabled={isSendingBlessings || blessingSent}
                className={`flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                  blessingSent 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-brand-primary text-white hover:bg-brand-primary-700 shadow-brand-primary/10'
                }`}
              >
                {isSendingBlessings ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : blessingSent ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Send size={18} />
                )}
                {isSendingBlessings ? 'Sending SMS...' : blessingSent ? 'Sent Successfully' : 'Broadcast Blessings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
