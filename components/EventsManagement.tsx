
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, MoreVertical, 
  Search, Users, Trash2, Edit2, CheckCircle2, X,
  Bell, Repeat, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon,
  Filter, Sparkles, Map, Loader2
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
  const [showReminderModal, setShowReminderModal] = useState<string | null>(null);
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'CALENDAR' | 'MAP'>('GRID');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Scouting State
  const [scoutQuery, setScoutQuery] = useState('High-traffic areas for street ministry');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutResults, setScoutResults] = useState<{ text: string, places: any[] } | null>(null);

  const [newEvent, setNewEvent] = useState<Partial<ChurchEvent>>({
    recurrence: 'NONE',
    coordinates: { lat: -1.286389, lng: 36.817223 } 
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const groups = useMemo(() => Array.from(new Set(members.map(m => m.group))), [members]);

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
    // ... marker logic simplified for space
  }, [viewMode, events]);

  const handleScoutOutreach = async () => {
    setIsScouting(true);
    try {
      const res = await scoutOutreachLocations(scoutQuery, -1.286389, 36.817223);
      setScoutResults(res as any);
    } catch (e) {
      alert('AI Scouter error. Ensure geolocation is allowed.');
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Events Management</h2>
          <p className="text-slate-500 mt-2 text-lg">Schedule services and track spiritual engagement.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowScoutModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-sm">
             <Sparkles size={20}/> AI Outreach Scouter
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
             <Plus size={20} /> Schedule Event
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm self-start">
        <button onClick={() => setViewMode('GRID')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'GRID' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}><LayoutGrid size={16}/> Cards</button>
        <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'CALENDAR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}><Calendar size={16}/> Calendar</button>
        <button onClick={() => setViewMode('MAP')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}><Map size={16}/> Outreach Map</button>
      </div>

      {viewMode === 'MAP' ? (
        <div className="h-[600px] relative">
           <div ref={mapContainerRef} className="h-full border border-slate-200 shadow-xl overflow-hidden rounded-[2.5rem]" />
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="p-8 flex-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><Clock size={18} className="text-indigo-500" /> {event.date} • {event.time}</div>
                  <div className="flex items-center gap-4 text-slate-600 text-sm font-bold bg-slate-50/50 p-3 rounded-2xl"><MapPin size={18} className="text-indigo-500" /> {event.location}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-700 font-black text-sm"><Users size={18} className="text-indigo-600" /> {event.attendance.length} Attending</div>
                <button onClick={() => setShowAttendanceModal(event.id)} className="px-4 py-2 bg-white text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Roll Call</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* AI Scouter Modal */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><MapIcon size={24}/></div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">AI Outreach Scouter</h3>
               </div>
               <button onClick={() => setShowScoutModal(false)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2">What kind of space are you looking for?</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                   value={scoutQuery}
                   onChange={e => setScoutQuery(e.target.value)}
                 />
                 <button 
                   onClick={handleScoutOutreach} 
                   disabled={isScouting}
                   className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                 >
                    {isScouting ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                 </button>
               </div>
            </div>

            {scoutResults && (
               <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 animate-in fade-in duration-500">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{scoutResults.text}</p>
                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase text-slate-400">Live Map Data Sources:</p>
                     {scoutResults.places?.map((chunk: any, i: number) => (
                        chunk.maps && (
                           <a key={i} href={chunk.maps.uri} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                              <span className="text-sm font-bold text-slate-800">{chunk.maps.title || 'Google Maps Location'}</span>
                              <MapIcon className="text-indigo-600" size={16}/>
                           </a>
                        )
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
