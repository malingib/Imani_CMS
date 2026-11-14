import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowUpRight, Building2, CheckCircle2, ChevronRight, CreditCard,
  Globe2, PlugZap, Plus, ShieldCheck, Users, Wallet, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import { createTenantsService, type ChurchRecord } from '../src/lib/tenants-service';

const service = createPlatformDashboardService(supabase);
const tenantsService = createTenantsService(supabase);
const money = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

const PlatformDashboard: React.FC<{ onOpenClient?: () => void }> = ({ onOpenClient }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PlatformDashboardStats>({
    totalChurches: 0, activeChurches: 0, totalMembers: 0, totalRevenue: 0,
    totalChurchesChange: 0, totalMembersChange: 0, totalRevenueChange: 0,
  });
  const [churches, setChurches] = useState<ChurchRecord[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([service.getStats(), tenantsService.listChurchesWithMemberCounts()])
      .then(([data, rows]) => {
        if (!active) return;
        setStats(data);
        setChurches(rows.filter(church => church.status !== 'archived')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load platform data'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activeRate = stats.totalChurches ? Math.round(stats.activeChurches / stats.totalChurches * 100) : 0;
  const inactiveCount = Math.max(0, stats.totalChurches - stats.activeChurches);
  const recentChurches = churches.slice(0, 6);
  const sections = [
    { title: 'Client workspaces', detail: 'Create and manage church accounts', path: '/tenants', icon: Building2 },
    { title: 'Billing and plans', detail: 'Subscriptions and billing status', path: '/platform/billing', icon: CreditCard },
    { title: 'Integrations', detail: 'Payment and messaging providers', path: '/platform/integrations', icon: PlugZap },
    { title: 'Access controls', detail: 'Workspace restrictions and access', path: '/platform/restrictions', icon: ShieldCheck },
  ];
  const byTier = useMemo(() => {
    const counts = new Map<string, number>();
    churches.forEach(church => counts.set(church.tier || 'Unassigned', (counts.get(church.tier || 'Unassigned') || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [churches]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10 text-slate-900">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><span>Platform</span><span aria-hidden="true">/</span><span className="font-medium text-slate-700">Overview</span></div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-slate-950">Platform overview</h1>
          <p className="mt-1 text-sm text-slate-600">A live view of Imani church workspaces and platform income.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/tenants')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Building2 size={16} /> Client workspaces</button>
          {onOpenClient && <button type="button" onClick={onOpenClient} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#18312f] px-3.5 text-sm font-semibold text-white hover:bg-[#102725]">Open client workspace <ArrowUpRight size={15} /></button>}
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => window.location.reload()} className="font-semibold underline">Retry</button></div>}

      <section aria-label="Platform key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {[
          { label: 'Client workspaces', value: stats.totalChurches, note: `${stats.activeChurches} active`, icon: Building2, path: '/tenants', accent: 'teal' },
          { label: 'Church members', value: stats.totalMembers, note: 'Across all workspaces', icon: Users, path: '/tenants', accent: 'blue' },
          { label: 'Recorded income', value: money.format(stats.totalRevenue), note: 'All-time church income', icon: Wallet, path: '/platform/billing', accent: 'gold' },
          { label: 'Active workspace rate', value: `${activeRate}%`, note: `${stats.activeChurches} of ${stats.totalChurches} workspaces`, icon: Activity, path: '/platform/activity', accent: 'green' },
        ].map(metric => <button key={metric.label} type="button" onClick={() => navigate(metric.path)} className="group min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
          <span className="flex items-center justify-between gap-3"><span className="text-[13px] font-medium text-slate-600">{metric.label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.accent === 'gold' ? 'bg-[#f7f3e9] text-[#8a6a2f]' : 'bg-[#edf4f1] text-[#285653]'}`}><metric.icon size={17} /></span></span>
          <span className="mt-3 block truncate text-[25px] font-semibold leading-none tracking-[-0.03em] text-slate-950 tabular-nums">{loading ? '—' : typeof metric.value === 'number' ? metric.value.toLocaleString('en-KE') : metric.value}</span>
          <span className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="truncate">{metric.note}</span><ArrowUpRight size={14} className="shrink-0 text-slate-400 group-hover:text-[#285653]" /></span>
        </button>)}
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-3" aria-labelledby="workspace-health-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="workspace-health-heading" className="text-base font-semibold text-slate-900">Workspace health</h2><p className="mt-1 text-xs text-slate-500">Status across all client churches</p></div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"><CheckCircle2 size={13} />{activeRate}% active</span>
          </div>
          <div className="mt-7 flex items-end justify-between gap-4">
            <div><p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 tabular-nums">{loading ? '—' : stats.totalChurches.toLocaleString('en-KE')}</p><p className="mt-1 text-xs text-slate-500">Registered workspaces</p></div>
            <button type="button" onClick={() => navigate('/tenants')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#285653] hover:underline">Manage workspaces <ChevronRight size={14} /></button>
          </div>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${stats.activeChurches} active and ${inactiveCount} inactive workspaces`}>
            {stats.totalChurches > 0 && <><span className="h-full bg-[#285653]" style={{ width: `${activeRate}%` }} /><span className="h-full bg-[#c9d6d2]" style={{ width: `${100 - activeRate}%` }} /></>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#285653]" /><span className="text-xs text-slate-600">Active</span><span className="ml-auto text-sm font-semibold tabular-nums text-slate-900">{loading ? '—' : stats.activeChurches}</span></div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#c9d6d2]" /><span className="text-xs text-slate-600">Other statuses</span><span className="ml-auto text-sm font-semibold tabular-nums text-slate-900">{loading ? '—' : inactiveCount}</span></div>
          </div>
          {!!byTier.length && <div className="mt-6 border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-semibold text-slate-700">Plan distribution</p><div className="grid grid-cols-2 gap-x-6 gap-y-3">{byTier.map(([tier, count]) => <div key={tier} className="flex items-center gap-2 text-xs"><span className="truncate text-slate-500">{tier}</span><span className="ml-auto font-semibold tabular-nums text-slate-800">{count}</span></div>)}</div></div>}
          {!loading && stats.totalChurches === 0 && <p className="mt-4 text-sm text-slate-500">No client workspaces have been added yet.</p>}
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2" aria-labelledby="platform-tools-heading">
          <div className="mb-3"><h2 id="platform-tools-heading" className="text-base font-semibold text-slate-900">Platform operations</h2><p className="mt-1 text-xs text-slate-500">Administration and service settings</p></div>
          <div className="divide-y divide-slate-100">
            {sections.map(item => { const Icon = item.icon; return <button key={item.path} type="button" onClick={() => navigate(item.path)} className="group flex w-full items-center gap-3 py-3 text-left first:pt-2 hover:bg-slate-50/70">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4f1] text-[#285653]"><Icon size={16} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.detail}</span></span>
              <ChevronRight size={15} className="shrink-0 text-slate-400 group-hover:text-slate-800" />
            </button>; })}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-labelledby="recent-workspaces-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><h2 id="recent-workspaces-heading" className="text-base font-semibold text-slate-900">Recently added workspaces</h2><p className="mt-1 text-xs text-slate-500">Latest client churches registered on Imani</p></div>
          <button type="button" onClick={() => navigate('/tenants')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#285653] hover:underline">All workspaces <ChevronRight size={14} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead><tr className="bg-[#f8faf9] text-[10px] font-semibold uppercase tracking-wide text-slate-500"><th scope="col" className="px-5 py-3">Workspace</th><th scope="col" className="px-3 py-3">Plan</th><th scope="col" className="px-3 py-3">Members</th><th scope="col" className="px-3 py-3">Created</th><th scope="col" className="px-3 py-3">Status</th><th scope="col" className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recentChurches.map(church => {
                const active = church.status?.toLowerCase() === 'active';
                const created = new Date(church.created_at);
                return <tr key={church.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf4f1] text-[#285653]">{church.logo_url ? <img src={church.logo_url} alt="" className="h-full w-full object-cover" /> : <Globe2 size={15} />}</span><span className="min-w-0"><span className="block max-w-[250px] truncate font-semibold text-slate-800">{church.name}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{church.slug}</span></span></div></td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">{church.tier || 'Unassigned'}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium tabular-nums text-slate-700">{(church.memberCount || 0).toLocaleString('en-KE')}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">{Number.isNaN(created.getTime()) ? '—' : created.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{church.status || 'Unknown'}</span></td>
                  <td className="px-5 py-3 text-right"><button type="button" onClick={() => navigate('/tenants')} className="font-semibold text-[#285653] hover:underline">Review</button></td>
                </tr>;
              })}
              {!loading && !recentChurches.length && <tr><td colSpan={6} className="px-5 py-10 text-center"><p className="font-medium text-slate-700">No workspaces to show</p><button type="button" onClick={() => navigate('/tenants')} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#285653] hover:underline"><Plus size={14} /> Add a workspace</button></td></tr>}
              {loading && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Loading workspace records…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs text-slate-500"><Activity size={14} /> Figures are calculated from current client and transaction records.</p>
    </div>
  );
};

export default PlatformDashboard;
