
import React, { useState, useMemo } from 'react';
import { 
  Users, MapPin, TrendingUp, PieChart as PieIcon, 
  Activity, Map as MapIcon,
  ExternalLink, ArrowUpRight,
  Target, UserPlus, Heart,
  Calendar, Layers, Sparkles, Home, Loader2,
  Search, GraduationCap, Building2, Stethoscope, Cross,
  ShieldAlert, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Member, ChurchEvent } from '../types';
import { scoutOutreachLocations } from '../services/geminiService';

type AnalyticsTab = 'DEMOGRAPHICS' | 'GROWTH' | 'ENGAGEMENT' | 'RESOURCES';

interface DemographicsAnalysisProps {
  members: Member[];
  events: ChurchEvent[];
}

const DemographicsAnalysis: React.FC<DemographicsAnalysisProps> = ({ members, events }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('DEMOGRAPHICS');
  // Resource Finder State
  const [resourceType, setResourceType] = useState('Schools');
  const [isFindingResources, setIsFindingResources] = useState(false);
  const [resourceResults, setResourceResults] = useState<{text: string, groundingChunks: any[]} | null>(null);

  const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#FFB800', '#8B5CF6', '#F43F5E'];

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      const location = m.location?.trim();
      if (location) counts[location] = (counts[location] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [members]);

  const ageGroupData = useMemo(() => {
    const groups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
    members.forEach(m => {
      if (!m.age) return;
      if (m.age <= 18) groups['0-18']++;
      else if (m.age <= 35) groups['19-35']++;
      else if (m.age <= 50) groups['36-50']++;
      else groups['51+']++;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [members]);

  const genderData = useMemo(() => {
    const counts: Record<string, number> = { 'Male': 0, 'Female': 0, 'Other': 0 };
    members.forEach(m => { if (m.gender) counts[m.gender]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [members]);

  const growthData = useMemo(() => {
    const year = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthEnd = new Date(year, index + 1, 0, 23, 59, 59, 999);
      const total = members.filter(member => {
        const joined = new Date(member.joinDate);
        return !Number.isNaN(joined.getTime()) && joined <= monthEnd;
      }).length;
      return { month, members: total };
    });
  }, [members]);

  const engagementData = useMemo(() => events
    .filter(event => !!event.date)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
    .reverse()
    .map(event => ({
      name: event.title,
      attendance: Array.isArray(event.attendance) ? event.attendance.length : 0,
    })), [events]);

  const handleFindResources = async () => {
    setIsFindingResources(true);
    setResourceResults(null);
    try {
      const topLoc = locationData[0]?.name;
      if (!topLoc) {
        alert('Add location details to member records before searching for nearby community resources.');
        return;
      }
      const res = await scoutOutreachLocations(`${resourceType} near ${topLoc} for community service and benevolence ministry`);
      setResourceResults(res);
    } catch (e) {
      alert('Failed to find locations.');
    } finally {
      setIsFindingResources(false);
    }
  };



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm font-black" style={{ color: entry.color }}>
                {entry.name}: <span className="text-slate-800">{entry.value.toLocaleString()}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-indigo-50 text-brand-indigo rounded-xl">
               <TrendingUp size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Analytics</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Explore member demographics, recorded growth, and event attendance.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar glass-card self-start">
          {[
            { id: 'DEMOGRAPHICS', label: 'Congregation', icon: Users },
            { id: 'RESOURCES', label: 'Resources', icon: MapIcon },
            { id: 'GROWTH', label: 'Growth', icon: ArrowUpRight },
            { id: 'ENGAGEMENT', label: 'Engagement', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-6 py-3 rounded-lg text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20' 
                  : 'text-slate-400 hover:text-brand-primary'
              }`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'RESOURCES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 animate-in zoom-in duration-300">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-lg"><Target size={24}/></div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Location Finder</h3>
                 </div>
                 
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
                   Find nearby community facilities using the most common location in member records.
                 </p>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Asset Category</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'Schools', icon: GraduationCap },
                         { id: 'Hospitals', icon: Stethoscope },
                         { id: 'Social Halls', icon: Building2 },
                         { id: 'Police Stations', icon: ShieldAlert }
                       ].map(type => (
                         <button 
                           key={type.id} 
                           onClick={() => setResourceType(type.id)}
                           className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${resourceType === type.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-100'}`}
                         >
                            <type.icon size={20} className="mb-2"/>
                            <span className="text-[9px] font-black uppercase">{type.id}</span>
                         </button>
                       ))}
                    </div>
                    <button 
                      onClick={handleFindResources}
                      disabled={isFindingResources}
                      className="w-full py-4 bg-brand-primary text-white rounded-lg font-black shadow-sm hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isFindingResources ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                       {isFindingResources ? 'Processing...' : 'Search'}
                    </button>
                 </div>
              </div>

              <div className="bg-brand-primary p-5 sm:p-6 rounded-xl text-white shadow-sm relative overflow-hidden">
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-brand-gold">
                      <Cross size={16}/>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community</span>
                    </div>
                    <h4 className="text-lg font-black uppercase leading-tight">Community Resources</h4>
                    <p className="text-xs text-indigo-100 opacity-70 leading-relaxed font-medium">Identifying partner institutions near member concentrations to streamline church-led community outreach.</p>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </div>
           </div>

           <div className="lg:col-span-8">
              {resourceResults ? (
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-10 min-h-[600px]">
                   <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                      <div>
                         <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Results</h4>
                         <p className="text-[10px] font-black uppercase text-brand-indigo tracking-widest mt-1">Results from Google Maps</p>
                      </div>
                      <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl"><CheckCircle2 size={24}/></div>
                   </div>

                   <p className="text-lg text-slate-700 font-medium italic border-l-4 border-brand-gold pl-8 py-2">"{resourceResults.text}"</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resourceResults.groundingChunks.map((chunk, i) => (
                        <div key={i} className="group bg-slate-50 border border-slate-100 p-5 sm:p-6 rounded-xl hover:bg-white hover:shadow-sm transition-all space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="p-4 bg-white text-brand-primary rounded-lg shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                                 <Building2 size={24}/>
                              </div>
                              <span className="text-[9px] font-black uppercase text-slate-300">Result #{i+1}</span>
                           </div>
                           <div>
                              <h5 className="text-xl font-black text-slate-800 line-clamp-1">{chunk.maps?.title || "Local Hub"}</h5>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Suggested community resource</p>
                           </div>
                           <a 
                             href={chunk.maps?.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full py-4 bg-brand-indigo text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm shadow-indigo-100 hover:bg-brand-primary transition-all flex items-center justify-center gap-2"
                           >
                              <ExternalLink size={14}/> View Detailed Map
                           </a>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                      <Sparkles size={48} className="text-slate-200"/>
                   </div>
                   <h4 className="text-xl font-black text-slate-400 uppercase">No Results Yet</h4>
                   <p className="max-w-xs text-sm font-medium text-slate-300 mt-2 leading-relaxed">Choose a resource category and search to see suggestions.</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(() => {
            const active = members.filter(member => member.status === 'ACTIVE').length;
            const now = new Date();
            const newThisMonth = members.filter(member => {
              const joined = new Date(member.joinDate);
              return !Number.isNaN(joined.getTime()) &&
                joined.getMonth() === now.getMonth() &&
                joined.getFullYear() === now.getFullYear();
            }).length;
            const groups = new Set<string>();
            members.forEach(member => member.groups.forEach(group => groups.add(group)));
            const withLocation = members.filter(member => !!member.location?.trim()).length;
            return [
              { label: 'Active members', value: active.toLocaleString(), detail: `of ${members.length} registered`, icon: Heart },
              { label: 'Joined this month', value: newThisMonth.toLocaleString(), detail: 'Based on join dates', icon: UserPlus },
              { label: 'Groups represented', value: groups.size.toLocaleString(), detail: 'Distinct member groups', icon: Layers },
              { label: 'Members with location', value: withLocation.toLocaleString(), detail: 'Location recorded', icon: MapPin }
            ];
          })().map(stat => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
                  <stat.icon size={19} aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area (Hidden if in Resources tab for cleaner UI) */}
      {activeTab !== 'RESOURCES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'DEMOGRAPHICS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                 <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieIcon size={20} className="text-brand-indigo-600"/> Age Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageGroupData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                          <Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={32}>
                            {ageGroupData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Sparkles size={20} className="text-brand-gold-600"/> Gender Balance</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                            {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>


              </div>
            )}

            {activeTab === 'GROWTH' && (
              <div className="bg-white p-5 sm:p-6 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">Membership Growth</h4>
                      <p className="text-slate-500 font-medium">Cumulative registered members by month, based on join dates.</p>
                    </div>
                    <span className="text-xs text-slate-500">Members</span>
                 </div>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="members" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorMembers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}


            {activeTab === 'ENGAGEMENT' && (
              <div className="bg-white p-5 sm:p-6 sm:p-6 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">Attendance by Service</h4>
                      <p className="text-slate-500 font-medium">Recorded attendance for the most recent events. Unrecorded attendance is shown as zero.</p>
                    </div>
                 </div>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData} barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="attendance" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-8">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                   <MapPin size={20} className="text-brand-indigo"/> Regional Presence
                </h4>
                <div className="space-y-4">
                   {locationData.length === 0 ? (
                     <p className="text-sm text-slate-500">No member location data has been recorded yet.</p>
                   ) : locationData.slice(0, 5).map((loc, i) => (
                     <div key={loc.name} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-all cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                           #{i+1}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-end mb-2">
                              <span className="text-sm font-bold text-slate-700">{loc.name}</span>
                              <span className="text-[10px] font-black text-brand-indigo">{Math.round((loc.value / members.length) * 100)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-brand-indigo rounded-full" 
                                 style={{ width: `${(loc.value / locationData[0].value) * 100}%` }}
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                   <Activity size={20} className="text-brand-emerald"/> Key Metrics
                </h4>
                <div className="space-y-6">
                   {[
                     { label: 'Members in groups', value: members.filter(member => member.groups?.length > 0).length, icon: Users },
                     { label: 'Upcoming events', value: events.filter(event => new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length, icon: Calendar },
                     { label: 'Members with contact details', value: members.filter(member => !!member.phone || !!member.email).length, icon: Home }
                   ].map((p, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-50 text-slate-400 rounded-lg"><p.icon size={14}/></div>
                           <span className="text-xs font-bold text-slate-600">{p.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">{p.value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DemographicsAnalysis;
