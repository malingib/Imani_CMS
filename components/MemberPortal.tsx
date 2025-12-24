
import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  BookOpen, 
  Calendar, 
  Wallet, 
  ArrowRight, 
  Sparkles, 
  Quote,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  Zap,
  ChevronRight,
  User as UserIcon,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView } from '../types';

interface MemberPortalProps {
  member: Member;
  transactions: Transaction[];
  events: ChurchEvent[];
  onNavigate: (view: AppView) => void;
  onUpdateProfile: (member: Member) => void;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ member, transactions, events, onNavigate, onUpdateProfile }) => {
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member>({ ...member });
  
  const myTransactions = transactions.filter(t => t.memberId === member.id);
  const totalGiving = myTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [events]);

  const handleRegister = (eventId: string) => {
    setRegisteredEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Welcome Banner */}
      <header className="relative bg-brand-solid rounded-[3rem] p-8 lg:p-12 text-white overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles size={32} className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight uppercase">Karibu, {member.firstName}!</h2>
                <p className="text-slate-300 font-medium lg:text-lg">We are blessed to have you in our community.</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 inline-block">
              <Quote className="text-brand-gold mb-2" size={20} />
              <p className="italic text-lg font-medium leading-relaxed">
                "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you."
              </p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">— Numbers 6:24-25</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/20 w-full lg:w-80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">My Profile</h4>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/40 transition-all"
              >
                {isEditing ? <X size={16}/> : <Edit3 size={16} />}
              </button>
            </div>
            
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-400/30 flex items-center justify-center">
                    <UserIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{member.firstName} {member.lastName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{member.membershipType}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase">Phone</p>
                  <p className="text-xs font-bold text-white">{member.phone}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-brand-gold"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <button 
                  onClick={handleSave}
                  className="w-full py-2 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14}/> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[120%] bg-indigo-600 rounded-full blur-[120px] opacity-10 animate-pulse"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-50 text-brand-primary rounded-2xl">
                <Wallet size={28} />
              </div>
              <button 
                onClick={() => onNavigate('MY_GIVING')}
                className="text-slate-400 hover:text-brand-primary transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">My Giving</h3>
            <p className="text-slate-400 text-sm font-medium mb-6">Thank you for your faithful support to the kingdom.</p>
            <p className="text-5xl font-black text-slate-800 tracking-tighter">
              KES {totalGiving.toLocaleString()}
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Annual Contribution</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Calendar className="text-brand-primary" size={24} /> Upcoming Events
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-brand-primary/20 hover:bg-white transition-all group relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-brand-primary rounded-2xl shadow-lg flex flex-col items-center justify-center font-black leading-none text-white flex-shrink-0">
                    <span className="text-[10px] uppercase opacity-70 mb-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight group-hover:text-brand-primary transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1">{event.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRegister(event.id)}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                    registeredEvents.has(event.id) 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-white text-brand-primary border border-indigo-100 hover:bg-brand-primary hover:text-white'
                  }`}
                >
                  {registeredEvents.has(event.id) ? 'Registered' : 'Register Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
