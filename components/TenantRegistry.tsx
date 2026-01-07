
import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Filter, Plus, Network, 
  ExternalLink, ShieldX, CheckCircle2, AlertTriangle, 
  Clock, MoreVertical, X, PackageCheck, Globe,
  Terminal, ShieldAlert, Zap, Loader2, Save,
  ArrowUpRight, Download, BarChart3, Database
} from 'lucide-react';
import { Tenant } from '../types';

const TenantRegistry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const initialTenants: Tenant[] = [
    { id: 'T1', name: 'Nairobi Central Parish', subdomain: 'nairobi-central', plan: 'Enterprise', status: 'Active', ownerEmail: 'pastor@imani.org', region: 'Nairobi East', memberCount: 4200, mrr: 8500, renewalDate: 'Nov 12, 2024', healthScore: 98 },
    { id: 'T2', name: 'Mombasa Gateway Church', subdomain: 'mombasa-gateway', plan: 'Pro', status: 'Active', ownerEmail: 'mombasa@imani.org', region: 'Coast', memberCount: 2150, mrr: 4500, renewalDate: 'Dec 01, 2024', healthScore: 92 },
    { id: 'T3', name: 'Kisumu Outreach Center', subdomain: 'kisumu-outreach', plan: 'Basic', status: 'Trialing', ownerEmail: 'kisumu@imani.org', region: 'Western', memberCount: 890, mrr: 0, renewalDate: 'Oct 28, 2024', healthScore: 85 },
    { id: 'T4', name: 'Nakuru Valley Parish', subdomain: 'nakuru-valley', plan: 'Enterprise', status: 'Past Due', ownerEmail: 'nakuru@imani.org', region: 'Rift Valley', memberCount: 1100, mrr: 8500, renewalDate: 'Oct 15, 2024', healthScore: 40 },
    { id: 'T5', name: 'Eldoret Grace Chapel', subdomain: 'eldoret-grace', plan: 'Pro', status: 'Active', ownerEmail: 'eldoret@imani.org', region: 'Rift Valley', memberCount: 640, mrr: 4500, renewalDate: 'Jan 20, 2025', healthScore: 95 },
  ];

  const filteredTenants = useMemo(() => {
    return initialTenants.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.subdomain.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesTier = tierFilter === 'All' || t.plan === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [searchTerm, statusFilter, tierFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand-primary text-brand-gold rounded-2xl shadow-xl">
               <Network size={28} />
            </div>
            <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Tenant Registry</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Manage global church instances, sub-domains, and platform licenses.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export Master CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-brand-primary/20"
          >
            <Plus size={20} /> Provision Parish
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="relative flex-1 w-full xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by parish name or sub-domain..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full xl:w-auto">
            <select 
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Trialing">Trialing</option>
              <option value="Past Due">Past Due</option>
            </select>
            <select 
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Parish Identity</th>
                <th className="px-10 py-6">Sub-Domain</th>
                <th className="px-10 py-6">Tier</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Uptime Index</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl shadow-sm">
                          <Building2 size={20}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-base">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.region} • {t.memberCount.toLocaleString()} Souls</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <code className="px-3 py-1 bg-slate-100 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                       {t.subdomain}.imani.cms
                    </code>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      t.plan === 'Enterprise' ? 'bg-brand-gold text-brand-primary' : 'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'
                    }`}>
                       {t.plan}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          t.status === 'Active' ? 'bg-brand-emerald animate-pulse' : 
                          t.status === 'Trialing' ? 'bg-brand-indigo' : 'bg-rose-500'
                        }`}/>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          t.status === 'Active' ? 'text-brand-emerald' : 
                          t.status === 'Trialing' ? 'text-brand-indigo' : 'text-rose-500'
                        }`}>{t.status}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="inline-flex flex-col items-end">
                       <p className={`text-lg font-black ${t.healthScore > 90 ? 'text-brand-emerald' : t.healthScore > 70 ? 'text-brand-gold' : 'text-rose-500'}`}>{t.healthScore}%</p>
                       <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className={`h-full rounded-full ${t.healthScore > 90 ? 'bg-brand-emerald' : 'bg-brand-gold'}`} style={{ width: `${t.healthScore}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm" title="Proxy as Admin">
                          <ExternalLink size={16}/>
                       </button>
                       <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Suspend License">
                          <ShieldX size={16}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Health Score', value: '88%', icon: Zap, color: 'emerald' },
          { label: 'Enterprise Adoptions', value: '42', icon: Building2, color: 'gold' },
          { label: 'Western Hubs', value: '12', icon: Globe, color: 'indigo' },
          { label: 'Database Shards', value: '8', icon: Database, color: 'primary' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
             <div className={`p-3 bg-brand-${s.color}-50 text-brand-${s.color} rounded-xl`}>
                <s.icon size={20}/>
             </div>
             <div>
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Add Parish Modal (Re-using from Dashboard for consistency) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 lg:p-14 space-y-10">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                          <Plus size={32}/>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Provision Parish</h3>
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Tenant Sub-Domain Deployment</p>
                       </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Parish Identity</label>
                       <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-inner" placeholder="e.g. Nairobi Central" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sub-Domain</label>
                       <div className="relative">
                          <input className="w-full p-4 pr-32 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-inner" placeholder="nairobi-central" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">.imani.cms</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Service Region</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none">
                          <option>Nairobi East (Edge-1)</option>
                          <option>Mombasa North (Edge-2)</option>
                          <option>Kisumu West (Edge-3)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">License Tier</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none">
                          <option>Basic (Free Trial)</option>
                          <option>Standard (Monthly)</option>
                          <option>Enterprise (SLA)</option>
                       </select>
                    </div>
                 </div>

                 <div className="p-6 bg-brand-emerald/5 rounded-[2rem] border border-dashed border-brand-emerald/20 flex items-start gap-4">
                    <CheckCircle2 className="text-brand-emerald shrink-0 mt-1" size={20}/>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Provisional instance will be live within 300 seconds. An admin invite will be dispatched to the provided contact email.</p>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Cancel</button>
                    <button 
                       onClick={() => { alert('Deploying instance...'); setShowAddModal(false); }}
                       className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3"
                    >
                       <PackageCheck size={20}/> Push Live
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TenantRegistry;
