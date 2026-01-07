
import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, CreditCard, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, ShieldCheck, 
  Globe, Server, BarChart3, Search, Filter, 
  MoreVertical, CheckCircle2, AlertTriangle, Clock,
  Smartphone, Database, MessageSquare, TrendingUp,
  HardDrive, Network, ShieldAlert, Cpu, 
  PackageCheck, RefreshCcw, ExternalLink, Plus,
  X, Loader2, Save, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Tenant } from '../types';

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

  const tenants: Tenant[] = [
    { id: 'T1', name: 'Nairobi Central Parish', subdomain: 'nairobi-central', plan: 'Enterprise', status: 'Active', ownerEmail: 'admin@imani.org', region: 'Nairobi', memberCount: 4200, mrr: 8500, renewalDate: 'Nov 12, 2024', healthScore: 98, usageMetrics: { cpu: 24, memory: 42, dbConnections: 12, smsSent: 1200 } },
    { id: 'T2', name: 'Mombasa Gateway Church', subdomain: 'mombasa-gateway', plan: 'Pro', status: 'Active', ownerEmail: 'pastor@imani.org', region: 'Coast', memberCount: 1200, mrr: 4500, renewalDate: 'Dec 01, 2024', healthScore: 92, usageMetrics: { cpu: 15, memory: 30, dbConnections: 5, smsSent: 450 } },
    { id: 'T3', name: 'Kisumu Outreach Center', subdomain: 'kisumu-outreach', plan: 'Basic', status: 'Trialing', ownerEmail: 'sec@imani.org', region: 'Western', memberCount: 450, mrr: 1200, renewalDate: 'Oct 28, 2024', healthScore: 85, usageMetrics: { cpu: 8, memory: 12, dbConnections: 2, smsSent: 120 } },
  ];

  const platformEvents = [
    { id: 'pe1', type: 'BILLING', status: 'success', msg: 'MRR Cycle complete for Tier-1 tenants', time: '12 mins ago' },
    { id: 'pe2', type: 'DEPLOY', status: 'info', msg: 'Security patch v2.3 propagated to Coast region', time: '1h ago' },
    { id: 'pe3', type: 'DATABASE', status: 'success', msg: 'Global backup task verified: Nairobi-East', time: '2h ago' },
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
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-brand-primary text-brand-gold rounded-[1.8rem] shadow-2xl border border-white/10 ring-4 ring-indigo-50">
              <Globe size={32} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-brand-primary tracking-tighter uppercase leading-none">Mobiwave HQ</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                 <Terminal size={14} className="text-brand-indigo"/> Command Console
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

      {/* Real-time Resource Utilization Pulse */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fleet Resource Pulse</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time compute utilization across active clusters</p>
           </div>
           <div className="px-4 py-2 bg-brand-emerald/10 text-brand-emerald rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              Live Telemetry
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {tenants.map(tenant => (
              <div key={tenant.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Building2 size={16} className="text-brand-indigo"/></div>
                    <span className="font-black text-slate-800 text-sm truncate">{tenant.name}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase text-slate-400">CPU</p>
                       <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${tenant.usageMetrics?.cpu && tenant.usageMetrics.cpu > 80 ? 'bg-rose-500' : 'bg-brand-indigo'}`} style={{ width: `${tenant.usageMetrics?.cpu}%` }} />
                       </div>
                       <p className="text-[10px] font-black text-slate-700">{tenant.usageMetrics?.cpu}%</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase text-slate-400">RAM</p>
                       <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-brand-gold`} style={{ width: `${tenant.usageMetrics?.memory}%` }} />
                       </div>
                       <p className="text-[10px] font-black text-slate-700">{tenant.usageMetrics?.memory}%</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase text-slate-400">DB CON</p>
                       <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-brand-emerald`} style={{ width: `${(tenant.usageMetrics?.dbConnections || 0) * 5}%` }} />
                       </div>
                       <p className="text-[10px] font-black text-slate-700">{tenant.usageMetrics?.dbConnections}</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">SaaS Trajectory</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Global Revenue vs Instance Adoption</p>
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
              </div>
              <div className="space-y-6">
                 {platformEvents.map((event) => (
                   <div key={event.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-500">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 border shadow-sm ${
                        event.status === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                        'bg-blue-50 text-blue-500 border-blue-100'
                      }`}>
                         {event.type === 'BILLING' ? <CreditCard size={16}/> : <Database size={16}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-700 leading-tight">{event.msg}</p>
                         <div className="flex items-center justify-between mt-1">
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{event.time}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOwnerDashboard;
