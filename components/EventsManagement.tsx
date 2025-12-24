
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, MoreVertical, 
  Search, Users, Trash2, Edit2, CheckCircle2, X,
  Bell, Repeat, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon,
  Filter, Sparkles, Map, Loader2, UserCheck, Search as SearchIcon
} from 'lucide-react';
import { ChurchEvent, Member, MemberStatus, RecurrenceType } from '../types';
import { scoutOutreachLocations } from '../services/geminiService';

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
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'CALENDAR' | 'MAP'>('GRID');
  
  // Scouting State
  const [scoutQuery, setScoutQuery] = useState('High-traffic areas for street ministry');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutResults, setScoutResults] = useState<{ text: string, places: any[] } | null>(null);

  // Roll Call State
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const activeEvent = useMemo(() => events.find(e => e.id === showAttendanceModal), [events, showAttendanceModal]);
  const [currentAttendance, setCurrentAttendance] = useState<string[]>([]);

  useEffect(() => {
    if (activeEvent) {
      setCurrentAttendance(activeEvent.attendance);
    }
  }, [activeEvent]);

  const handleScoutOutreach = async () => {
    setIsScouting(true);
    try {
      const res = await scoutOutreachLocations(scoutQuery, -1.286389, 36.817223);
      setScoutResults(res as any);
    } catch (e) {
      alert('AI Scouter error.');
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Events Management</h2>
          <p className="text-slate-500 mt-2 text-lg">Schedule services and track spiritual engagement across the ministry.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowScoutModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-brand-primary border border-indigo-100 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-sm">
             <Sparkles size={20}/> AI Outreach Scouter
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
             <Plus size={20} /> Schedule Event
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm self-start">
        <button onClick={() => setViewMode('GRID')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'GRID' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><LayoutGrid size={16}/> Cards</button>
        <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'CALENDAR' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Calendar size={16}/> Calendar</button>
        <button onClick={() => setViewMode('MAP')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}><Map size={16}/> Outreach Map</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-brand-primary transition-colors">{event.title}</h3>
              <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><Clock size={18} className="text-brand-primary" /> {event.date} • {event.time}</div>
                <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><MapPin size={18} className="text-brand-primary" /> {event.location}</div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-700 font-black text-sm"><Users size={18} className="text-brand-primary" /> {event.attendance.length} Attending</div>
              <button onClick={() => setShowAttendanceModal(event.id)} className="px-4 py-2 bg-white text-brand-primary text-xs font-black rounded-xl border border-indigo-100 hover:bg-brand-primary hover:text-white transition-all shadow-sm">Roll Call</button>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && activeEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-50 text-brand-primary rounded-2xl"><UserCheck size={24}/></div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800">Roll Call Tracking</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{activeEvent.title}</p>
                 </div>
               </div>
               <button onClick={() => setShowAttendanceModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
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
                 <button onClick={() => setShowAttendanceModal(null)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Discard</button>
                 <button onClick={saveRollCall} className="px-8 py-3 bg-brand-primary text-white rounded-xl font-black shadow-lg hover:bg-indigo-700">Save Attendance</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
