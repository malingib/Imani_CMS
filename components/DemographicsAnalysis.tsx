
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, MapPin, TrendingUp, PieChart as PieIcon, 
  Activity, Wallet, Map as MapIcon, Maximize2,
  ExternalLink, X, Info, ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts';
import { Member } from '../types';

interface DemographicsAnalysisProps {
  members: Member[];
}

type AnalyticsTab = 'DEMOGRAPHICS' | 'GROWTH' | 'GIVING' | 'ENGAGEMENT';

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

  const COLORS = ['#4F46E5', '#0EA5E9', '#10b981', '#FFB800', '#8b5cf6'];

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

  useEffect(() => {
    if (showMapModal && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) return;
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
      const map = L.map(mapContainerRef.current).setView([-1.286389, 36.817223], 12);
      L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      locationData.forEach((loc) => {
        const coords = LOCATION_COORDS[loc.name] || LOCATION_COORDS['Default'];
        L.circle(coords, { color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.4, radius: Math.sqrt(loc.value) * 300 }).addTo(map).bindPopup(`<b>${loc.name}</b><br>${loc.value} Members`);
      });
      mapInstanceRef.current = map;
    }
    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [showMapModal, locationData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Ministry Analytics</h2>
          <p className="text-slate-500 mt-2 text-lg">In-depth data visualization for spiritual and operational growth.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          {[
            { id: 'DEMOGRAPHICS', label: 'Demographics', icon: Users },
            { id: 'GROWTH', label: 'Growth', icon: TrendingUp },
            { id: 'GIVING', label: 'Giving', icon: Wallet },
            { id: 'ENGAGEMENT', label: 'Engagement', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'DEMOGRAPHICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-w-0">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieIcon size={20} className="text-brand-primary"/> Age Pyramid</h4>
              <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageGroupData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={60} /><Tooltip /><Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={30} /></BarChart></ResponsiveContainer></div>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3"><MapIcon size={20} className="text-brand-secondary"/> Geo-Distribution</h4>
                <div className="space-y-3 mb-6">
                  {locationData.slice(0, 3).map(loc => (
                    <div key={loc.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">{loc.name}</span>
                      <span className="text-xs font-black text-brand-primary">{loc.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowMapModal(true)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Maximize2 size={16}/> Explore Distribution Map
              </button>
           </div>
           <div className="bg-brand-solid p-8 rounded-[2.5rem] text-white shadow-xl">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Giver Stats</p>
              <div className="space-y-6">
                 <div>
                    <p className="text-3xl font-black">72%</p>
                    <p className="text-xs text-indigo-100 font-medium">Of tithes from the 19-35 age group.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Distribution Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full h-full shadow-2xl flex flex-col relative overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <MapIcon className="text-brand-primary" size={28}/> Distribution Mapping
                   </h3>
                </div>
                <button onClick={() => setShowMapModal(false)} className="p-4 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all">
                  <X size={24}/>
                </button>
             </div>
             <div className="flex-1 relative"><div ref={mapContainerRef} className="absolute inset-0 z-0 h-full" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicsAnalysis;
