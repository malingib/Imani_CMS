
import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  Target,
  Layers,
  Activity,
  ChevronLeft,
  BellRing,
  BookMarked,
  LayoutGrid,
  ListFilter,
  Plus,
  Download
} from 'lucide-react';
import { Member, Transaction, ChurchEvent, AppView, MemberActivity } from '../types';
import { generateDailyVerse } from '../services/geminiService';

interface MemberPortalProps {
  member: Member;
  transactions: Transaction[];
  events: ChurchEvent[];
  activities: MemberActivity[];
  onNavigate: (view: AppView) => void;
  onUpdateProfile: (member: Member) => void;
  onRSVP: (eventId: string, isRSVPing: boolean) => void;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ member, transactions, events, activities, onNavigate, onUpdateProfile, onRSVP }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member>({ ...member });
  const [dailyVerse, setDailyVerse] = useState({ text: 'Loading inspirational word...', ref: '' });
  const [eventFilter, setEventFilter] = useState<'ALL' | 'REGISTERED'>('ALL');

  const myTransactions = useMemo(() => transactions.filter(t => t.memberId === member.id), [transactions, member.id]);
  const totalGiving = myTransactions.reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const raw = await generateDailyVerse();
        if (raw) {
          const [text, ref] = raw.split('|');
          setDailyVerse({ text: text?.trim() || '', ref: ref?.trim() || '' });
        }
      } catch (e) {
        setDailyVerse({ text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" });
      }
    };
    fetchVerse();
  }, []);

  const isGoing = (eventId: string) => events.find(e => e.id === eventId)?.attendance.includes(member.id);

  const upcomingEvents = useMemo(() => {
    let filtered = events.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));
    if (eventFilter === 'REGISTERED') {
      filtered = filtered.filter(e => e.attendance.includes(member.id));
    }
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, eventFilter, member.id]);

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Top Profile Card / Hero Section */}
      <section className="relative overflow-hidden bg-brand-primary rounded-[3.5rem] p-8 lg:p-14 text-white shadow-2xl">
        <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border-4 border-white/20 p-1 group">
                   {member.photo ? (
                     <img src={member.photo} className="w-full h-full object-cover rounded-[2.1rem]" />
                   ) : (
                     <div className="w-full h-full bg-indigo-500/20 rounded-[2.1rem] flex items-center justify-center text-white/40">
                        <UserIcon size={48}/>
                     </div>
                   )}
                   <div className="absolute -bottom-2 -right-2 bg-brand-gold text-brand-primary p-2.5 rounded-2xl shadow-xl border-4 border-brand-primary">
                      <CheckCircle2 size={18}/>
                   </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">Jambo, {member.firstName}!</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 justify-center sm:justify-start">
                   <span className="px-4 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-200">{member.membershipType}</span>
                   <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <MapPin size={14} className="text-brand-gold"/> {member.location}
                   </span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 relative group">
               <Quote className="absolute -top-4 left-8 text-brand-gold" size={32} />
               <div className="space-y-4">
                  <p className="text-xl sm:text-2xl font-bold italic leading-relaxed text-indigo-50">
                    "{dailyVerse.text}"
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                     <span className="h-px w-8 bg-white/20"></span> {dailyVerse.ref}
                  </p>
               </div>
               <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={24} className="text-brand-gold animate-pulse"/>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">My Stewardship</h4>
                   <button onClick={() => onNavigate('MY_GIVING')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><ArrowRight size={16}/></button>
                </div>
                <div className="space-y-1">
                   <p className="text-4xl font-black tracking-tighter">KES {totalGiving.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Total 2024 Contribution</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-gold rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[9px] font-black text-white/40 uppercase text-center italic">65% of your annual target met. Keep pressing on!</p>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-indigo rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute top-0 right-0 w-full h-full grid-pattern opacity-10"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Events & Ministries */}
        <div className="lg:col-span-8 space-y-10">
           {/* Comprehensive Events Section */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><CalendarCheck size={28}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ministry Schedule</h3>
                       <p className="text-slate-400 font-medium text-sm">Stay connected with our weekly services.</p>
                    </div>
                 </div>
                 <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
                    <button 
                       onClick={() => setEventFilter('ALL')}
                       className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${eventFilter === 'ALL' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
                    >
                       All
                    </button>
                    <button 
                       onClick={() => setEventFilter('REGISTERED')}
                       className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${eventFilter === 'REGISTERED' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
                    >
                       Registered
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                   const going = isGoing(event.id);
                   return (
                     <div key={event.id} className="group bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
                        <div className="space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-lg">
                                 <span className="text-[10px] uppercase opacity-60 leading-none mb-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                 <span className="text-xl leading-none">{new Date(event.date).getDate()}</span>
                              </div>
                              {going && (
                                 <div className="p-2 bg-brand-emerald text-white rounded-xl shadow-lg animate-in zoom-in">
                                    <CheckCircle2 size={16}/>
                                 </div>
                              )}
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-slate-800 uppercase leading-tight line-clamp-1">{event.title}</h4>
                              <div className="flex items-center gap-4 mt-3">
                                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                                    <Clock size={12} className="text-brand-indigo"/> {event.time}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                                    <MapPin size={12} className="text-brand-indigo"/> {event.location}
                                 </div>
                              </div>
                           </div>
                        </div>
                        <button 
                           onClick={() => onRSVP(event.id, !going)}
                           className={`mt-8 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${
                             going 
                               ? 'bg-brand-emerald/10 text-brand-emerald hover:bg-rose-50 hover:text-rose-500' 
                               : 'bg-white text-brand-indigo border border-indigo-100 hover:bg-brand-primary hover:text-white'
                           }`}
                        >
                           {going ? 'Deregister' : 'Register Now'}
                        </button>
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                   );
                 }) : (
                   <div className="md:col-span-2 py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                         <CalendarCheck size={40}/>
                      </div>
                      <p className="font-bold text-slate-400">No events found in this category.</p>
                   </div>
                 )}
              </div>
              <button onClick={() => onNavigate('EVENTS' as any)} className="w-full py-4 bg-slate-50 text-slate-400 hover:text-brand-indigo rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 View Full Church Calendar <ChevronRight size={14}/>
              </button>
           </div>

           {/* Personal Ministries/Groups */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl"><Layers size={20}/></div>
                       <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Groups</h4>
                    </div>
                    <span className="text-[10px] font-black text-brand-primary uppercase">{member.groups.length} Ministries</span>
                 </div>
                 <div className="space-y-3">
                    {member.groups.map(group => (
                       <div key={group} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-6 bg-brand-gold rounded-full opacity-40 group-hover:opacity-100 transition-opacity"></div>
                             <span className="font-bold text-sm text-slate-700">{group}</span>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-brand-primary transition-all"><ChevronRight size={16}/></button>
                       </div>
                    ))}
                    <button onClick={() => onNavigate('GROUPS' as any)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2">
                       <Plus size={14}/> Join New Ministry
                    </button>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl"><BookMarked size={20}/></div>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Library Access</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-4 group cursor-pointer hover:bg-indigo-100 transition-all">
                       <p className="text-[9px] font-black uppercase text-brand-indigo tracking-widest flex items-center gap-2">
                          <Zap size={12} fill="currentColor"/> New Resource Available
                       </p>
                       <h5 className="font-black text-slate-800 leading-tight">Walking in Faith: A Study Guide for NextGen Ministry</h5>
                       <button className="text-xs font-black text-brand-primary uppercase flex items-center gap-1 group-hover:gap-2 transition-all">Download PDF <Download size={14}/></button>
                    </div>
                    <button onClick={() => onNavigate('SERMONS')} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                       Sermon Archive <BookOpen size={14}/>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Activity Feed & Insights */}
        <div className="lg:col-span-4 space-y-10">
           {/* Personal Activity Feed */}
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <Activity size={20} className="text-brand-indigo"/> Recent Activity
                 </h4>
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><BellRing size={16}/></div>
              </div>
              <div className="relative space-y-8 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
                 {activities.length > 0 ? activities.map((act, i) => (
                   <div key={act.id} className="relative pl-10 group">
                      <div className={`absolute left-0 top-1 w-8 h-8 rounded-xl border-4 border-white shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                        act.type === 'PAYMENT' ? 'bg-brand-emerald text-white' : 
                        act.type === 'EVENT_RSVP' ? 'bg-brand-gold text-white' : 
                        'bg-brand-indigo text-white'
                      }`}>
                         {act.type === 'PAYMENT' ? <Wallet size={12}/> : act.type === 'EVENT_RSVP' ? <CalendarCheck size={12}/> : <UserIcon size={12}/>}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800 leading-snug">{act.description}</p>
                         <p className="text-[10px] font-black uppercase text-slate-300 mt-1 tracking-tighter">
                            {new Date(act.timestamp).toLocaleDateString()} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>
                 )) : (
                   <p className="text-center py-10 text-xs font-black uppercase text-slate-300">No activity yet</p>
                 )}
              </div>
           </div>

           {/* Consistency Insights */}
           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 text-brand-gold">
                    <Target size={28}/>
                    <h4 className="text-xl font-black uppercase tracking-tight">Consistency Pulse</h4>
                 </div>
                 <p className="text-indigo-100 font-medium leading-relaxed">
                   Your service attendance is <span className="text-white font-black">Top 15%</span> this quarter. Maintain your streak for a special recognition during the AGM.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                       <p className="text-2xl font-black">12</p>
                       <p className="text-[9px] font-black uppercase text-slate-400">Week Streak</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
                       <p className="text-2xl font-black">82</p>
                       <p className="text-[9px] font-black uppercase text-slate-400">Stewardship Score</p>
                    </div>
                 </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
           </div>

           {/* Support/Admin Help */}
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[3rem] space-y-4 text-center">
              <h5 className="font-black text-slate-600 uppercase tracking-tight">Need Assistance?</h5>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Contact your parish office for baptism certificates, membership letters or counseling requests.</p>
              <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm">Message Office</button>
           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="p-10 sm:p-14 space-y-10">
                 <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Identity Settings</h3>
                    <button onClick={() => setIsEditing(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                       <input 
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" 
                         value={formData.firstName}
                         onChange={e => setFormData({...formData, firstName: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Last Name</label>
                       <input 
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" 
                         value={formData.lastName}
                         onChange={e => setFormData({...formData, lastName: e.target.value})}
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Contact Hub (Phone)</label>
                       <input 
                         disabled
                         className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold text-slate-400 cursor-not-allowed" 
                         value={formData.phone}
                       />
                       <p className="text-[9px] text-slate-300 italic font-bold uppercase ml-2">Locked to M-Pesa ID. Contact admin to change.</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Discard</button>
                    <button 
                       onClick={handleSave}
                       className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3"
                    >
                       <Save size={20}/> Push Updates
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MemberPortal;
