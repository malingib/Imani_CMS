import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import { Activity, ArrowUpRight, Building2, CreditCard, PlugZap, ShieldCheck, Users, Wallet, RefreshCw, ChevronRight, AlertTriangle } from 'lucide-react';

const service = createPlatformDashboardService(supabase);
const money = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

const PlatformDashboard: React.FC<{ onOpenClient?: () => void }> = ({ onOpenClient }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PlatformDashboardStats>({
    totalChurches: 0, activeChurches: 0, totalMembers: 0, totalRevenue: 0,
    totalChurchesChange: 0, totalMembersChange: 0, totalRevenueChange: 0,
  });

  useEffect(() => {
    let active = true;
    service.getStats().then(data => { if (active) setStats(data); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load platform data'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activeRate = stats.totalChurches ? Math.round(stats.activeChurches / stats.totalChurches * 100) : 0;
  const sections = [
    { title: 'Client workspaces', detail: 'Create, review and manage church accounts', path: '/tenants', icon: Building2 },
    { title: 'Billing and plans', detail: 'Subscription plans and billing status', path: '/platform/billing', icon: CreditCard },
    { title: 'Integrations', detail: 'Shared payment and messaging providers', path: '/platform/integrations', icon: PlugZap },
    { title: 'Access and restrictions', detail: 'Workspace access and platform controls', path: '/platform/restrictions', icon: ShieldCheck },
  ];

  return (
    <main className="mx-auto max-w-[1440px] space-y-8 pb-12 text-slate-900">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-slate-500">Platform administration</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor client workspaces and platform activity.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/tenants')} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Building2 size={16} /> Client workspaces
          </button>
          {onOpenClient && <button type="button" onClick={onOpenClient} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#174f49] px-3.5 text-sm font-medium text-white hover:bg-[#123f3a]">Open client workspace <ArrowUpRight size={15} /></button>}
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => window.location.reload()} className="font-medium underline">Retry</button></div>}

      <section aria-labelledby="metrics-heading">
        <div className="mb-4 flex items-center justify-between"><h2 id="metrics-heading" className="text-sm font-semibold">Platform figures</h2><span className="text-xs text-slate-500">All client workspaces</span></div>
        <div className="grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200 py-5 lg:grid-cols-4">
          <div className="px-4 first:pl-0"><p className="text-xs text-slate-500">Client workspaces</p><p className="mt-2 text-2xl font-semibold tabular-nums">{loading ? '—' : stats.totalChurches.toLocaleString('en-KE')}</p><p className="mt-1 text-xs text-slate-500">{stats.activeChurches} active</p></div>
          <div className="px-4"><p className="text-xs text-slate-500">Church members</p><p className="mt-2 text-2xl font-semibold tabular-nums">{loading ? '—' : stats.totalMembers.toLocaleString('en-KE')}</p><p className="mt-1 text-xs text-slate-500">Across all workspaces</p></div>
          <div className="px-4"><p className="text-xs text-slate-500">Recorded income</p><p className="mt-2 text-2xl font-semibold tabular-nums">{loading ? '—' : money.format(stats.totalRevenue)}</p><p className="mt-1 text-xs text-slate-500">All-time church income</p></div>
          <div className="px-4"><p className="text-xs text-slate-500">Active workspace rate</p><p className="mt-2 text-2xl font-semibold tabular-nums">{loading ? '—' : `${activeRate}%`}</p><p className="mt-1 text-xs text-slate-500">{stats.activeChurches} of {stats.totalChurches} workspaces</p></div>
        </div>
      </section>

      <section aria-labelledby="admin-heading">
        <div className="mb-3"><h2 id="admin-heading" className="text-sm font-semibold">Administration</h2><p className="mt-1 text-xs text-slate-500">Platform configuration and workspace management</p></div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {sections.map(item => { const Icon = item.icon; return <button key={item.path} type="button" onClick={() => navigate(item.path)} className="group flex w-full items-center gap-4 py-4 text-left hover:bg-slate-50">
            <Icon size={18} strokeWidth={1.7} className="shrink-0 text-slate-500" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.detail}</span></span>
            <ChevronRight size={17} className="text-slate-400 group-hover:text-slate-800" />
          </button>; })}
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs text-slate-500"><Activity size={14} /> Workspace health is calculated from active client records.</p>
    </main>
  );
};

export default PlatformDashboard;
