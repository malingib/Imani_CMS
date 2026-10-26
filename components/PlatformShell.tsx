import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Building2, ChevronRight, Globe, LogOut, Network, RefreshCw, ShieldCheck } from 'lucide-react';
import PlatformDashboard from './PlatformDashboard';
import TenantRegistry from './TenantRegistry';
import PlatformControls from './PlatformControls';
import { ImaniLogoIcon } from './Sidebar';

type Props = {
  onOpenClient: () => void;
  onSelectClient: (id: string) => void;
  onLogout: () => void;
};

const PlatformShell: React.FC<Props> = ({ onOpenClient, onSelectClient, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isTenants = location.pathname.startsWith('/tenants');
  const isBilling = location.pathname.startsWith('/platform/billing');
  const isRestrictions = location.pathname.startsWith('/platform/restrictions');
  const isSuspensions = location.pathname.startsWith('/platform/suspensions');
  const isUpdates = location.pathname.startsWith('/platform/updates');
  const isActivity = location.pathname.startsWith('/platform/activity');
  const isControls = isBilling || isRestrictions || isSuspensions || isUpdates || isActivity;
  const items = [
    { label: 'Overview', path: '/platform', icon: Activity, active: !isTenants && !isControls },
    { label: 'Billing & Plans', path: '/platform/billing', icon: Building2, active: isBilling },
    { label: 'Restrictions', path: '/platform/restrictions', icon: ShieldCheck, active: isRestrictions },
    { label: 'Suspensions', path: '/platform/suspensions', icon: Network, active: isSuspensions },
    { label: 'Updates & Releases', path: '/platform/updates', icon: RefreshCw, active: isUpdates },
    { label: 'Audit & Activity', path: '/platform/activity', icon: Activity, active: isActivity },
    { label: 'Client Workspace', path: '/tenants', icon: Globe, active: isTenants },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
          <div className="h-11 w-11"><ImaniLogoIcon /></div>
          <div><p className="text-base font-black uppercase tracking-tight text-brand-primary">Imani CMS</p><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform Control</p></div>
        </div>
        <div className="mx-5 mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-indigo-800"><ShieldCheck size={17} /><span className="text-xs font-black uppercase tracking-wide">Superadmin access</span></div>
          <p className="mt-2 text-xs leading-5 text-indigo-700">Platform-level controls are separate from church operations.</p>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Platform navigation">
          {items.map(item => {
            const Icon = item.icon;
            return <button key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${item.active ? 'bg-brand-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={18} /><span className="flex-1">{item.label}</span><ChevronRight size={15} /></button>;
          })}
        </nav>
        <div className="border-t border-slate-100 p-5">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-primary"><Globe size={18} /></div><div><p className="text-xs font-bold">Platform administrator</p><p className="mt-1 text-[10px] text-slate-500">Superadmin session</p></div></div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700"><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      {mobileMenuOpen && <button aria-label="Close platform menu" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold lg:hidden" onClick={() => setMobileMenuOpen(v => !v)}>Menu</button><div><p className="text-sm font-black">Platform administration</p><p className="text-xs text-slate-500">Independent from the church dashboard</p></div></div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-slate-600">Superadmin</span></div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 sm:p-5 lg:p-6">
          {isTenants
            ? <TenantRegistry onImpersonate={onSelectClient} />
            : isControls
              ? <PlatformControls />
              : <PlatformDashboard onOpenClient={onOpenClient} />}
        </div>
      </main>
    </div>
  );
};

export default PlatformShell;
