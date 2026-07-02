import React, { useState } from 'react';
import { Building2, Plus, Search, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Church {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  memberCount?: number;
}

interface TenantsListProps {
  churches: Church[];
  onCreateChurch: (data: { name: string; slug?: string; tier: string; email?: string }) => void;
  onSelectChurch: (churchId: string) => void;
}

const TenantsList: React.FC<TenantsListProps> = ({ churches, onCreateChurch, onSelectChurch }) => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState('basic');
  const [error, setError] = useState('');

  const createChurch = () => {
    setError('');
    if (!newName.trim()) {
      setError('Church name is required');
      return;
    }
    onCreateChurch({ name: newName.trim(), slug: newSlug || undefined, tier: newTier, email: newEmail || undefined });
    setShowCreate(false);
    setNewName('');
    setNewSlug('');
    setNewEmail('');
  };

  const filtered = churches.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight">Tenants</h1>
          <p className="text-slate-500 font-medium mt-1">{churches.length} churches</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
          <Plus size={18} /> New Church
        </button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input placeholder="Search churches..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold text-slate-400">No churches found</p>
          </div>
        ) : (
          filtered.map((church) => (
            <div key={church.id} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onSelectChurch(church.id)}>
                <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center">
                  <Building2 size={22} className="text-brand-indigo" />
                </div>
                <div>
                  <p className="font-black text-brand-primary">{church.name}</p>
                  <p className="text-xs font-bold text-slate-400">{church.memberCount ?? 0} members · {church.tier} · {church.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {church.status === 'active' ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-400" />}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setError(''); }}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-brand-primary mb-6">New Church</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Church Name</label>
                <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
              </div>
              {newSlug && <p className="text-xs font-bold text-slate-400 -mt-2">Slug: {newSlug}</p>}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Admin Email (optional)</label>
                <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@church.org" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tier</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newTier} onChange={(e) => setNewTier(e.target.value)}>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button onClick={createChurch} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 mt-2">
                Create Church
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsList;
