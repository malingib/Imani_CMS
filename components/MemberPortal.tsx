
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
  
  const todayStr = new Date().toISOString().split('T')[0];
  
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
      <header className="relative bg-indigo-950 rounded-[3rem] p-8 lg:p-12 text-white overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles size={32} className="text-indigo-300" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight">Karibu, {member.firstName}!</h2>
                <p className="text-indigo-200 font-medium lg:text-lg">We are blessed to have you in our community.</p>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 inline-block">
              <Quote className="text-indigo-400 mb-2" size={20} />
              <p className="italic text-lg font-medium leading-relaxed">
                "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you."
              </p>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mt-2">— Numbers 6:24-25</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/20 w-full lg:w-80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">My Profile</h4>
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
                  <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center">
                    <UserIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.firstName} {member.lastName}</p>
                    <p className="text-[10px] text-indigo-200 uppercase font-black">{member.membershipType}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 font-black uppercase">Phone</p>
                  <p className="text-xs font-bold text-white">{member.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 font-black uppercase">Email</p>
                  <p className="text-xs font-bold text-white truncate">{member.email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <input 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
                <input 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <input 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <button 
                  onClick={handleSave}
                  className="w-full py-2 bg-white text-indigo-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14}/> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[120%] bg-indigo-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Giving Summary Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wallet size={28} />
              </div>
              <button 
                onClick={() => onNavigate('MY_GIVING')}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">My Giving</h3>
            <p className="text-slate-400 text-sm font-medium mb-6">Thank you for your faithful support to the kingdom.</p>
            <p className="text-5xl font-black text-slate-800 tracking-tighter">
              KES {totalGiving.toLocaleString()}
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Annual Contribution (2024)</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
             {myTransactions.slice(0, 2).map(t => (
               <div key={t.id} className="flex justify-between items-center">
                 <span className="text-sm font-bold text-slate-600">{t.type}</span>
                 <span className="text-sm font-black text-emerald-600">KES {t.amount.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Next Service/Events Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Calendar className="text-indigo-600" size={24} /> Upcoming Events
            </h3>
            <button 
              onClick={() => onNavigate('EVENTS')}
              className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
            >
              Full Calendar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
              const isRegistered = registeredEvents.has(event.id);
              const isToday = event.date === todayStr;

              return (
                <div key={event.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group relative overflow-hidden">
                  {isToday && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full animate-pulse border border-amber-200">
                      <Zap size={10} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Today</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-indigo-900 rounded-2xl shadow-lg flex flex-col items-center justify-center font-black leading-none text-white flex-shrink-0">
                      <span className="text-[10px] uppercase opacity-70 mb-1">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-slate-400" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{event.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <MapPin size={12} className="text-indigo-400" /> {event.location}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium italic">
                      {event.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleRegister(event.id)}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isRegistered 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' 
                        : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 size={14} /> Registered
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={14} /> Register Now
                      </>
                    )}
                  </button>
                </div>
              );
            }) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-300 space-y-4">
                <Calendar size={48} className="opacity-20" />
                <p className="font-bold">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sermon Card */}
        <div className="lg:col-span-2 bg-indigo-50 p-8 lg:p-10 rounded-[3rem] border border-indigo-100 flex flex-col md:flex-row gap-8 items-center group">
          <div className="w-full md:w-48 h-64 bg-indigo-900 rounded-[2rem] shadow-2xl relative overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen size={64} className="text-indigo-300 opacity-20" />
             </div>
             <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Latest Sermon</p>
                <p className="font-bold text-white text-lg leading-tight">Divine Favor in Your Work</p>
             </div>
          </div>
          <div className="flex-1 space-y-6">
             <div>
                <h3 className="text-3xl font-black text-slate-800 leading-tight">Catch up on Sunday's Word</h3>
                <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
                  Missing a service doesn't mean missing the message. Access our full library of sermons and study guides.
                </p>
             </div>
             <button 
              onClick={() => onNavigate('SERMONS')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
             >
               Browse Sermons <BookOpen size={20} />
             </button>
          </div>
        </div>

        {/* Cell Group Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Heart className="text-rose-500" size={24} /> My Cell Group
          </h4>
          <div className="space-y-6 flex-1">
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Fellowship Group</p>
                <p className="text-2xl font-black text-slate-800">{member.group}</p>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><MapPin size={16}/></div>
                   {member.location} Outreach Center
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={16}/></div>
                   Every Thursday, 6:00 PM
                </div>
             </div>
          </div>
          <button className="mt-8 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Contact Leader <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
