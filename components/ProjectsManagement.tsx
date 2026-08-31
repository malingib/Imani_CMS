import React, { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, CircleDollarSign, FolderKanban, Plus, Search, Target, X } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import type { Project, ProjectCategory, ProjectStatus } from '../types';

interface ProjectsManagementProps {
  churchId: string;
  currentUserId?: string;
  canManage?: boolean;
  addToast?: (message: string) => void;
}

const CATEGORIES: ProjectCategory[] = ['CONSTRUCTION', 'RENOVATION', 'MAINTENANCE', 'EQUIPMENT', 'OUTREACH', 'MISSION', 'WELFARE', 'YOUTH', 'CHILDREN', 'OTHER'];

const emptyForm = {
  name: '', code: '', description: '', category: 'OTHER' as ProjectCategory,
  targetAmount: '', startDate: '', targetDate: '', status: 'ACTIVE' as ProjectStatus,
  accountPrefix: '', publicVisibility: true, allowContributions: true,
};

function money(value: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value || 0);
}

export default function ProjectsManagement({ churchId, currentUserId, canManage = true, addToast }: ProjectsManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ProjectStatus>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadProjects = async () => {
    if (!churchId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });
    if (error) {
      addToast?.(`Could not load projects: ${error.message}`);
      setProjects([]);
    } else {
      setProjects((data || []).map((p: any) => ({
        id: p.id, churchId: p.church_id, name: p.name, code: p.code || undefined,
        description: p.description || undefined, category: p.category, targetAmount: Number(p.target_amount || 0),
        startDate: p.start_date || undefined, targetDate: p.target_date || undefined, status: p.status,
        accountPrefix: p.account_prefix || undefined, publicVisibility: p.public_visibility,
        allowContributions: p.allow_contributions, imageUrl: p.image_url || undefined, createdBy: p.created_by || undefined,
        createdAt: p.created_at, updatedAt: p.updated_at,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadProjects(); }, [churchId]);

  const filtered = useMemo(() => projects.filter(p => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q) || p.accountPrefix?.toLowerCase().includes(q);
    return matchesSearch && (status === 'ALL' || p.status === status);
  }), [projects, search, status]);

  const totals = useMemo(() => ({
    target: projects.filter(p => p.status !== 'ARCHIVED').reduce((s, p) => s + p.targetAmount, 0),
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  }), [projects]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name, code: p.code || '', description: p.description || '', category: p.category as ProjectCategory,
      targetAmount: String(p.targetAmount || ''), startDate: p.startDate || '', targetDate: p.targetDate || '',
      status: p.status, accountPrefix: p.accountPrefix || '', publicVisibility: p.publicVisibility,
      allowContributions: p.allowContributions,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId || !form.name.trim()) return;
    const target = Number(form.targetAmount || 0);
    if (!Number.isFinite(target) || target < 0) { addToast?.('Enter a valid target amount.'); return; }
    setSaving(true);
    const payload = {
      church_id: churchId, name: form.name.trim(), code: form.code.trim() || null,
      description: form.description.trim() || null, category: form.category, target_amount: target,
      start_date: form.startDate || null, target_date: form.targetDate || null, status: form.status,
      account_prefix: form.accountPrefix.trim().toUpperCase() || null, public_visibility: form.publicVisibility,
      allow_contributions: form.allowContributions, created_by: editingId ? undefined : currentUserId || null,
    };
    const result = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId).eq('church_id', churchId)
      : await supabase.from('projects').insert(payload);
    if (result.error) addToast?.(`Could not save project: ${result.error.message}`);
    else { addToast?.(editingId ? 'Project updated.' : 'Project created.'); setShowForm(false); await loadProjects(); }
    setSaving(false);
  };

  const archive = async (p: Project) => {
    if (!window.confirm(`Archive ${p.name}?`)) return;
    const { error } = await supabase.from('projects').update({ status: 'ARCHIVED' }).eq('id', p.id).eq('church_id', churchId);
    if (error) addToast?.(`Could not archive project: ${error.message}`);
    else { addToast?.('Project archived.'); await loadProjects(); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-3"><FolderKanban className="text-brand-primary" size={28} /><h1 className="text-3xl font-black text-slate-900">Projects</h1></div>
          <p className="text-slate-500 mt-2 font-medium">Manage church projects, fundraising targets and PayBill account prefixes.</p>
        </div>
        {canManage && <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white font-black shadow-lg shadow-brand-primary/20"><Plus size={18} /> New Project</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 p-6"><Target className="text-brand-primary mb-4" size={22} /><p className="text-xs uppercase tracking-wider font-black text-slate-400">Active target value</p><p className="text-2xl font-black text-slate-900 mt-1">{money(totals.target)}</p></div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6"><CircleDollarSign className="text-emerald-600 mb-4" size={22} /><p className="text-xs uppercase tracking-wider font-black text-slate-400">Active projects</p><p className="text-2xl font-black text-slate-900 mt-1">{totals.active}</p></div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6"><CheckCircle2 className="text-sky-600 mb-4" size={22} /><p className="text-xs uppercase tracking-wider font-black text-slate-400">Completed</p><p className="text-2xl font-black text-slate-900 mt-1">{totals.completed}</p></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, codes or account prefixes..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 outline-none font-medium" /></div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="px-4 py-3 rounded-2xl bg-slate-50 font-bold text-slate-600 outline-none"><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="COMPLETED">Completed</option><option value="ARCHIVED">Archived</option></select>
      </div>

      {loading ? <div className="bg-white rounded-3xl p-10 text-center text-slate-400 font-bold">Loading projects...</div> : filtered.length === 0 ? <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200"><FolderKanban className="mx-auto text-slate-300" size={40} /><p className="mt-4 font-black text-slate-700">No projects found</p><p className="text-sm text-slate-400 mt-1">Create a project to start tracking contributions.</p></div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{filtered.map(p => <div key={p.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-lg transition-shadow"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-500">{p.category}</span><span className="text-[10px] font-black uppercase text-brand-primary">{p.status}</span></div><h3 className="text-xl font-black text-slate-900 mt-3">{p.name}</h3><p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description || 'No project description.'}</p></div>{canManage && <button onClick={() => openEdit(p)} className="text-xs font-black text-brand-primary">Edit</button>}</div><div className="mt-6"><div className="flex justify-between text-sm font-bold"><span>Target</span><span>{money(p.targetAmount)}</span></div><div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(100, ((p.raisedAmount || 0) / Math.max(1, p.targetAmount)) * 100)}%` }} /></div><div className="flex justify-between mt-2 text-xs text-slate-400 font-bold"><span>Raised {money(p.raisedAmount || 0)}</span><span>{Math.round(Math.min(100, ((p.raisedAmount || 0) / Math.max(1, p.targetAmount)) * 100))}%</span></div></div><div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between"><div><p className="text-[10px] uppercase font-black text-slate-400">PayBill account</p><p className="font-black text-slate-800">{p.accountPrefix || 'Not configured'}</p></div>{canManage && p.status !== 'ARCHIVED' && <button onClick={() => archive(p)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50" title="Archive"><Archive size={17} /></button>}</div></div>)}</div>}

      {showForm && <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={save} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl p-7"><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-black text-slate-900">{editingId ? 'Edit project' : 'Create project'}</h2><p className="text-sm text-slate-400 mt-1">Projects can receive contributions through a dedicated PayBill account prefix.</p></div><button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="md:col-span-2"><span className="label">Project name</span><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Church Roof Renovation" /></label><label><span className="label">Project code</span><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="input" placeholder="ROOF-2026" /></label><label><span className="label">PayBill account prefix</span><input value={form.accountPrefix} onChange={e => setForm({ ...form, accountPrefix: e.target.value })} className="input uppercase" placeholder="ROOF" maxLength={32} /></label><label><span className="label">Category</span><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ProjectCategory })} className="input">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><label><span className="label">Target amount (KES)</span><input type="number" min="0" step="0.01" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} className="input" placeholder="2500000" /></label><label><span className="label">Start date</span><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input" /></label><label><span className="label">Target date</span><input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} className="input" /></label><label><span className="label">Status</span><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })} className="input"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="COMPLETED">Completed</option><option value="ARCHIVED">Archived</option></select></label><label className="md:col-span-2"><span className="label">Description</span><textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input resize-none" placeholder="What the church is raising funds for..." /></label></div><div className="mt-5 space-y-3"><label className="flex items-center gap-3 font-bold text-sm"><input type="checkbox" checked={form.allowContributions} onChange={e => setForm({ ...form, allowContributions: e.target.checked })} /> Accept contributions</label><label className="flex items-center gap-3 font-bold text-sm"><input type="checkbox" checked={form.publicVisibility} onChange={e => setForm({ ...form, publicVisibility: e.target.checked })} /> Show on public project pages</label></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 rounded-2xl font-black text-slate-500">Cancel</button><button disabled={saving} className="px-6 py-3 rounded-2xl bg-brand-primary text-white font-black">{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create project'}</button></div></form></div>}
      <style>{`.label{display:block;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:6px}.input{width:100%;border:1px solid #e2e8f0;border-radius:14px;padding:11px 13px;font-weight:600;outline:none;background:white}.input:focus{border-color:#94a3b8;box-shadow:0 0 0 3px rgba(148,163,184,.12)}`}</style>
    </div>
  );
}
