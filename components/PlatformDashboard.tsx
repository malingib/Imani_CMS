import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import { Building2, Users, Activity, TrendingUp } from 'lucide-react';

const platformDashboardService = createPlatformDashboardService(supabase);

const PlatformDashboard: React.FC<{ onOpenClient?: () => void }> = ({ onOpenClient }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PlatformDashboardStats>({
    totalChurches: 0, activeChurches: 0, totalMembers: 0, totalRevenue: 0,
    totalChurchesChange: 0, totalMembersChange: 0, totalRevenueChange: 0,
  });

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const nextStats = await platformDashboardService.getStats();
        if (mounted) setStats(nextStats);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load platform statistics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetch();
    return () => { mounted = false; };
  }, []);

  const healthPct = stats.totalChurches > 0 ? (stats.activeChurches / stats.totalChurches) * 100 : 0;
  const healthLabel = stats.totalChurches === 0 ? 'No clients yet' : healthPct >= 90 ? 'Healthy' : healthPct >= 70 ? 'Needs attention' : 'Degraded';
  const healthColor = stats.totalChurches === 0 ? 'bg-slate-100 text-slate-600' : healthPct >= 90 ? 'bg-emerald-50 text-emerald-800' : healthPct >= 70 ? 'bg-amber-50 text-amber-900' : 'bg-rose-50 text-rose-800';
  const formatRevenue = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', notation: 'compact', maximumFractionDigits: 1 });
  const healthSub = `${stats.activeChurches} of ${stats.totalChurches} client workspaces active`;

  const cards = [
    { label: 'Client workspaces', value: stats.totalChurches.toLocaleString('en-KE'), sub: `${stats.activeChurches.toLocaleString('en-KE')} active`, icon: Building2 },
    { label: 'Members', value: stats.totalMembers.toLocaleString('en-KE'), sub: 'Across configured workspaces', icon: Users },
    { label: 'Recorded income', value: formatRevenue.format(stats.totalRevenue), sub: 'All-time church income', icon: TrendingUp },
    { label: 'Platform health', value: healthLabel, sub: healthSub, icon: Activity, status: true },
  ];

  return (
    <div className="space-y-7 pb-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Platform overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Monitor configured client workspaces and platform-wide activity.</p>
        </div>
        {onOpenClient && <button type="button" onClick={onOpenClient} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"><Building2 size={16} aria-hidden="true" />Open client workspace</button>}
      </header>
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><strong>Platform data unavailable.</strong> {error}</div>}

      <section aria-label="Platform key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <article key={card.label} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-50 text-brand-primary"><card.icon size={16} aria-hidden="true" /></span>
            </div>
            {loading
              ? <div className="mt-4 h-8 w-2/3 animate-pulse rounded-md bg-slate-100" aria-label={`Loading ${card.label}`} />
              : <p className={`mt-4 truncate font-semibold tracking-tight tabular-nums ${card.status ? `inline-flex max-w-full rounded-md px-2.5 py-1 text-sm ${healthColor}` : 'text-2xl text-slate-950'}`}>{card.value}</p>}
            <p className="mt-3 text-xs leading-5 text-slate-500">{card.sub}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="platform-actions-title">
        <h2 id="platform-actions-title" className="text-base font-semibold text-slate-900">Platform administration</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Use the navigation to manage client access, billing, integrations, releases, and audit activity.</p>
        {stats.totalChurches === 0 && !loading && <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">No client workspaces are configured yet. Add a workspace from Client Workspace to begin.</p>}
      </section>
    </div>
  );
};

export default PlatformDashboard;
