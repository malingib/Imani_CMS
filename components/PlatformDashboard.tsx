import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createPlatformDashboardService, type PlatformDashboardStats } from '../src/lib/platform-dashboard-service';
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const platformDashboardService = createPlatformDashboardService(supabase);

const PlatformDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformDashboardStats>({
    totalChurches: 0, activeChurches: 0, totalMembers: 0, totalRevenue: 0,
    totalChurchesChange: 0, totalMembersChange: 0, totalRevenueChange: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      const nextStats = await platformDashboardService.getStats();
      setStats(nextStats);
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Total Churches', value: stats.totalChurches, sub: `${stats.activeChurches} active`, icon: Building2, color: 'bg-brand-indigo' },
    { label: 'Total Members', value: stats.totalMembers, sub: 'across all churches', icon: Users, color: 'bg-brand-primary' },
    { label: 'Total Revenue', value: `KES ${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: 'all time', icon: TrendingUp, color: 'bg-brand-emerald' },
    { label: 'System Health', value: 'Good', sub: 'all systems operational', icon: Activity, color: 'bg-brand-gold' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight">Platform Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Overview of all churches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{card.value}</p>
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
          <p className="text-amber-700 text-xs font-bold mt-1">Use the Tenants section to manage individual churches, or drill into their data via the church switcher.</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
