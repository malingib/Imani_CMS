
import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Filter, Plus, Network, 
  ExternalLink, ShieldX, CheckCircle2, AlertTriangle, 
  Clock, MoreVertical, X, PackageCheck, Globe,
  Terminal, ShieldAlert, Zap, Loader2, Save,
  ArrowUpRight, Download, BarChart3, Database,
  User, Mail, MapPin, Activity, HardDrive, Cpu, 
  History, CreditCard, ShieldCheck, Smartphone,
  Trash2, Settings2, BarChart
} from 'lucide-react';
import { Tenant } from '../types';

interface TenantRegistryProps {
  onImpersonate: (tenant: Tenant) => void;
}

const TenantRegistry: React.FC<TenantRegistryProps> = ({ onImpersonate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [suspensionConfirm, setSuspensionConfirm] = useState<Tenant | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 'T1', name: 'Nairobi Central Parish', subdomain: 'nairobi-central', plan: 'Enterprise', status: 'Active', ownerEmail: 'admin@imani.org', region: 'Nairobi East', memberCount: 4200, mrr: 8500, renewalDate: 'Nov 12, 2024', healthScore: 98, usageMetrics: { cpu: 24, memory: 42, dbConnections: 12, smsSent: 1200 } },
    { id: 'T2', name: 'Mombasa Gateway Church', subdomain: 'mombasa-gateway', plan: 'Pro', status: 'Active', ownerEmail: 'mombasa@imani.org', region: 'Coast', memberCount: 2150, mrr: 4500, renewalDate: 'Dec 01, 2024', healthScore: 92, usageMetrics: { cpu: 15, memory: 30, dbConnections: 5, smsSent: 450 } },
    { id: 'T3', name: 'Kisumu Outreach Center', subdomain: 'kisumu-outreach', plan: 'Basic', status: 'Trialing', ownerEmail: 'kisumu@imani.org', region: 'Western', memberCount: 890, mrr: 0, renewalDate: 'Oct 28, 2024', healthScore: 85, usageMetrics: { cpu: 8, memory: 12, dbConnections: 2, smsSent: 120 } },
    { id: 'T4', name: 'Nakuru Valley Parish', subdomain: 'nakuru-valley', plan: 'Enterprise', status: 'Past Due', ownerEmail: 'nakuru@imani.org', region: 'Rift Valley', memberCount: 1100, mrr: 8500, renewalDate: 'Oct 15, 2024', healthScore: 40, usageMetrics: { cpu: 65, memory: 80, dbConnections: 20, smsSent: 3000 } },
    { id: 'T5', name: 'Eldoret Grace Chapel', subdomain: 'eldoret-grace', plan: 'Pro', status: 'Active', ownerEmail: 'eldoret@imani.org', region: 'Rift Valley', memberCount: 640, mrr: 4500, renewalDate: 'Jan 20, 2025', healthScore: 95, usageMetrics: { cpu: 10, memory: 20, dbConnections: 4, smsSent: 150 } },
  ]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.subdomain.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesTier = tierFilter === 'All' || t.plan === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [searchTerm, statusFilter, tierFilter, tenants]);

  const handleExportCSV = () => {
    const headers = "ID,Parish Name,Subdomain,Tier,Status,Region,Members,MRR,RenewalDate,HealthScore\n";
    const rows = filteredTenants.map(t => 
      `${t.id},${t.name},${t.subdomain},${t.plan},${t.status},${t.region},${t.memberCount},${t.mrr},${t.renewalDate},${t.healthScore}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant_registry_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleSuspendTenant = (tenantId: string) => {
    setIsSuspending(true);
    setTimeout(() => {
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'Suspended' } : t));
      setIsSuspending(false);
      setSuspensionConfirm(null);
    }, 1500);
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getResourceSummary = (t: Tenant) => {
    const caps = {
      Basic: { db: 2, storage: '5GB' },
      Pro: { db: 10, storage: '25GB' },
      Enterprise: { db: 'Unlimited', storage: '100GB' }
    };
    const planCaps = caps[t.plan as keyof typeof caps];
    return `${t.usageMetrics?.dbConnections || 0} / ${planCaps.db} Nodes`;
  };

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
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
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
                <th className="px-10 py-6">Resources</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTenants.map((t) => (
                <tr 
                  key={t.id} 
                  onClick={() => setSelectedTenant(t)}
                  className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl shadow-sm">
                             <Building2 size={20}/>
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${getHealthColor(t.healthScore)}`} />
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
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                       <Database size={14} className="text-slate-300"/>
                       {getResourceSummary(t)}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          t.status === 'Active' ? 'bg-brand-emerald animate-pulse' : 
                          t.status === 'Trialing' ? 'bg-brand-indigo' : 
                          t.status === 'Suspended' ? 'bg-slate-400' : 'bg-rose-500'
                        }`}/>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          t.status === 'Active' ? 'text-brand-emerald' : 
                          t.status === 'Trialing' ? 'text-brand-indigo' : 
                          t.status === 'Suspended' ? 'text-slate-400' : 'text-rose-500'
                        }`}>{t.status}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right relative">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                       {t.status === 'Past Due' && (
                         <button 
                           onClick={() => setSuspensionConfirm(t)}
                           className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                         >
                            <ShieldX size={14}/> Suspend
                         </button>
                       )}
                       <button 
                        onClick={() => onImpersonate(t)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm" 
                        title="Proxy Login as Admin"
                       >
                          <ExternalLink size={16}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detail Side Panel */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex justify-end">
           <div className="bg-white w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/20">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary text-white rounded-xl shadow-lg"><Building2 size={24}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedTenant.name}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Tenant Profile & Health Diagnostics</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTenant(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 transition-all shadow-sm"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                 {/* Identity Summary */}
                 <section className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                       <div className="flex items-center gap-2 text-brand-primary">
                          <User size={16}/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Admin Contact</span>
                       </div>
                       <p className="text-sm font-bold text-slate-800 truncate">{selectedTenant.ownerEmail}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                       <div className="flex items-center gap-2 text-brand-primary">
                          <MapPin size={16}/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Region</span>
                       </div>
                       <p className="text-sm font-bold text-slate-800">{selectedTenant.region}</p>
                    </div>
                 </section>

                 {/* Real-time Utilization Pulse */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                          <Activity size={16} className="text-brand-indigo"/> Resource Pulse
                       </h4>
                       <span className="px-2 py-1 bg-brand-emerald/10 text-brand-emerald rounded text-[8px] font-black uppercase">Live Telemetry</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="text-slate-400 flex items-center gap-1"><Cpu size={12}/> CPU</span>
                             <span className="text-slate-700">{selectedTenant.usageMetrics?.cpu}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${selectedTenant.usageMetrics?.cpu && selectedTenant.usageMetrics.cpu > 80 ? 'bg-rose-500' : 'bg-brand-indigo'}`} style={{ width: `${selectedTenant.usageMetrics?.cpu}%` }} />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="text-slate-400 flex items-center gap-1"><HardDrive size={12}/> RAM</span>
                             <span className="text-slate-700">{selectedTenant.usageMetrics?.memory}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-gold transition-all duration-1000" style={{ width: `${selectedTenant.usageMetrics?.memory}%` }} />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="text-slate-400 flex items-center gap-1"><Database size={12}/> DB</span>
                             <span className="text-slate-700">{selectedTenant.usageMetrics?.dbConnections}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-emerald transition-all duration-1000" style={{ width: `${(selectedTenant.usageMetrics?.dbConnections || 0) * 5}%` }} />
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Subscription Details */}
                 <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                       <CreditCard size={16} className="text-brand-gold"/> Subscription Audit
                    </h4>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                       <div className="relative z-10 flex justify-between items-start text-white">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Active Tier</p>
                             <h5 className="text-3xl font-black mt-1 uppercase">{selectedTenant.plan}</h5>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Monthly Revenue</p>
                             <h5 className="text-2xl font-black mt-1 text-brand-gold">KES {selectedTenant.mrr.toLocaleString()}</h5>
                          </div>
                       </div>
                       <div className="relative z-10 grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                             <p className="text-[8px] font-black uppercase text-indigo-200">Last Renewal</p>
                             <p className="text-xs font-bold text-white mt-1">Oct 12, 2023</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                             <p className="text-[8px] font-black uppercase text-indigo-200">Next Cycle</p>
                             <p className="text-xs font-bold text-white mt-1">{selectedTenant.renewalDate}</p>
                          </div>
                       </div>
                       <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-brand-indigo rounded-full blur-[80px] opacity-20 transition-transform duration-1000 group-hover:scale-125" />
                    </div>
                 </section>

                 {/* Historical Logs */}
                 <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                       <History size={16} className="text-slate-400"/> Operational History
                    </h4>
                    <div className="space-y-4">
                       {[
                         { msg: 'System patch v2.4.1 applied successfully', date: 'Oct 22, 10:30 AM', status: 'success' },
                         { msg: 'Database backup completed (Mombasa Node)', date: 'Oct 21, 04:00 AM', status: 'success' },
                         { msg: 'Billing attempt failed: M-Pesa error', date: 'Oct 15, 09:12 AM', status: 'fail' }
                       ].map((log, i) => (
                         <div key={i} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                            <div className={`p-2 rounded-lg mt-0.5 ${log.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                               {log.status === 'success' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-700 leading-tight">{log.msg}</p>
                               <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{log.date}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                 <button 
                  onClick={() => onImpersonate(selectedTenant)}
                  className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-2"
                 >
                    <ExternalLink size={16}/> Proxy Login
                 </button>
                 <button className="flex-1 py-5 bg-white border border-slate-200 text-brand-primary rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Smartphone size={16}/> Push Alert
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Suspension Confirmation Dialog */}
      {suspensionConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[700] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-200 text-center border border-white/20">
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                 <ShieldAlert size={48}/>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">License Suspension</h3>
                 <p className="text-slate-500 font-medium text-base leading-relaxed">
                   You are about to suspend <span className="text-slate-900 font-black">{suspensionConfirm.name}</span> for delinquency. Their sub-domain will redirect to the platform portal.
                 </p>
              </div>
              <div className="flex flex-col gap-4">
                 <button 
                   disabled={isSuspending}
                   onClick={() => handleSuspendTenant(suspensionConfirm.id)}
                   className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSuspending ? <Loader2 className="animate-spin" size={20}/> : <ShieldX size={20}/>}
                   Confirm Suspension
                 </button>
                 <button onClick={() => setSuspensionConfirm(null)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel & Return</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Parish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
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
