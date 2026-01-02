
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, MoreVertical, 
  Search, Users, Trash2, Edit2, CheckCircle2, X,
  Bell, Repeat, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon,
  Filter, Sparkles, Map, Loader2, UserCheck, Search as SearchIcon,
  Music, BookOpen, HeartHandshake, Globe, Zap, HelpCircle,
  User, Phone, CalendarClock, ExternalLink, Navigation, Eye,
  Save, Heart, CalendarPlus, UserMinus, Info, ClipboardList,
  BellRing, Mail
} from 'lucide-react';
import { ChurchEvent, Member, RecurrenceType, ChurchEventType, User as UserType, UserRole } from '../types';
import { scoutOutreachLocations } from '../services/geminiService';

interface EventsManagementProps {
  events: ChurchEvent[];
  members: Member[];
  currentUser: UserType | null;
  onRSVP: (eventId: string, isRSVPing: boolean) => void;
  onAddEvent: (event: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateAttendance: (eventId: string, memberIds: string[]) => void;
}

const EVENT_TYPE_CONFIG: Record<ChurchEventType, { icon: any, color: string, label: string }> = {
  WORSHIP: { icon: Music, color: 'bg-brand-indigo', label: 'Worship Service' },
  BIBLE_STUDY: { icon: BookOpen, color: 'bg-brand-gold', label: 'Bible Study' },
  PRAYER: { icon: HeartHandshake, color: 'bg-brand-emerald', label: 'Prayer Meeting' },
  OUTREACH: { icon: Globe, color: 'bg-purple-600', label: 'Special Outreach' },
  YOUTH: { icon: Zap, color: 'bg-pink-600', label: 'Youth Event' },
  OTHER: { icon: HelpCircle, color: 'bg-slate-600', label: 'Other Event' }
};

const EventsManagement: React.FC<EventsManagementProps> = ({ events, members, currentUser, onRSVP, onAddEvent, onDeleteEvent, onUpdateAttendance }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<ChurchEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<ChurchEvent | null>(null);
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'CALENDAR' | 'MAP'>('GRID');
  
  const [newEvent, setNewEvent] = useState<Partial<ChurchEvent>>({
    type: 'WORSHIP',
    recurrence: 'NONE',
    attendance: [],
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterLayer = useRef<any>(null);

  // Scouting State
  const [scoutQuery, setScoutQuery] = useState('High-traffic areas for street ministry');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutResults, setScoutResults] = useState<{ text: string, groundingChunks: any[] } | null>(null);

  const [attendanceSearch, setAttendanceSearch] = useState('');
  const activeEventForRollCall = useMemo(() => events.find(e => e.id === showAttendanceModal), [events, showAttendanceModal]);
  const [currentAttendance, setCurrentAttendance] = useState<string[]>([]);

  // Reminder State
  const [reminderType, setReminderType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [reminderLeadTime, setReminderLeadTime] = useState('1h');

  useEffect(() => {
    if (activeEventForRollCall) {
      setCurrentAttendance(activeEventForRollCall.attendance);
    }
  }, [activeEventForRollCall]);

  useEffect(() => {
    if (viewMode === 'MAP' && mapRef.current) {
      const L = (window as any).L;
      if (!L) return;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([-1.286389, 36.817223], 12);
        L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance.current);
      }

      if (clusterLayer.current) {
        mapInstance.current.removeLayer(clusterLayer.current);
      }

      clusterLayer.current = L.markerClusterGroup();

      events.forEach(event => {
        const lat = event.coordinates?.lat || -1.286389 + (Math.random() - 0.5) * 0.1;
        const lng = event.coordinates?.lng || 36.817223 + (Math.random() - 0.5) * 0.1;
        
        const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OTHER;
        const marker = L.circleMarker([lat, lng], {
          radius: 12,
          fillColor: config.color === 'bg-brand-indigo' ? '#4F46E5' : 
                    config.color === 'bg-brand-gold' ? '#FFB800' : 
                    config.color === 'bg-brand-emerald' ? '#10B981' : 
                    config.color === 'bg-purple-600' ? '#9333ea' : '#4b5563',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        marker.bindPopup(`
          <div class="p-3">
            <p class="text-[10px] font-black uppercase text-slate-400 mb-1">${config.label}</p>
            <h4 class="font-bold text-slate-800 text-sm">${event.title}</h4>
            <p class="text-xs text-slate-500 mt-1">${event.location}</p>
            <p class="text-xs font-bold text-brand-primary mt-2">${event.date} • ${event.time}</p>
          </div>
        `);
        clusterLayer.current.addLayer(marker);
      });

      mapInstance.current.addLayer(clusterLayer.current);
    }
  }, [viewMode, events]);

  const handleScoutOutreach = async () => {
    setIsScouting(true);
    setScoutResults(null);
    
    let lat: number | undefined;
    let lng: number | undefined;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    } catch (e) {
      console.warn("Geolocation access denied, falling back to default city context.");
    }

    try {
      const res = await scoutOutreachLocations(scoutQuery, lat, lng);
      setScoutResults(res);
    } catch (e) {
      alert('AI Scouter error. Please ensure API connectivity.');
    } finally {
      setIsScouting(false);
    }
  };

  const toggleAttendance = (memberId: string) => {
    setCurrentAttendance(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const saveRollCall = () => {
    if (showAttendanceModal) {
      onUpdateAttendance(showAttendanceModal, currentAttendance);
      setShowAttendanceModal(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event: ChurchEvent = {
      id: `ev${Date.now()}`,
      title: newEvent.title || 'Untitled Event',
      description: newEvent.description || '',
      date: newEvent.date || new Date().toISOString().split('T')[0],
      time: newEvent.time || '09:00 AM',
      location: newEvent.location || 'Main Sanctuary',
      type: newEvent.type as ChurchEventType,
      coordinator: newEvent.coordinator,
      contactPerson: newEvent.contactPerson,
      rsvpDeadline: newEvent.rsvpDeadline,
      recurrence: newEvent.recurrence as RecurrenceType,
      attendance: [],
    };
    onAddEvent(event);
    setShowAddModal(false);
    setNewEvent({ type: 'WORSHIP', recurrence: 'NONE', attendance: [] });
  };

  const isUserRSVPd = (event: ChurchEvent) => {
    return currentUser?.memberId && event.attendance.includes(currentUser.memberId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Events Management</h2>
          <p className="text-slate-500 mt-2 text-lg">Schedule services and track spiritual engagement across the ministry.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowScoutModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-brand-primary border border-indigo-100 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-sm text-xs sm:text-sm">
             <Sparkles size={20}/> AI Outreach Scouter
          </button>
          {currentUser?.role !== UserRole.MEMBER && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-xs sm:text-sm">
               <Plus size={20} /> Schedule Event
            </button>
          )}
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm self-start overflow-x-auto no-scrollbar max-w-full">
        <button onClick={() => setViewMode('GRID')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'GRID' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><LayoutGrid size={16}/> Cards</button>
        <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'CALENDAR' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Calendar size={16}/> Calendar</button>
        <button onClick={() => setViewMode('MAP')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'MAP' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Map size={16}/> Outreach Map</button>
      </div>

      {viewMode === 'MAP' ? (
        <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm h-[600px] relative overflow-hidden">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      ) : viewMode === 'CALENDAR' ? (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-300 min-h-[500px]">
           <CalendarClock size={64} className="opacity-20 mb-4"/>
           <p className="font-black uppercase tracking-widest text-sm">Calendar View Coming Soon</p>
           <p className="text-xs font-medium text-slate-400 mt-2">Currently available in Cards & Map views.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => {
            const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OTHER;
            const Icon = config.icon;
            const going = isUserRSVPd(event);
            
            return (
              <div key={event.id} className="relative bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-brand-primary/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-8 space-y-3 z-20">
                  <p className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px] mb-2">Stewardship Suite</p>
                  
                  <button onClick={() => setViewingEvent(event)} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-brand-primary rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-xl">
                    <Eye size={16}/> View Details
                  </button>

                  <button onClick={() => setShowReminderModal(event)} className="w-full flex items-center justify-center gap-3 py-3.5 bg-brand-indigo text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-brand-primary transition-all shadow-xl">
                    <BellRing size={16}/> Set Reminder
                  </button>

                  {currentUser?.role !== UserRole.MEMBER && (
                    <>
                      <button onClick={() => setShowAttendanceModal(event.id)} className="w-full flex items-center justify-center gap-3 py-3.5 bg-brand-gold text-brand-primary rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all shadow-xl">
                        <UserCheck size={16}/> Mark Attendance
                      </button>
                      <button onClick={() => onDeleteEvent(event.id)} className="w-full flex items-center justify-center gap-3 py-3.5 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl">
                        <Trash2 size={16}/> Delete Event
                      </button>
                    </>
                  )}
                  
                  <button className="text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors mt-2" onClick={(e) => e.stopPropagation()}>Dismiss</button>
                </div>

                <div className="p-8 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl text-white shadow-lg ${config.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex gap-2">
                      {going && (
                        <span className="px-3 py-1 bg-brand-emerald text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={10}/> Going
                        </span>
                      )}
                      {event.recurrence && event.recurrence !== 'NONE' && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                          <Repeat size={10}/> {event.recurrence}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-indigo tracking-widest">{config.label}</p>
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-brand-primary transition-colors mt-1">{event.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl">
                      <Clock size={18} className="text-brand-primary" /> 
                      <div className="flex flex-col">
                        <span>{event.date}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl">
                      <MapPin size={18} className="text-brand-primary" /> 
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700 font-black text-sm">
                    <Users size={18} className="text-brand-primary" /> 
                    {event.attendance.length} <span className="hidden sm:inline">Registered</span>
                  </div>
                  <div className="px-4 py-1.5 bg-white text-brand-primary text-[10px] font-black rounded-lg border border-indigo-50 shadow-sm uppercase tracking-widest">Live Log</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 border border-white/20">
             <div className="flex justify-between items-start">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-[1.5rem] shadow-sm flex-shrink-0">
                    <BellRing size={28}/>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Event Alerts</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Personal Notification Opt-in</p>
                 </div>
               </div>
               <button onClick={() => setShowReminderModal(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={20}/></button>
             </div>

             <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-600">Reminder for:</p>
                   <p className="text-sm font-black text-brand-primary uppercase mt-1">{showReminderModal.title}</p>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Channel</label>
                   <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      <button 
                        onClick={() => setReminderType('SMS')}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${reminderType === 'SMS' ? 'bg-white text-brand-primary shadow-md' : 'text-slate-400'}`}
                      >
                         <Phone size={14}/> SMS Alert
                      </button>
                      <button 
                        onClick={() => setReminderType('EMAIL')}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${reminderType === 'EMAIL' ? 'bg-white text-brand-primary shadow-md' : 'text-slate-400'}`}
                      >
                         <Mail size={14}/> Email Hook
                      </button>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lead Time</label>
                   <select 
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                     value={reminderLeadTime}
                     onChange={(e) => setReminderLeadTime(e.target.value)}
                   >
                      <option value="30m">30 Minutes Before</option>
                      <option value="1h">1 Hour Before</option>
                      <option value="2h">2 Hours Before</option>
                      <option value="1d">1 Day Before</option>
                   </select>
                </div>

                <div className="p-5 bg-brand-emerald/5 rounded-2xl border border-dashed border-brand-emerald/20 flex items-start gap-4">
                   <CheckCircle2 className="text-brand-emerald shrink-0 mt-1" size={18}/>
                   <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                      You will receive an automated dispatch via <span className="font-black text-brand-primary">{reminderType}</span> to the contact details on your profile.
                   </p>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                   onClick={() => { alert('Reminder Armed'); setShowReminderModal(null); }}
                   className="w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3"
                >
                   <Save size={18}/> Arm Notification
                </button>
                <button onClick={() => setShowReminderModal(null)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:underline">Dismiss</button>
             </div>
          </div>
        </div>
      )}

      {/* View Event Detail Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            <div className={`p-10 text-white relative overflow-hidden flex-shrink-0 ${EVENT_TYPE_CONFIG[viewingEvent.type].color}`}>
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                    {EVENT_TYPE_CONFIG[viewingEvent.type].label}
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">{viewingEvent.title}</h3>
                </div>
                <button onClick={() => setViewingEvent(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                  <X size={24} />
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            </div>

            <div className="flex-1 overflow-y-auto p-10 sm:p-14 space-y-12 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-7 space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-slate-800">
                      <Info size={24} className="text-brand-indigo" />
                      <h4 className="text-xl font-black uppercase tracking-tight">Mission Description</h4>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                      {viewingEvent.description || "No detailed description provided for this spiritual gathering."}
                    </p>
                  </section>

                  <section className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-brand-indigo">
                        <Clock size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Schedule</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{viewingEvent.date} @ {viewingEvent.time}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-brand-indigo">
                        <MapPin size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Venue</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">{viewingEvent.location}</p>
                    </div>
                  </section>
                </div>

                <div className="md:col-span-5 space-y-8">
                  <div className="p-8 bg-brand-primary text-white rounded-[2.5rem] shadow-xl space-y-6">
                    <h4 className="text-lg font-black uppercase flex items-center gap-3">
                      <Users size={20} className="text-brand-gold" /> Attendance
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-3xl font-black tracking-tighter">{viewingEvent.attendance.length} Souls</p>
                          <p className="text-[10px] font-black text-indigo-300 uppercase">Confirmed RSVP</p>
                       </div>
                       <div className="flex -space-x-3 overflow-hidden">
                          {viewingEvent.attendance.slice(0, 8).map((id, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-primary bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white/10 shadow-sm">
                              {members.find(m => m.id === id)?.firstName[0] || "?"}
                            </div>
                          ))}
                          {viewingEvent.attendance.length > 8 && (
                            <div className="w-10 h-10 rounded-full border-2 border-brand-primary bg-slate-700 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white/10">
                              +{viewingEvent.attendance.length - 8}
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {(viewingEvent.coordinator || viewingEvent.contactPerson) && (
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Phone size={16} /> Contacts
                      </h4>
                      <div className="space-y-4">
                        {viewingEvent.coordinator && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Coordinator</p>
                            <p className="text-sm font-bold text-slate-700">{viewingEvent.coordinator}</p>
                          </div>
                        )}
                        {viewingEvent.contactPerson && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Contact Point</p>
                            <p className="text-sm font-bold text-slate-700">{viewingEvent.contactPerson}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 flex-shrink-0">
               <button onClick={() => setViewingEvent(null)} className="flex-1 py-5 font-black text-slate-500 hover:bg-slate-100 rounded-2xl uppercase text-[11px] tracking-widest transition-all">Close</button>
               {currentUser?.memberId && (
                 <button 
                  onClick={() => { onRSVP(viewingEvent.id, !isUserRSVPd(viewingEvent)); setViewingEvent(null); }}
                  className={`flex-[2] py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
                    isUserRSVPd(viewingEvent) 
                      ? 'bg-rose-500 text-white hover:bg-rose-600' 
                      : 'bg-brand-primary text-white hover:bg-brand-indigo'
                  }`}
                 >
                   {isUserRSVPd(viewingEvent) ? <UserMinus size={20}/> : <CheckCircle2 size={20}/>}
                   {isUserRSVPd(viewingEvent) ? 'Retract My RSVP' : 'Commit Attendance'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg">
                    <Calendar size={24}/>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Schedule New Event</h3>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Event Type & Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(EVENT_TYPE_CONFIG) as ChurchEventType[]).map(type => {
                          const conf = EVENT_TYPE_CONFIG[type];
                          const Icon = conf.icon;
                          const isSelected = newEvent.type === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, type })}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                                isSelected ? 'border-brand-primary bg-indigo-50 text-brand-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              <Icon size={20}/>
                              <span className="text-[8px] font-black uppercase mt-1 text-center leading-tight">{conf.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Event Title</label>
                      <input 
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none"
                        placeholder="e.g. Sunday Morning Worship"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Location / Venue</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                        <input 
                          required
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none"
                          placeholder="e.g. Main Sanctuary"
                          value={newEvent.location}
                          onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                        <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Time</label>
                        <input type="time" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Recurrence Pattern</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary"
                        value={newEvent.recurrence}
                        onChange={e => setNewEvent({...newEvent, recurrence: e.target.value as any})}
                      >
                        <option value="NONE">One-time Event</option>
                        <option value="DAILY">Daily Service</option>
                        <option value="WEEKLY">Weekly Service</option>
                        <option value="MONTHLY">Monthly Fellowship</option>
                        <option value="ANNUALLY">Annual Conference</option>
                      </select>
                    </div>

                    <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 pb-3">Logistics & Contacts</h4>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                          <input 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs"
                            placeholder="Event Coordinator"
                            value={newEvent.coordinator}
                            onChange={e => setNewEvent({...newEvent, coordinator: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                          <input 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs"
                            placeholder="Contact Person (Ph/Email)"
                            value={newEvent.contactPerson}
                            onChange={e => setNewEvent({...newEvent, contactPerson: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">RSVP Deadline (Optional)</label>
                        <input 
                          type="date"
                          className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold text-xs"
                          value={newEvent.rsvpDeadline}
                          onChange={e => setNewEvent({...newEvent, rsvpDeadline: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Short Description</label>
                      <textarea 
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none resize-none"
                        placeholder="Purpose of the event..."
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-[1.5rem] uppercase text-xs tracking-widest transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3">
                  <CheckCircle2 size={20}/> Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance / Roll Call Modal */}
      {showAttendanceModal && activeEventForRollCall && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-white/20">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-5">
                 <div className="p-4 bg-brand-gold text-brand-primary rounded-[1.5rem] shadow-xl shadow-brand-gold/20"><ClipboardList size={32}/></div>
                 <div>
                   <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Mark Roll Call</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{activeEventForRollCall.title} • {activeEventForRollCall.date}</p>
                 </div>
               </div>
               <button onClick={() => setShowAttendanceModal(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 border border-slate-100"><X size={24}/></button>
            </div>

            <div className="relative group">
               <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-indigo transition-colors" size={22}/>
               <input 
                type="text" 
                placeholder="Search congregant by name or fellowship..." 
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-bold text-slate-700 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all shadow-inner"
                value={attendanceSearch}
                onChange={e => setAttendanceSearch(e.target.value)}
               />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 py-2">
               {members.filter(m => `${m.firstName} ${m.lastName} ${m.groups?.join(' ')}`.toLowerCase().includes(attendanceSearch.toLowerCase())).map(m => {
                 const isPresent = currentAttendance.includes(m.id);
                 return (
                   <button 
                    key={m.id}
                    onClick={() => toggleAttendance(m.id)}
                    className={`w-full group flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all ${isPresent ? 'bg-brand-emerald border-brand-emerald shadow-xl shadow-emerald-100' : 'bg-white border-slate-50 hover:border-slate-200'}`}
                   >
                     <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${isPresent ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                          {m.photo ? (
                            <img src={m.photo} className="w-full h-full object-cover rounded-2xl" alt="" />
                          ) : (
                            <span>{m.firstName[0]}{m.lastName[0]}</span>
                          )}
                       </div>
                       <div className="text-left min-w-0">
                          <p className={`text-base font-black truncate ${isPresent ? 'text-white' : 'text-slate-800'}`}>{m.firstName} {m.lastName}</p>
                          <div className="flex gap-2 mt-1">
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isPresent ? 'bg-white/10 text-white' : 'bg-brand-indigo/5 text-brand-indigo'}`}>{m.membershipType}</span>
                          </div>
                       </div>
                     </div>
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isPresent ? 'bg-white text-brand-emerald rotate-0' : 'bg-slate-50 text-slate-200 rotate-45 border-2 border-slate-100'}`}>
                        {isPresent ? <CheckCircle2 size={24}/> : <Plus size={20}/>}
                     </div>
                   </button>
                 );
               })}
               {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(attendanceSearch.toLowerCase())).length === 0 && (
                 <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner"><Users size={32}/></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching souls found</p>
                 </div>
               )}
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
               <div className="text-center sm:text-left">
                  <p className="text-2xl font-black text-brand-primary tracking-tighter">{currentAttendance.length}</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Verified Present</p>
               </div>
               <div className="flex gap-4 w-full sm:w-auto">
                 <button onClick={() => setShowAttendanceModal(null)} className="flex-1 sm:flex-none px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black hover:bg-slate-100 uppercase text-[11px] tracking-widest transition-all">Discard</button>
                 <button onClick={saveRollCall} className="flex-[2] sm:flex-none px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-brand-indigo uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3">
                   <Save size={20}/> Save Attendance
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Scout Modal */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-50 text-brand-primary rounded-2xl"><Sparkles size={24}/></div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Geo-Outreach Scouter</h3>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Powered by Gemini Maps Grounding</p>
                 </div>
               </div>
               <button onClick={() => setShowScoutModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Define your Outreach Mission</label>
              <div className="flex gap-3">
                <input 
                  className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
                  value={scoutQuery}
                  onChange={e => setScoutQuery(e.target.value)}
                  placeholder="e.g. Public parks in Nairobi for a family worship day"
                  onKeyDown={(e) => e.key === 'Enter' && handleScoutOutreach()}
                />
                <button 
                  onClick={handleScoutOutreach}
                  disabled={isScouting}
                  className="px-6 py-4 bg-brand-primary text-white rounded-2xl font-black hover:bg-brand-primary/90 transition-all shadow-lg flex items-center justify-center min-w-[120px] gap-2"
                >
                  {isScouting ? <Loader2 className="animate-spin" size={20}/> : <Navigation size={18}/>}
                  {isScouting ? 'Scouting...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-6">
               {scoutResults ? (
                 <div className="space-y-6">
                    <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                       <p className="text-slate-700 text-sm font-medium leading-relaxed italic">"{scoutResults.text}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {scoutResults.groundingChunks.map((chunk: any, i: number) => (
                         <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all space-y-4 group">
                            <div className="flex justify-between items-start">
                               <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                  <MapPin size={20}/>
                               </div>
                               <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Grounding Chunk {i+1}</span>
                            </div>
                            <div>
                               <h4 className="font-black text-slate-800 text-lg line-clamp-1">{chunk.maps?.title || "Suggested Venue"}</h4>
                               <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">Found via real-time Google Maps data for current region.</p>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                               <a 
                                 href={chunk.maps?.uri} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-brand-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                               >
                                  <ExternalLink size={14}/> Navigate Venue
                               </a>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="h-64 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <MapIcon size={32} />
                    </div>
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-slate-400 leading-relaxed">
                        Allow location access to find high-impact outreach opportunities near you.
                      </p>
                    </div>
                 </div>
               )}
            </div>

            <button onClick={() => setShowScoutModal(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Dismiss Scouter</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
