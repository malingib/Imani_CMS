
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, MoreVertical, 
  Search, Users, Trash2, Edit2, CheckCircle2, X,
  Bell, Repeat, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon,
  Filter, Sparkles, Map, Loader2, UserCheck, Search as SearchIcon,
  Music, BookOpen, HeartHandshake, Globe, Zap, HelpCircle,
  User, Phone, CalendarClock, ExternalLink, Navigation
} from 'lucide-react';
import { ChurchEvent, Member, RecurrenceType, ChurchEventType } from '../types';
import { scoutOutreachLocations } from '../services/geminiService';

interface EventsManagementProps {
  events: ChurchEvent[];
  members: Member[];
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

const EventsManagement: React.FC<EventsManagementProps> = ({ events, members, onAddEvent, onDeleteEvent, onUpdateAttendance }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<string | null>(null);
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
  const activeEvent = useMemo(() => events.find(e => e.id === showAttendanceModal), [events, showAttendanceModal]);
  const [currentAttendance, setCurrentAttendance] = useState<string[]>([]);

  useEffect(() => {
    if (activeEvent) {
      setCurrentAttendance(activeEvent.attendance);
    }
  }, [activeEvent]);

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

    // Attempt to get browser location for context
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Events Management</h2>
          <p className="text-slate-500 mt-2 text-lg">Schedule services and track spiritual engagement across the ministry.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowScoutModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-brand-primary border border-indigo-100 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-sm text-xs sm:text-sm">
             <Sparkles size={20}/> AI Outreach Scouter
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-xs sm:text-sm">
             <Plus size={20} /> Schedule Event
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm self-start">
        <button onClick={() => setViewMode('GRID')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'GRID' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><LayoutGrid size={16}/> Cards</button>
        <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'CALENDAR' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Calendar size={16}/> Calendar</button>
        <button onClick={() => setViewMode('MAP')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Map size={16}/> Outreach Map</button>
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
            return (
              <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                <div className="p-8 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl text-white shadow-lg ${config.color}`}>
                      <Icon size={20} />
                    </div>
                    {event.recurrence && event.recurrence !== 'NONE' && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                        <Repeat size={10}/> {event.recurrence}
                      </span>
                    )}
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

                  {(event.coordinator || event.contactPerson) && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {event.coordinator && (
                        <div className="p-3 bg-brand-primary/5 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Coordinator</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{event.coordinator}</p>
                        </div>
                      )}
                      {event.rsvpDeadline && (
                        <div className="p-3 bg-rose-50 rounded-2xl">
                          <p className="text-[8px] font-black text-rose-400 uppercase">RSVP By</p>
                          <p className="text-xs font-bold text-rose-700">{event.rsvpDeadline}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700 font-black text-sm">
                    <Users size={18} className="text-brand-primary" /> 
                    {event.attendance.length} <span className="hidden sm:inline">Attending</span>
                  </div>
                  <button onClick={() => setShowAttendanceModal(event.id)} className="px-6 py-2.5 bg-white text-brand-primary text-xs font-black rounded-xl border border-indigo-100 hover:bg-brand-primary hover:text-white transition-all shadow-sm">Roll Call</button>
                </div>
              </div>
            );
          })}
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

      {/* Attendance Modal */}
      {showAttendanceModal && activeEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-50 text-brand-primary rounded-2xl"><UserCheck size={24}/></div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Roll Call Tracking</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{activeEvent.title}</p>
                 </div>
               </div>
               <button onClick={() => setShowAttendanceModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24}/></button>
            </div>

            <div className="relative">
               <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
               <input 
                type="text" 
                placeholder="Find member to mark present..." 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                value={attendanceSearch}
                onChange={e => setAttendanceSearch(e.target.value)}
               />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
               {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(attendanceSearch.toLowerCase())).map(m => {
                 const isPresent = currentAttendance.includes(m.id);
                 return (
                   <button 
                    key={m.id}
                    onClick={() => toggleAttendance(m.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isPresent ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isPresent ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {m.firstName[0]}{m.lastName[0]}
                       </div>
                       <div className="text-left">
                          <p className={`text-sm font-bold ${isPresent ? 'text-brand-primary' : 'text-slate-700'}`}>{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{m.group}</p>
                       </div>
                     </div>
                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isPresent ? 'bg-brand-primary text-white rotate-0' : 'border-2 border-slate-100 rotate-45'}`}>
                        {isPresent && <CheckCircle2 size={16}/>}
                     </div>
                   </button>
                 );
               })}
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
               <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{currentAttendance.length} souls present</p>
               <div className="flex gap-3">
                 <button onClick={() => setShowAttendanceModal(null)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 uppercase text-[10px] tracking-widest">Discard</button>
                 <button onClick={saveRollCall} className="px-8 py-3 bg-brand-primary text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 uppercase text-[10px] tracking-widest">Save Attendance</button>
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
