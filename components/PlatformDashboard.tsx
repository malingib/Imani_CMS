import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import {
  Activity, ArrowUpRight, Building2, CreditCard, PlugZap, ShieldCheck,
  Users, Wallet, RefreshCw, ChevronRight, CircleCheck, AlertTriangle,
} from 'lucide-react';

const platformDashboardService = createPlatformDashboardService(supabase);
const money = new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', notation: 'compact', maximumFractionDigits: 1,
});

const PlatformDashboard: React.FC<{ onOpenClient?: () => void }> = ({ onOpenClient }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PlatformDashboardStats>({
    totalChurches: 0, activeChurches: 0, totalMembers: 0, totalRevenue: 0,
    totalChurchesChange: 0, totalMembersChange: 0, totalRevenueChange: 0,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const next = await platformDashboardService.getStats();
        if (mounted) setStats(next);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load platform statistics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const activePct = stats.totalChurches ? Math.round(stats.activeChurches / stats.totalChurches * 100) : 0;
  const health = stats.totalChurches === 0
    ? { label: 'Awaiting workspaces', tone: 'neutral' }
    : activePct >= 90 ? { label: 'All systems healthy', tone: 'good' }
    : activePct >= 70 ? { label: 'Review required', tone: 'warn' }
    : { label: 'Attention required', tone: 'bad' };

  const metrics = useMemo(() => [
    { label: 'Client workspaces', value: stats.totalChurches.toLocaleString('en-KE'), note: `${stats.activeChurches.toLocaleString('en-KE')} currently active`, icon: Building2, tint: 'indigo' },
    { label: 'Church members', value: stats.totalMembers.toLocaleString('en-KE'), note: 'Across all client workspaces', icon: Users, tint: 'blue' },
    { label: 'Recorded income', value: money.format(stats.totalRevenue), note: 'All-time recorded church income', icon: Wallet, tint: 'emerald' },
    { label: 'Workspace health', value: health.label, note: `${activePct}% active workspace rate`, icon: Activity, tint: health.tone === 'bad' ? 'rose' : health.tone === 'warn' ? 'amber' : 'teal' },
  ], [stats, activePct, health.label, health.tone]);

  const actions = [
    { title: 'Client workspaces', description: 'Provision, review and manage church accounts.', icon: Building2, path: '/tenants', tag: 'Workspace management' },
    { title: 'Billing & plans', description: 'Review subscriptions, plans and billing status.', icon: CreditCard, path: '/platform/billing', tag: 'Commercial' },
    { title: 'Platform integrations', description: 'Manage shared provider configuration securely.', icon: PlugZap, path: '/platform/integrations', tag: 'Connections' },
    { title: 'Restrictions & access', description: 'Control feature access and account restrictions.', icon: ShieldCheck, path: '/platform/restrictions', tag: 'Governance' },
  ];

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-2xl bg-[#102d2b] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200"><span className="h-2 w-2 rounded-full bg-teal-300" /> Platform control centre</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Platform overview</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Manage client workspaces, monitor platform health and review recorded income across Imani CMS.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/tenants')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><Building2 size={16} />Manage workspaces</button>
            {onOpenClient && <button type="button" onClick={onOpenClient} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d7eee8] px-4 py-2.5 text-sm font-semibold text-[#102d2b] transition hover:bg-white">Open client workspace <ArrowUpRight size={16} /></button>}
          </div>
        </div>
      </section>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div><strong>Platform data could not be loaded.</strong><p className="mt-1">{error}</p></div><button type="button" onClick={() => window.location.reload()} className="ml-auto inline-flex items-center gap-1 font-semibold"><RefreshCw size={14} />Retry</button></div>}

      <section aria-label="Platform key metrics">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-base font-semibold text-slate-900">Platform at a glance</h2><p className="mt-1 text-xs text-slate-500">Current totals from configured client workspaces</p></div><span className="text-xs text-slate-400">Live platform data</span></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            const tones: Record<string, string> = {
              indigo: 'bg-indigo-50 text-indigo-700', blue: 'bg-sky-50 text-sky-700',
              emerald: 'bg-emerald-50 text-emerald-700', teal: 'bg-teal-50 text-teal-700',
              amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700',
            };
            return <article key={item.label} className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{item.label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[item.tint]}`}><Icon size={18} /></span></div>
              <div className="mt-5 min-h-9">{loading ? <div className="h-8 w-3/5 animate-pulse rounded bg-slate-100" /> : <p className="text-[1.65rem] font-semibold tracking-tight text-slate-950">{item.value}</p>}</div>
              <p className="mt-2 text-xs text-slate-500">{item.note}</p>
            </article>;
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-5" aria-labelledby="health-heading">
          <div className="flex items-start justify-between gap-4"><div><h2 id="health-heading" className="text-base font-semibold text-slate-900">Workspace health</h2><p className="mt-1 text-xs text-slate-500">Active client workspaces</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${health.tone === 'good' ? 'bg-emerald-50 text-emerald-700' : health.tone === 'warn' ? 'bg-amber-50 text-amber-700' : health.tone === 'bad' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{health.label}</span></div>
          <div className="mt-7 flex items-end justify-between"><div><p className="text-4xl font-semibold tracking-tight text-slate-950">{loading ? '—' : `${activePct}%`}</p><p className="mt-1 text-xs text-slate-500">Active workspace rate</p></div><p className="text-sm font-medium text-slate-700">{stats.activeChurches} <span className="text-slate-400">/ {stats.totalChurches}</span></p></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: loading ? '0%' : `${activePct}%` }} /></div>
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><CircleCheck size={15} className="text-teal-700" />Workspace status is based on active client records.</div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-7" aria-labelledby="admin-heading">
          <div className="mb-4"><h2 id="admin-heading" className="text-base font-semibold text-slate-900">Administration</h2><p className="mt-1 text-xs text-slate-500">Direct access to the areas you manage most.</p></div>
          <div className="divide-y divide-slate-100">
            {actions.map((action) => { const Icon = action.icon; return <button key={action.path} type="button" onClick={() => navigate(action.path)} className="group flex w-full items-center gap-4 py-4 text-left first:pt-1 last:pb-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:bg-[#e7f2ef] group-hover:text-[#14534b]"><Icon size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{action.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span></span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">{action.tag}</span><ChevronRight size={17} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
            </button>; })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlatformDashboard;
