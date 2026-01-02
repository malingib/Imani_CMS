
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, MapPin, TrendingUp, PieChart as PieIcon, 
  Activity, Wallet, Map as MapIcon, Maximize2,
  ExternalLink, X, Info, ArrowUpRight,
  TrendingDown, Target, UserPlus, Heart,
  Calendar, Layers, Sparkles, Home, Loader2,
  Search, GraduationCap, Building2, Stethoscope, Cross,
  // Added ShieldAlert and CheckCircle2 to fix missing name errors
  ShieldAlert, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts';
import { Member } from '../types';
import { scoutOutreachLocations } from '../services/geminiService';

type AnalyticsTab = 'DEMOGRAPHICS' | 'GROWTH' | 'GIVING' | 'ENGAGEMENT' | 'RESOURCES';

interface DemographicsAnalysisProps {
  members: Member[];
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  'Nairobi West': [-1.3048, 36.8206],
  'Kileleshwa': [-1.2828, 36.7865],
  'Thika Road': [-1.2212, 36.8837],
  'Nairobi Central': [-1.286389, 36.817223],
  'Westlands': [-1.2633, 36.8028],
  'Langata': [-1.3333, 36.7667],
  'Donholm': [-1.3000, 36.8833],
  'Kasaran': [-1.2167, 36.9000],
  'Kiambu': [-1.1667, 36.8333],
  'Default': [-1.286389, 36.817223]
};

