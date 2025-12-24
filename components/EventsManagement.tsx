
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, MoreVertical, 
  Search, Users, Trash2, Edit2, CheckCircle2, X,
  Bell, Repeat, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon,
  Filter
} from 'lucide-react';
import { ChurchEvent, Member, MemberStatus, RecurrenceType } from '../types';

interface EventsManagementProps {
  events: ChurchEvent[];
  members: Member[];
  onAddEvent: (event: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateAttendance: (eventId: string, memberIds: string[]) => void;
}

const EventsManagement: React.FC<EventsManagementProps> = ({ events, members, onAddEvent, onDeleteEvent, onUpdateAttendance }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'CALENDAR' | 'MAP'>('GRID');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Attendance Filtering State
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceGroupFilter, setAttendanceGroupFilter] = useState('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('All');

  const [newEvent, setNewEvent] = useState<Partial<ChurchEvent>>({
    recurrence: 'NONE',
    coordinates: { lat: -1.286389, lng: 36.817223 } // Default Nairobi
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const groups = useMemo(() => Array.from(new Set(members.map(m => m.group))), [members]);

  // Filtered members for attendance roll call
  const filteredMembersForAttendance = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(attendanceSearch.toLowerCase());
      const matchesGroup = attendanceGroupFilter === 'All' || member.group === attendanceGroupFilter;
      const matchesStatus = attendanceStatusFilter === 'All' || member.status === attendanceStatusFilter;
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [members, attendanceSearch, attendanceGroupFilter, attendanceStatusFilter]);

  // Mock locations for existing events
  useEffect(() => {
    events.forEach(e => {
      if (!e.coordinates) {
        // Randomly scatter around Nairobi for demo
        e.coordinates = {
          lat: -1.286389 + (Math.random() - 0.5) * 0.1,
          lng: 36.817223 + (Math.random() - 0.5) * 0.1
        };
      }
    });
  }, [events]);

  useEffect(() => {
    if (viewMode === 'MAP' && mapContainerRef.current && !mapInstanceRef.current) {
      const L = (window as any).L;
      if (!L) return;

      const map = L.map(mapContainerRef.current).setView([-1.286389, 36.817223], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    if (viewMode === 'MAP' && mapInstanceRef.current) {
      const L = (window as any).L;
      // Clear old markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      events.forEach(event => {
        if (event.coordinates) {
          const marker = L.marker([event.coordinates.lat, event.coordinates.lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(`<b>${event.title}</b><br>${event.location}<br>${event.time}`);
          
          markersRef.current[event.id] = marker;
          
          marker.on('click', () => {
            setSelectedEventId(event.id);
          });
        }
      });
    }

    return () => {
      if (viewMode !== 'MAP' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, events]);

  useEffect(() => {
    if (selectedEventId && markersRef.current[selectedEventId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedEventId];
      const coords = marker.getLatLng();
      mapInstanceRef.current.flyTo(coords, 14);
      marker.openPopup();
    }
  }, [selectedEventId]);

  const handleToggleAttendance = (memberId: string) => {
    if (!showAttendanceModal) return;
    const event = events.find(e => e.id === showAttendanceModal);
    if (!event) return;
    const newAttendance = event.attendance.includes(memberId)
      ? event.attendance.filter(id => id !== memberId)
      : [...event.attendance, memberId];
    onUpdateAttendance(showAttendanceModal, newAttendance);
  };

  const resetAttendanceFilters = () => {
    setAttendanceSearch('');
    setAttendanceGroupFilter('All');
    setAttendanceStatusFilter('All');
  };

  const handleSetReminder = (eventId: string, reminderTime: string) => {
    alert(`Reminder set for ${reminderTime} before the event!`);
    setShowReminderModal(null);
  };

  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-800">October 2023</h3>
          <div className="flex gap-2">
            <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100"><ChevronLeft size={20}/></button>
            <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
          {days.map(d => (
            <div key={d} className="bg-slate-50 p-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">{d}</div>
          ))}
          {calendarDays.map(day => {
            const dateStr = `2023-10-${day.toString().padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            return (
              <div key={day} className="bg-white min-h-[120px] p-4 group hover:bg-slate-50 transition-colors">
                <span className="text-sm font-black text-slate-400">{day}</span>
                <div className="mt-2 space-y-1">
                  {dayEvents.map(de => (
                    <div key={de.id} className="p-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black truncate border border-indigo-100">
                      {de.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Events Management</h2>
          <p className="text-slate-500 mt-2 text-lg">Schedule services, track attendance, and visualize outreach.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mr-2">
            <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-xl transition-all ${viewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}><LayoutGrid size={20}/></button>
            <button onClick={() => setViewMode('CALENDAR')} className={`p-2 rounded-xl transition-all ${viewMode === 'CALENDAR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}><Calendar size={20}/></button>
            <button onClick={() => setViewMode('MAP')} className={`p-2 rounded-xl transition-all ${viewMode === 'MAP' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600'}`}><MapIcon size={20}/></button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"><Plus size={20} /> Schedule Event</button>
        </div>
      </div>

      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
          <div className="lg:col-span-2 relative">
            <div ref={mapContainerRef} className="h-full border border-slate-200 shadow-xl overflow-hidden rounded-[2.5rem]" />
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-y-auto p-6 space-y-4">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-indigo-600"/> Locations</h3>
            {events.map(event => (
              <button 
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedEventId === event.id ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
              >
                <p className="font-black text-slate-800 text-sm">{event.title}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {event.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-600">{event.date}</span>
                  <span className="text-[10px] font-black text-slate-400">{event.attendance.length} Souls</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : viewMode === 'CALENDAR' ? renderCalendar() : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-sm"><Calendar size={28} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReminderModal(event.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-2xl transition-all"><Bell size={20}/></button>
                    <button onClick={() => onDeleteEvent(event.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><Trash2 size={20}/></button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><Clock size={18} className="text-indigo-500" /> {event.date} • {event.time}</div>
                  <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><MapPin size={18} className="text-indigo-500" /> {event.location}</div>
                  {event.recurrence && event.recurrence !== 'NONE' && (
                    <div className="flex items-center gap-4 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3"><Repeat size={14} /> Recurrs {event.recurrence.toLowerCase()}</div>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-700 font-black text-sm"><Users size={18} className="text-indigo-600" /> {event.attendance.length} Attending</div>
                <button 
                  onClick={() => { setShowAttendanceModal(event.id); resetAttendanceFilters(); }} 
                  className="px-4 py-2 bg-white text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Roll Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder modal... */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-6 animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Schedule New Event</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Event Title" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea placeholder="Description" rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800" onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
              </div>
              <input type="text" placeholder="Location Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-800" onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black uppercase text-indigo-600 mb-2">Coordinates (Optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Lat" className="p-2 bg-white rounded-lg text-xs font-bold" value={newEvent.coordinates?.lat} onChange={e => setNewEvent({...newEvent, coordinates: {...newEvent.coordinates!, lat: parseFloat(e.target.value)}})} />
                  <input type="number" placeholder="Lng" className="p-2 bg-white rounded-lg text-xs font-bold" value={newEvent.coordinates?.lng} onChange={e => setNewEvent({...newEvent, coordinates: {...newEvent.coordinates!, lng: parseFloat(e.target.value)}})} />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-[1.5rem]">Cancel</button>
              <button onClick={() => { onAddEvent({...newEvent, id: Date.now().toString(), attendance: []} as ChurchEvent); setShowAddModal(false); }} className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-[1.5rem] shadow-xl hover:bg-indigo-700">Schedule</button>
            </div>
          </div>
        </div>
      )}
      
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-2xl font-black text-slate-800">Roll Call</h3>
              <button onClick={() => setShowAttendanceModal(null)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm"><X size={20}/></button>
            </div>

            {/* Attendance Filters */}
            <div className="p-6 bg-white border-b border-slate-50 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search members by name..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={attendanceSearch}
                  onChange={e => setAttendanceSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Fellowship Group</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    value={attendanceGroupFilter}
                    onChange={e => setAttendanceGroupFilter(e.target.value)}
                  >
                    <option value="All">All Groups</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Member Status</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    value={attendanceStatusFilter}
                    onChange={e => setAttendanceStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-4">
              {filteredMembersForAttendance.map(member => {
                const isPresent = events.find(e => e.id === showAttendanceModal)?.attendance.includes(member.id);
                return (
                  <button 
                    key={member.id} 
                    onClick={() => handleToggleAttendance(member.id)} 
                    className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all ${isPresent ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-black text-slate-800 text-sm">{member.firstName} {member.lastName}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{member.group}</span>
                        <span className={`text-[10px] font-black uppercase ${member.status === MemberStatus.ACTIVE ? 'text-emerald-500' : 'text-slate-400'}`}>• {member.status}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-2 border-slate-200 bg-white'}`}>
                      {isPresent ? <CheckCircle2 size={20} /> : null}
                    </div>
                  </button>
                );
              })}
              {filteredMembersForAttendance.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <Filter className="mx-auto text-slate-200" size={48} />
                  <p className="text-slate-400 font-bold">No members match your filters</p>
                </div>
              )}
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setShowAttendanceModal(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
              >
                Close Roll Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
