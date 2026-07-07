import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2, Search, Plus, Network,
  ExternalLink, ShieldX, CheckCircle2, AlertTriangle,
  Clock, X, PackageCheck, Loader2,
  Download, Database,
  User, Mail, MapPin, CreditCard,
  Smartphone, RefreshCw
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { createTenantsService, type ChurchRecord } from '../src/lib/tenants-service';

const tenantsService = createTenantsService(supabase);

const STATUS_DISPLAY: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  trialing: 'Trialing',
  onboarding: 'Onboarding',
};

const TIER_DISPLAY: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
};

interface TenantRegistryProps {
  onImpersonate: (churchId: string) => void;
}

const TenantRegistry: React.FC<TenantRegistryProps> = ({ onImpersonate }) => {
  const [churches, setChurches] = useState<ChurchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<ChurchRecord | null>(null);
  const [suspensionConfirm, setSuspensionConfirm] = useState<ChurchRecord | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState('basic');
  const [createError, setCreateError] = useState('');

  const fetchChurches = async () => {
    setLoading(true);
    try {
      const data = await tenantsService.listChurchesWithMemberCounts();
      setChurches(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChurches(); }, []);

  const filteredChurches = useMemo(() => {
    return churches.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || STATUS_DISPLAY[c.status] === statusFilter || (statusFilter === 'Past Due' && false);
      const matchesTier = tierFilter === 'All' || TIER_DISPLAY[c.tier] === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [searchTerm, statusFilter, tierFilter, churches]);

  const handleExportCSV = () => {
    const headers = "ID,Parish Name,Slug,Tier,Status,Members\n";
    const rows = filteredChurches.map(c =>
      `${c.id},${c.name},${c.slug},${TIER_DISPLAY[c.tier] || c.tier},${STATUS_DISPLAY[c.status] || c.status},${c.memberCount || 0}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant_registry_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleToggleStatus = async (church: ChurchRecord) => {
    if (church.status === 'suspended' || church.status === 'active') {
      await tenantsService.toggleChurchStatus(church);
      fetchChurches();
    } else {
      setSuspensionConfirm(church);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspensionConfirm) return;
    setIsSuspending(true);
    try {
      await tenantsService.toggleChurchStatus(suspensionConfirm);
      fetchChurches();
    } finally {
      setIsSuspending(false);
      setSuspensionConfirm(null);
    }
  };

  const handleCreateChurch = async () => {
    setCreateError('');
    if (!newName.trim()) { setCreateError('Church name is required'); return; }
    try {
      await tenantsService.createChurchWithDefaults({
        name: newName,
        slug: newSlug || undefined,
        tier: newTier,
        adminEmail: newEmail.trim() || undefined,
      });
      setShowAddModal(false);
      setNewName('');
      setNewSlug('');
      setNewEmail('');
      fetchChurches();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create church');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-600' };
      case 'trialing': return { dot: 'bg-indigo-500', text: 'text-indigo-600' };
      case 'onboarding': return { dot: 'bg-amber-500', text: 'text-amber-600' };
      case 'suspended': return { dot: 'bg-slate-400', text: 'text-slate-400' };
      default: return { dot: 'bg-rose-500', text: 'text-rose-500' };
    }
  };

  const getTierStyle = (tier: string) => {
    if (tier === 'pro') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-indigo-50 text-indigo-600 border-indigo-200';
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
            </select>
            <select
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
            </select>
            <button onClick={fetchChurches} className="px-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-primary transition-all">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-brand-primary" size={40} />
            </div>
          ) : (
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6">Parish Identity</th>
                  <th className="px-10 py-6">Sub-Domain</th>
                  <th className="px-10 py-6">Tier</th>
                  <th className="px-10 py-6">Members</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredChurches.map((c) => {
                  const sc = getStatusColor(c.status);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedChurch(c)}
                      className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl shadow-sm">
                              <Building2 size={20}/>
                           </div>
                           <div>
                              <p className="font-black text-slate-800 text-base">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.memberCount?.toLocaleString() || 0} Members</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <code className="px-3 py-1 bg-slate-100 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                           {c.slug}.imani.cms
                        </code>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${getTierStyle(c.tier)}`}>
                           {TIER_DISPLAY[c.tier] || c.tier}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                           <Database size={14} className="text-slate-300"/>
                           {c.memberCount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`}/>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>
                              {STATUS_DISPLAY[c.status] || c.status}
                            </span>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right relative">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                           {c.status === 'trialing' || (c.status !== 'suspended' && c.status !== 'active') ? (
                             <button
                               onClick={() => handleToggleStatus(c)}
                               className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                             >
                                <ShieldX size={14}/> Suspend
                             </button>
                           ) : c.status === 'suspended' ? (
                             <button
                               onClick={() => handleToggleStatus(c)}
                               className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                             >
                                <CheckCircle2 size={14}/> Activate
                             </button>
                           ) : null}
                           <button
                            onClick={() => onImpersonate(c.id)}
                            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                            title="Proxy Login as Admin"
                           >
                              <ExternalLink size={16}/>
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tenant Detail Side Panel */}
      {selectedChurch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex justify-end">
           <div className="bg-white w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/20">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary text-white rounded-xl shadow-lg"><Building2 size={24}/></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedChurch.name}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Tenant Profile</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedChurch(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 transition-all shadow-sm"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                 {/* Identity Summary */}
                 <section className="grid grid-cols-2 gap-6">
                    {selectedChurch.email && (
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-2 text-brand-primary">
                            <Mail size={16}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Contact Email</span>
                         </div>
                         <p className="text-sm font-bold text-slate-800 truncate">{selectedChurch.email}</p>
                      </div>
                    )}
                    {selectedChurch.phone && (
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-2 text-brand-primary">
                            <Smartphone size={16}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
                         </div>
                         <p className="text-sm font-bold text-slate-800">{selectedChurch.phone}</p>
                      </div>
                    )}
                    {selectedChurch.address && (
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-2 text-brand-primary">
                            <MapPin size={16}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Address</span>
                         </div>
                         <p className="text-sm font-bold text-slate-800">{selectedChurch.address}</p>
                      </div>
                    )}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                       <div className="flex items-center gap-2 text-brand-primary">
                          <User size={16}/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Members</span>
                       </div>
                       <p className="text-sm font-bold text-slate-800">{selectedChurch.memberCount?.toLocaleString() || 0}</p>
                    </div>
                 </section>

                 {/* Subscription Details */}
                 <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                       <CreditCard size={16} className="text-brand-gold"/> Subscription
                    </h4>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                       <div className="relative z-10 flex justify-between items-start text-white">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Tier</p>
                             <h5 className="text-3xl font-black mt-1 uppercase">{TIER_DISPLAY[selectedChurch.tier] || selectedChurch.tier}</h5>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Status</p>
                             <h5 className="text-2xl font-black mt-1 text-brand-gold">{STATUS_DISPLAY[selectedChurch.status] || selectedChurch.status}</h5>
                          </div>
                       </div>
                       <div className="relative z-10 grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                             <p className="text-[8px] font-black uppercase text-indigo-200">Created</p>
                             <p className="text-xs font-bold text-white mt-1">{new Date(selectedChurch.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                             <p className="text-[8px] font-black uppercase text-indigo-200">Trial Ends</p>
                             <p className="text-xs font-bold text-white mt-1">
                               {selectedChurch.trial_end_date ? new Date(selectedChurch.trial_end_date).toLocaleDateString() : 'N/A'}
                             </p>
                          </div>
                       </div>
                       <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-brand-indigo rounded-full blur-[80px] opacity-20 transition-transform duration-1000 group-hover:scale-125" />
                    </div>
                 </section>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                 <button
                  onClick={() => { onImpersonate(selectedChurch.id); setSelectedChurch(null); }}
                  className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-2"
                 >
                    <ExternalLink size={16}/> Proxy Login
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
                 <ShieldX size={48}/>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">Suspend Tenant</h3>
                 <p className="text-slate-500 font-medium text-base leading-relaxed">
                   You are about to suspend <span className="text-slate-900 font-black">{suspensionConfirm.name}</span>. Their sub-domain will redirect to the platform portal.
                 </p>
              </div>
              <div className="flex flex-col gap-4">
                 <button
                   disabled={isSuspending}
                   onClick={handleConfirmSuspend}
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
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Parish Name</label>
                       <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-inner"
                         placeholder="e.g. Nairobi Central"
                         value={newName}
                         onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sub-Domain</label>
                       <div className="relative">
                          <input className="w-full p-4 pr-32 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-inner"
                            placeholder="nairobi-central"
                            value={newSlug}
                            onChange={(e) => setNewSlug(e.target.value)}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">.imani.cms</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Admin Email</label>
                       <input type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-inner"
                         placeholder="admin@church.org"
                         value={newEmail}
                         onChange={(e) => setNewEmail(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">License Tier</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                         value={newTier}
                         onChange={(e) => setNewTier(e.target.value)}
                       >
                          <option value="basic">Basic (Trial)</option>
                          <option value="pro">Pro (Monthly)</option>
                       </select>
                    </div>
                 </div>

                 {createError && (
                   <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                     <AlertTriangle size={14} /> {createError}
                   </div>
                 )}

                 <div className="p-6 bg-emerald-50 rounded-[2rem] border border-dashed border-emerald-200 flex items-start gap-4">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20}/>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">A 14-day trial instance will be created. An admin invite will be dispatched to the provided email.</p>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl uppercase text-xs tracking-widest transition-all">Cancel</button>
                    <button
                       onClick={handleCreateChurch}
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
