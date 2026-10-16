import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertCircle } from 'lucide-react';

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

  const healthPct = stats.totalChurches > 0 ? (stats.activeChurches / stats.totalChurches) * 100 : 100;
  const healthLabel = healthPct >= 90 ? 'Good' : healthPct >= 70 ? 'Fair' : 'Degraded';
  const healthColor = healthPct >= 90 ? 'bg-brand-emerald' : healthPct >= 70 ? 'bg-brand-gold' : 'bg-rose-500';
  const healthSub = `${stats.activeChurches}/${stats.totalChurches} churches active`;

  const cards = [
    { label: 'Configured Clients', value: stats.totalChurches, sub: `${stats.activeChurches} active`, icon: Building2, color: 'bg-brand-indigo' },
    { label: 'Total Members', value: stats.totalMembers, sub: 'across all churches', icon: Users, color: 'bg-brand-primary' },
    { label: 'Church Income', value: `KES ${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: 'recorded giving and income · all time', icon: TrendingUp, color: 'bg-brand-emerald' },
    { label: 'System Health', value: healthLabel, sub: healthSub, icon: Activity, color: healthColor },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight">Superadmin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Platform controls and the configured Demo Church workspace</p>
        </div>
        {onOpenClient && <button onClick={onOpenClient} className="px-5 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90">Open client workspace</button>}
      </div>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><strong>Dashboard data unavailable:</strong> {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{loading ? '…' : card.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-bold text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
        <AlertCircle size={24} className="text-amber-600 shrink-0" />
        <div>
          <p className="font-black text-amber-800 text-sm">Platform Overview</p>
          <p className="text-amber-700 text-xs font-bold mt-1">Use Billing & Plans, Restrictions, Suspensions, and Updates in the platform navigation to administer Demo Church independently from church operations.</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
