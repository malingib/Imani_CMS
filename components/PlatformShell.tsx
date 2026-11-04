import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Building2, Globe, LogOut, Network, RefreshCw, ShieldCheck, PlugZap } from 'lucide-react';
import PlatformDashboard from './PlatformDashboard';
import TenantRegistry from './TenantRegistry';
import PlatformControls from './PlatformControls';
import IntegrationSettingsPanel from './IntegrationSettingsPanel';
import { ImaniLogoIcon } from './Sidebar';

type Props = {
  onOpenClient: () => void;
  onSelectClient: (id: string) => void;
  onLogout: () => void;
  administratorName?: string;
};

const PlatformShell: React.FC<Props> = ({ onOpenClient, onSelectClient, onLogout, administratorName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isTenants = location.pathname.startsWith('/tenants');
  const isBilling = location.pathname.startsWith('/platform/billing');
  const isRestrictions = location.pathname.startsWith('/platform/restrictions');
  const isSuspensions = location.pathname.startsWith('/platform/suspensions');
  const isUpdates = location.pathname.startsWith('/platform/updates');
  const isActivity = location.pathname.startsWith('/platform/activity');
  const isIntegrations = location.pathname.startsWith('/platform/integrations');
  const isControls = isBilling || isRestrictions || isSuspensions || isUpdates || isActivity;
  const items = [
    { label: 'Overview', path: '/platform', icon: Activity, active: !isTenants && !isControls && !isIntegrations },
    { label: 'Billing & Plans', path: '/platform/billing', icon: Building2, active: isBilling },
    { label: 'Restrictions', path: '/platform/restrictions', icon: ShieldCheck, active: isRestrictions },
    { label: 'Suspensions', path: '/platform/suspensions', icon: Network, active: isSuspensions },
    { label: 'Updates & Releases', path: '/platform/updates', icon: RefreshCw, active: isUpdates },
    { label: 'Audit & Activity', path: '/platform/activity', icon: Activity, active: isActivity },
    { label: 'Integrations', path: '/platform/integrations', icon: PlugZap, active: isIntegrations },
    { label: 'Client Workspace', path: '/tenants', icon: Globe, active: isTenants },
  ];

  return (
    <div className="imani-platform min-h-screen bg-slate-50 text-slate-800">
      <aside id="platform-navigation" className={`imani-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <div className="h-9 w-9"><ImaniLogoIcon /></div>
          <div><p className="text-sm font-semibold tracking-tight text-slate-900">Imani CMS</p><p className="mt-0.5 text-xs text-slate-500">Platform administration</p></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Platform navigation">
          {items.map(item => {
            const Icon = item.icon;
            return <button key={item.path} type="button" aria-current={item.active ? 'page' : undefined} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${item.active ? 'bg-slate-100 font-semibold text-slate-950' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}><Icon size={17} className={item.active ? 'text-brand-primary' : 'text-slate-400'} /><span className="flex-1">{item.label}</span></button>;
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary"><Globe size={17} /></div><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-900">{administratorName || 'Platform administrator'}</p><p className="mt-1 text-xs text-slate-500">Superadmin</p></div></div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700"><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      {mobileMenuOpen && <button aria-label="Close platform menu" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3"><button type="button" aria-expanded={mobileMenuOpen} aria-controls="platform-navigation" aria-label={mobileMenuOpen ? 'Close platform navigation' : 'Open platform navigation'} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold lg:hidden" onClick={() => setMobileMenuOpen(v => !v)}>Menu</button><div><p className="text-sm font-semibold text-slate-900">Platform overview</p><p className="text-xs text-slate-500">Manage client workspaces and services</p></div></div>
          <span className="hidden text-xs font-medium text-slate-500 sm:block">Signed in as platform owner</span>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 sm:p-5 lg:p-6">
          {isTenants
            ? <TenantRegistry onImpersonate={onSelectClient} />
            : isIntegrations
              ? <IntegrationSettingsPanel scope="platform" role="SUPER_ADMIN" />
            : isControls
              ? <PlatformControls />
              : <PlatformDashboard onOpenClient={onOpenClient} />}
        </div>
      </main>
    </div>
  );
};

export default PlatformShell;
