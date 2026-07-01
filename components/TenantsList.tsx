import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Building2, Plus, Search, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import type { AppView } from '../types';

interface Church {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  created_at: string;
  memberCount?: number;
}

interface TenantsListProps {
  onNavigate: (view: AppView) => void;
  onSelectChurch: (churchId: string) => void;
}

const TenantsList: React.FC<TenantsListProps> = ({ onNavigate, onSelectChurch }) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState('basic');

  const fetch = async () => {
    const { data } = await supabase.from('churches').select('*').order('name');
    if (!data) return;
    const withCounts = await Promise.all(
      (data as Church[]).map(async (c) => {
        const { count } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('church_id', c.id);
        return { ...c, memberCount: count || 0 };
      })
    );
    setChurches(withCounts);
  };

  useEffect(() => { fetch(); }, []);

  const createChurch = async () => {
    const slug = newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data } = await supabase.from('churches').insert([{ name: newName, slug, tier: newTier }]).select();
    if (data) {
      await supabase.from('subscriptions').insert([{ church_id: data[0].id, tier: newTier, status: 'active' }]);
      if (newEmail) {
        const token = crypto.randomUUID();
        await supabase.from('invitations').insert([{ church_id: data[0].id, email: newEmail, role: 'ADMIN', token }]);
      }
    }
    setShowCreate(false);
    setNewName('');
    setNewSlug('');
    setNewEmail('');
    fetch();
  };

  const filtered = churches.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
        {filtered.map(church => (
          <div key={church.id} className="flex items-center justify-between p-6 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onSelectChurch(church.id)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center">
                <Building2 size={22} className="text-brand-indigo" />
              </div>
              <div>
                <p className="font-black text-brand-primary">{church.name}</p>
                <p className="text-xs font-bold text-slate-400">{church.memberCount} members · {church.tier}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {church.status === 'active' ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-400" />}
              <button className="p-2 text-slate-300 hover:text-slate-500"><MoreHorizontal size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-brand-primary mb-6">New Church</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Church Name</label>
                <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
              </div>
              {newSlug && <p className="text-xs font-bold text-slate-400 -mt-2">Slug: {newSlug}</p>}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Admin Email</label>
                <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@church.org" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tier</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={newTier} onChange={(e) => setNewTier(e.target.value)}>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
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
