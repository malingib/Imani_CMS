import React, { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarDays, Settings as SettingsIcon,
  LogOut, Layers, MessageSquare, BarChart3, PieChart, X,
  Building2, ChevronDown, ShieldCheck, CreditCard, Receipt, Globe, Network
} from 'lucide-react';
import { AppView, User, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser: User;
  branches: string[];
  onBranchChange: (branch: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  // Kept as optional compatibility props for older callers; church switching is disabled.
  churches?: { id: string; name: string }[];
  activeChurchId?: string | null;
  onChurchSwitch?: (id: string | null) => void;
}

export const ImaniLogoIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#1E293B" />
    <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="6" opacity="0.9" />
    <path d="M60 140 V100 L100 70 L140 100 V140 H60Z" fill="white" opacity="0.9" />
    <path d="M85 140 V115 C85 105 115 105 115 115 V140 H85Z" fill="#FFB800" />
    <rect x="96" y="30" width="8" height="35" rx="2" fill="#FFB800" />
    <rect x="85" y="40" width="30" height="8" rx="2" fill="#FFB800" />
  </svg>
);

const adminItems = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN, UserRole.TREASURER, UserRole.SECRETARY] },
  { id: 'MEMBERS', label: 'Congregation', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
  { id: 'FINANCE', label: 'Finance Hub', icon: Receipt, roles: [UserRole.ADMIN, UserRole.TREASURER, UserRole.SUPER_ADMIN] },
  { id: 'EVENTS', label: 'Calendar', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
  { id: 'COMMUNICATION', label: 'Outreach', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
  { id: 'GROUPS', label: 'Departments', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
  { id: 'REPORTS', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN, UserRole.TREASURER] },
  { id: 'ANALYTICS', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
  { id: 'AUDIT_LOGS', label: 'System Audit', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: 'BILLING', label: 'Subscription', icon: CreditCard, roles: [UserRole.ADMIN] },
  { id: 'PLATFORM_DASHBOARD', label: 'Superadmin Dashboard', icon: Globe, roles: [UserRole.SUPER_ADMIN] },
  { id: 'TENANTS', label: 'Client Workspace', icon: Network, roles: [UserRole.SUPER_ADMIN] },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView, setView, currentUser, branches, onBranchChange, onLogout, isOpen, onClose,
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const filteredItems = adminItems.filter(item => item.roles.includes(currentUser.role));
  const navSections = [
    { label: 'Workspace', ids: ['DASHBOARD'] },
    { label: 'Church operations', ids: ['MEMBERS', 'GROUPS', 'EVENTS', 'COMMUNICATION'] },
    { label: 'Finance & insights', ids: ['FINANCE', 'REPORTS', 'ANALYTICS'] },
    { label: 'Administration', ids: ['AUDIT_LOGS', 'BILLING', 'PLATFORM_DASHBOARD', 'TENANTS'] },
  ].map(section => ({ ...section, items: filteredItems.filter(item => section.ids.includes(item.id)) })).filter(section => section.items.length > 0);

  return (
    <aside className={`imani-sidebar
      w-64 h-full bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-200 z-[70] transition-transform duration-200 ease-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10"><ImaniLogoIcon /></div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900">Imani CMS</h1>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Church Management</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400" aria-label="Close navigation"><X size={20} /></button>
        </div>

        {currentUser.role !== UserRole.MEMBER && branches.length > 1 && (
          <div className="mb-2 relative">
            <button
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 group hover:border-slate-400 transition-colors"
              aria-expanded={isBranchMenuOpen}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 size={16} className="text-brand-primary" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-medium text-slate-500 leading-none mb-1">Branch</p>
                  <p className="text-xs font-medium text-slate-800 truncate">{currentUser.branch || branches[0]}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBranchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-sm z-50 overflow-hidden">
                {branches.map(branch => (
                  <button key={branch} onClick={() => { onBranchChange(branch); setIsBranchMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-0 border-slate-50 ${currentUser.branch === branch ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {branch}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 no-scrollbar" aria-label="Main navigation">
        {navSections.map(section => (
          <section key={section.label} aria-label={section.label} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold text-slate-400">{section.label}</p>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as AppView)}
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? "group flex w-full items-center gap-3 rounded-lg bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-950 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" : "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700"} />
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-slate-700" aria-hidden="true" />}
                </button>
              );
            })}
          </section>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-2">
        {currentUser.role !== UserRole.MEMBER && (
          <button onClick={() => setView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${currentView === 'SETTINGS' ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <SettingsIcon size={18} className={currentView === 'SETTINGS' ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
            <span className="text-sm">Church Settings</span>
          </button>
        )}

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">{currentUser.name}</p>
            <p className="truncate text-[10px] text-slate-500">{currentUser.role}</p>
          </div>
          <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Logout"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