const DemographicsAnalysis: React.FC<DemographicsAnalysisProps> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('DEMOGRAPHICS');
  const [showMapModal, setShowMapModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Resource Finder State
  const [resourceType, setResourceType] = useState('Schools');
  const [isFindingResources, setIsFindingResources] = useState(false);
  const [resourceResults, setResourceResults] = useState<{text: string, groundingChunks: any[]} | null>(null);

  const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#FFB800', '#8B5CF6', '#F43F5E'];

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => counts[m.location] = (counts[m.location] || 0) + 1);
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

  const growthData = useMemo(() => [
    { month: 'Jan', members: 850, outreach: 120 },
    { month: 'Feb', members: 890, outreach: 150 },
    { month: 'Mar', members: 920, outreach: 180 },
    { month: 'Apr', members: 980, outreach: 220 },
    { month: 'May', members: 1050, outreach: 280 },
    { month: 'Jun', members: 1120, outreach: 310 },
    { month: 'Jul', members: 1250, outreach: 400 },
  ], []);

  // Defined givingTrendData to fix missing name error
  const givingTrendData = useMemo(() => [
    { month: 'Jan', income: 450000, expenses: 320000 },
    { month: 'Feb', income: 520000, expenses: 340000 },
    { month: 'Mar', income: 480000, expenses: 410000 },
    { month: 'Apr', income: 610000, expenses: 380000 },
    { month: 'May', income: 590000, expenses: 420000 },
    { month: 'Jun', income: 720000, expenses: 450000 },
  ], []);

  // Defined engagementData to fix missing name error
  const engagementData = useMemo(() => [
    { name: 'Sunday Service', attendance: 1150, capacity: 1200 },
    { name: 'Youth Night', attendance: 310, capacity: 500 },
    { name: 'Mid-week Prayer', attendance: 180, capacity: 400 },
    { name: 'Bible Study', attendance: 150, capacity: 300 },
  ], []);

  const handleFindResources = async () => {
    setIsFindingResources(true);
    setResourceResults(null);
    try {
      const topLoc = locationData[0]?.name || "Nairobi Central";
      const res = await scoutOutreachLocations(`${resourceType} near ${topLoc} for community service and benevolence ministry`);
      setResourceResults(res);
    } catch (e) {
      alert("AI Intelligence error.");
    } finally {
      setIsFindingResources(false);
    }
  };

  useEffect(() => {
    if (showMapModal && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) return;
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
      const map = L.map(mapContainerRef.current).setView([-1.286389, 36.817223], 12);
      L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);
      
      locationData.forEach((loc) => {
        const coords = LOCATION_COORDS[loc.name] || LOCATION_COORDS['Default'];
        const marker = L.circle(coords, {
          color: '#1E293B',
          fillColor: '#4F46E5',
          fillOpacity: 0.5,
          radius: Math.sqrt(loc.value) * 500
        }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 10px;">
            <h3 style="margin: 0; font-weight: 800; color: #1E293B;">${loc.name}</h3>
            <p style="margin: 5px 0 0; font-weight: 600; color: #4F46E5;">${loc.value} Members</p>
          </div>
        `);
      });
      mapInstanceRef.current = map;
    }
    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [showMapModal, locationData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
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
            <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Ministry Analytics</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Quantifying spiritual growth and operational effectiveness across all departments.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[1.8rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar glass-card self-start">
          {[
            { id: 'DEMOGRAPHICS', label: 'Congregation', icon: Users },
            { id: 'RESOURCES', label: 'Kingdom Resources', icon: MapIcon },
            { id: 'GROWTH', label: 'Growth', icon: ArrowUpRight },
            { id: 'ENGAGEMENT', label: 'Engagement', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                  : 'text-slate-400 hover:text-brand-primary'
              }`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'RESOURCES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in duration-300">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl"><Target size={24}/></div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Geo-Ministry Hub</h3>
                 </div>
                 
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
                   Use AI Grounding to find strategic community assets near your member clusters.
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
                           className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all ${resourceType === type.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-100'}`}
                         >
                            <type.icon size={20} className="mb-2"/>
                            <span className="text-[9px] font-black uppercase">{type.id}</span>
                         </button>
                       ))}
                    </div>
                    <button 
                      onClick={handleFindResources}
                      disabled={isFindingResources}
                      className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isFindingResources ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                       {isFindingResources ? 'Processing...' : 'Identify Hubs'}
                    </button>
                 </div>
              </div>

              <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-brand-gold">
                      <Cross size={16}/>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Mode</span>
                    </div>
                    <h4 className="text-lg font-black uppercase leading-tight">Benevolence Mapping</h4>
                    <p className="text-xs text-indigo-100 opacity-70 leading-relaxed font-medium">Identifying partner institutions near member concentrations to streamline church-led community outreach.</p>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </div>
           </div>

           <div className="lg:col-span-8">
              {resourceResults ? (
                <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 min-h-[600px]">
                   <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                      <div>
                         <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Intelligence Report</h4>
                         <p className="text-[10px] font-black uppercase text-brand-indigo tracking-widest mt-1">Grounding verified via Google Maps Tool</p>
                      </div>
                      <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl"><CheckCircle2 size={24}/></div>
                   </div>

                   <p className="text-lg text-slate-700 font-medium italic border-l-4 border-brand-gold pl-8 py-2">"{resourceResults.text}"</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resourceResults.groundingChunks.map((chunk, i) => (
                        <div key={i} className="group bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="p-4 bg-white text-brand-primary rounded-2xl shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                                 <Building2 size={24}/>
                              </div>
                              <span className="text-[9px] font-black uppercase text-slate-300">Identity ID #{i+1}</span>
                           </div>
                           <div>
                              <h5 className="text-xl font-black text-slate-800 line-clamp-1">{chunk.maps?.title || "Local Hub"}</h5>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Community Resource</p>
                           </div>
                           <a 
                             href={chunk.maps?.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-brand-primary transition-all flex items-center justify-center gap-2"
                           >
                              <ExternalLink size={14}/> View Detailed Map
                           </a>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3.5rem] h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                      <Sparkles size={48} className="text-slate-200"/>
                   </div>
                   <h4 className="text-xl font-black text-slate-400 uppercase">Awaiting Intelligence Probe</h4>
                   <p className="max-w-xs text-sm font-medium text-slate-300 mt-2 leading-relaxed">Select a category and trigger identifying hubs to map out local partnership opportunities.</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Retention Rate', value: '94%', icon: Heart, trend: '+2.1%', color: 'indigo' },
            { label: 'New Converts', value: '86', icon: UserPlus, trend: '+12%', color: 'emerald' },
            { label: 'Active Groups', value: '24', icon: Layers, trend: 'Stable', color: 'primary' },
            { label: 'Outreach Reach', value: '4.2k', icon: Target, trend: '+15%', color: 'gold' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-brand-${stat.color}-50 text-brand-${stat.color}-500`}>
                  <stat.icon size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-[8px] text-slate-300 font-bold uppercase">vs last month</span>
                </div>
              </div>
              <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area (Hidden if in Resources tab for cleaner UI) */}
      {activeTab !== 'RESOURCES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'DEMOGRAPHICS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
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

                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
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

                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-xl font-black text-slate-800 flex items-center gap-3"><MapIcon size={20} className="text-brand-primary-600"/> Geographic Heatmap</h4>
                      <button onClick={() => setShowMapModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">
                        <Maximize2 size={14}/> View Full Map
                      </button>
                    </div>
                    <div className="h-72 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10">
                          <div className="grid grid-cols-12 h-full gap-4 p-4">
                             {Array.from({length: 48}).map((_, i) => <div key={i} className="bg-brand-primary/20 rounded-lg"></div>)}
                          </div>
                       </div>
                       <div className="relative z-10 text-center space-y-3">
                          <MapIcon size={48} className="mx-auto text-slate-300" />
                          <p className="text-slate-400 text-sm font-bold">Interactive map available in full-screen view.</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'GROWTH' && (
              <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">Congregation Trajectory</h4>
                      <p className="text-slate-500 font-medium">Monthly acquisition vs outreach engagement.</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-indigo"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Members</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-gold"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outreach Leads</span></div>
                    </div>
                 </div>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOutreach" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFB800" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="members" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorMembers)" />
                        <Area type="monotone" dataKey="outreach" stroke="#FFB800" strokeWidth={4} fillOpacity={1} fill="url(#colorOutreach)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}

            {activeTab === 'GIVING' && (
              <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">Stewardship Flow</h4>
                      <p className="text-slate-500 font-medium">Operational income vs ministry expenses.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-brand-indigo-50 text-brand-indigo text-[10px] font-black uppercase rounded-lg">Surplus Focus</span>
                    </div>
                 </div>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={givingTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="income" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40} />
                        <Line type="step" dataKey="expenses" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 0}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}

            {activeTab === 'ENGAGEMENT' && (
              <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">Ministry Engagement</h4>
                      <p className="text-slate-500 font-medium">Actual attendance vs facility capacity.</p>
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
                        <Bar dataKey="capacity" fill="#E2E8F0" radius={[10, 10, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Target size={24}/></div>
                      <h4 className="text-xl font-black uppercase tracking-tight">Strategic Insight</h4>
                   </div>
                   <p className="text-slate-300 font-medium leading-relaxed">
                     Current growth trends show a <span className="text-brand-gold font-black">12% uptick</span> in the 19-35 demographic. It is recommended to increase resource allocation for the <span className="text-white font-black underline decoration-brand-gold">NextGen Ministry</span> by 15% next quarter.
                   </p>
                   <div className="pt-6 border-t border-white/10">
                      <button className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-primary transition-all flex items-center justify-center gap-2">
                         Review Full Plan <ArrowUpRight size={16}/>
                      </button>
                   </div>
                </div>
                <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                   <MapPin size={20} className="text-brand-indigo"/> Regional Presence
                </h4>
                <div className="space-y-4">
                   {locationData.slice(0, 5).map((loc, i) => (
                     <div key={loc.name} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-default">
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
                <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                   View All 12 Regions
                </button>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                   <Activity size={20} className="text-brand-emerald"/> Ministry Pulse
                </h4>
                <div className="space-y-6">
                   {[
                     { label: 'Baptismal Candidates', value: 12, icon: Calendar },
                     { label: 'Small Group Hosts', value: 48, icon: Home },
                     { label: 'Active Volunteers', value: 310, icon: Users }
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

      {/* Full Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-brand-primary/60 backdrop-blur-xl z-[500] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] w-full h-full shadow-2xl flex flex-col relative overflow-hidden border border-white/20">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-brand-indigo-50 text-brand-indigo rounded-2xl shadow-sm">
                      <MapIcon size={32}/>
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-brand-primary tracking-tight uppercase">Kingdom Geo-Spread</h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Global ministry footprint visualization</p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowMapModal(false)} 
                  className="p-4 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-3xl transition-all shadow-sm"
                >
                  <X size={28}/>
                </button>
             </div>
             
             <div className="flex-1 relative">
                <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full" />
                
                <div className="absolute bottom-10 left-10 z-20 bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/40 max-w-xs space-y-6">
                   <h5 className="text-xs font-black uppercase text-brand-primary tracking-widest">Legend & Toggles</h5>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded-full bg-brand-indigo opacity-50 border-2 border-brand-indigo shadow-sm"></div>
                         <span className="text-[10px] font-black text-slate-600 uppercase">Congregation Hub</span>
                      </div>
                      <div className="p-4 bg-brand-primary/5 rounded-2xl space-y-2">
                         <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                            <span>Density Range</span>
                            <span>Scale 1:12</span>
                         </div>
                         <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-brand-indigo rounded-full"></div>
                      </div>
                   </div>
                   <button className="w-full py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                      <ExternalLink size={12}/> Focus: CBD Central
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicsAnalysis;
