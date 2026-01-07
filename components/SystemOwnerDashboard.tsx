
import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, CreditCard, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, ShieldCheck, 
  Globe, Server, BarChart3, Search, Filter, 
  MoreVertical, CheckCircle2, AlertTriangle, Clock,
  Smartphone, Database, MessageSquare, TrendingUp,
  HardDrive, Network, ShieldAlert, Cpu, 
  PackageCheck, RefreshCcw, ExternalLink, Plus,
  X, Loader2, Save, Terminal, ShieldX
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const SystemOwnerDashboard: React.FC = () => {
  const [showAddParish, setShowAddParish] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [showDeployStatus, setShowDeployStatus] = useState(false);
  
  const platformStats = [
    { label: 'Total Platform MRR', value: 'KES 842,500', icon: CreditCard, color: 'emerald', trend: '+18.4%' },
    { label: 'Active Tenant Parishes', value: '124', icon: Network, color: 'indigo', trend: '+12' },
    { label: 'Global Ecosystem Souls', value: '418,240', icon: Users, color: 'gold', trend: '+2,4k' },
    { label: 'Global API Uptime', value: '99.99%', icon: Activity, color: 'primary', trend: 'Optimal' }
  ];

  const growthData = [
    { month: 'Jan', revenue: 420000, tenants: 80 },
    { month: 'Feb', revenue: 485000, tenants: 88 },
    { month: 'Mar', revenue: 530000, tenants: 94 },
    { month: 'Apr', revenue: 655000, tenants: 102 },
    { month: 'May', revenue: 772000, tenants: 114 },
    { month: 'Jun', revenue: 842500, tenants: 124 },
  ];

  const tenants = [
    { id: 'T1', name: 'Nairobi Central Parish', region: 'Nairobi', plan: 'Enterprise', status: 'Active', renewal: 'Nov 12, 2024', health: 98 },
    { id: 'T2', name: 'Mombasa Gateway Church', region: 'Coast', plan: 'Pro', status: 'Active', renewal: 'Dec 01, 2024', health: 92 },
    { id: 'T3', name: 'Kisumu Outreach Center', region: 'Western', plan: 'Basic', status: 'Trialing', renewal: 'Oct 28, 2024', health: 85 },
    { id: 'T4', name: 'Nakuru Valley Parish', region: 'Rift Valley', plan: 'Enterprise', status: 'Past Due', renewal: 'Oct 15, 2024', health: 40 },
    { id: 'T5', name: 'Eldoret Grace Chapel', region: 'Rift Valley', plan: 'Pro', status: 'Active', renewal: 'Jan 20, 2025', health: 95 },
  ];

  const platformEvents = [
    { id: 1, type: 'BILLING', msg: 'Renewal: Nairobi West Parish (KES 4,500)', time: '2 mins ago', status: 'success' },
    { id: 2, type: 'INFRA', msg: 'Cluster Scale-up: Node-KE-East-01 verified', time: '15 mins ago', status: 'info' },
    { id: 3, type: 'SECURITY', msg: 'Brute-force blocked: IP 192.168.1.1 (Kisumu Region)', time: '42 mins ago', status: 'warning' },
    { id: 4, type: 'TENANT', msg: 'New Registration: Machakos Community Church', time: '1h ago', status: 'success' },
  ];

  const handleDeployUpdate = async () => {
    setIsDeploying(true);
    setShowDeployStatus(true);
    const steps = [
      'Packaging V2.4.1 assets...',
      'Verifying node health (Nairobi-East, Mombasa-North)...',
      'Pushing code to edge clusters...',
      'Synchronizing tenant databases...',
      'Deployment Successful (Global)'
    ];
    for (const step of steps) {
      setDeployStep(step);
      await new Promise(r => setTimeout(r, 1000));
    }
    setTimeout(() => {
      setShowDeployStatus(false);
      setIsDeploying(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Platform Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-brand-primary text-brand-gold rounded-[1.8rem] shadow-2xl border border-white/10 ring-4 ring-indigo-50">
              <Globe size={32} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-brand-primary tracking-tighter uppercase leading-none">Mobiwave Platform HQ</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                 <Terminal size={14} className="text-brand-indigo"/> Instance Management Console
              </p>
           </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDeployUpdate}
            disabled={isDeploying}
            className="flex items-center gap-2 px-8 py-4 bg-white text-brand-primary border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isDeploying ? <Loader2 size={16} className="animate-spin"/> : <RefreshCcw size={16} />} 
            Deploy Global Patch
          </button>
          <button 
            onClick={() => setShowAddParish(true)}
            className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-brand-primary/20"
          >
            <Plus size={20} /> Provision New Parish
          </button>
        </div>
      </div>

      {/* Global Deployment Overlay */}
      {showDeployStatus && (
        <div className="bg-slate-900 text-emerald-400 p-6 rounded-[2rem] font-mono text-xs border border-emerald-900/30 animate-in slide-in-from-top-4">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{deployStep}</span>
           </div>
        </div>
      )}

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 bg-brand-${stat.color}-50 text-brand-${stat.color}-500 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon size={24} />
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-brand-emerald' : 'text-slate-400'}`}>
                  {stat.trend.startsWith('+') && <ArrowUpRight size={10}/>} {stat.trend}
                </span>
                <p className="text-[8px] text-slate-300 font-bold uppercase">Platform Growth</p>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">SaaS Trajectory</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Global Revenue vs Instance Adoption</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-primary"/><span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-gold"/><span className="text-[10px] font-black text-slate-400 uppercase">Active Units</span></div>
              </div>
           </div>
           
           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#1E293B" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" name="MRR (KES)" />
                  <Area type="monotone" dataKey="tenants" stroke="#FFB800" strokeWidth={5} fill="transparent" name="Active Parishes" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3">
                   <Activity size={20} className="text-brand-indigo" /> Global Signals
                 </h4>
                 <div className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-lg text-[10px] font-black uppercase tracking-widest">LIVE STREAM</div>
              </div>
              
              <div className="space-y-6">
                 {platformEvents.map((event) => (
                   <div key={event.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 border shadow-sm ${
                        event.status === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                        event.status === 'warning' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        'bg-blue-50 text-blue-500 border-blue-100'
                      }`}>
                         {event.type === 'BILLING' ? <CreditCard size={16}/> : event.type === 'INFRA' ? <Database size={16}/> : <ShieldAlert size={16}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-700 leading-tight">{event.msg}</p>
                         <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{event.type}</p>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{event.time}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                 Global Audit Vault <ArrowUpRight size={12}/>
              </button>
           </div>

           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Zap size={24}/></div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Fleet Intelligence</h4>
                 </div>
                 <p className="text-indigo-100 text-sm font-medium leading-relaxed italic opacity-80">
                   "Infrastructure is <span className="text-white font-black">optimal</span>. Predicted growth for Q4 is <span className="text-brand-gold font-black">22%</span>. Recommend scaling Nairobi-East node."
                 </p>
                 <div className="pt-6 border-t border-white/10">
                    <button className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2 shadow-lg">
                       Full Node Analysis <ArrowUpRight size={16}/>
                    </button>
                 </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:scale-125 transition-transform duration-1000" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tight">Tenant Parish Registry</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Cross-Branch Subscription & Performance Health</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search parishes or regions..." 
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-sm"
              />
            </div>
            <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary transition-all">
               <Filter size={20}/>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Tier</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Next Billing</th>
                <th className="px-10 py-6">SLA Health</th>
                <th className="px-10 py-6 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                          <Building2 size={20}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-base">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.region} Region</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      p.plan === 'Enterprise' ? 'bg-brand-gold text-brand-primary' : 'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'
                    }`}>
                       {p.plan}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          p.status === 'Active' ? 'bg-brand-emerald animate-pulse' : 
                          p.status === 'Trialing' ? 'bg-brand-indigo' : 'bg-rose-500'
                        }`}/>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          p.status === 'Active' ? 'text-brand-emerald' : 
                          p.status === 'Trialing' ? 'text-brand-indigo' : 'text-rose-500'
                        }`}>{p.status}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 font-bold text-slate-600 text-sm">
                    {p.renewal}
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                          <span>Uptime Index</span>
                          <span>{p.health}%</span>
                       </div>
                       <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            p.health > 80 ? 'bg-brand-emerald' : p.health > 50 ? 'bg-brand-gold' : 'bg-rose-500'
                          }`} style={{ width: `${p.health}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm" title="Proxy as Tenant">
                         <ExternalLink size={16}/>
                      </button>
                      <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Suspend Instance">
                         <ShieldX size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-all">Download Master Registry (CSV)</button>
        </div>
      </div>

      {/* Add Parish Modal */}
      {showAddParish && (
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
                    <button onClick={() => setShowAddParish(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Parish Identity</label>
                       <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g. Nairobi Central" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sub-Domain</label>
                       <div className="relative">
                          <input className="w-full p-4 pr-32 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary" placeholder="nairobi-central" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">.imani.cms</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Service Region</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700">
                          <option>Nairobi East (Edge-1)</option>
                          <option>Mombasa North (Edge-2)</option>
                          <option>Kisumu West (Edge-3)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">License Tier</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700">
                          <option>Basic (Free Trial)</option>
                          <option>Standard (Monthly)</option>
                          <option>Enterprise (SLA)</option>
                       </select>
                    </div>
                 </div>

                 <div className="p-6 bg-brand-emerald/5 rounded-[2rem] border border-dashed border-brand-emerald/20 flex items-start gap-4">
                    <ShieldCheck className="text-brand-emerald shrink-0 mt-1" size={20}/>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Provisional instance will be live within 300 seconds. An admin invite will be dispatched to the provided contact email.</p>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowAddParish(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Cancel</button>
                    <button 
                       onClick={() => { alert('Deploying instance...'); setShowAddParish(false); }}
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

export default SystemOwnerDashboard;
