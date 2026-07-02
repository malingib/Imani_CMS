import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CalendarDays, 
  Settings as SettingsIcon,
  LogOut,
  Layers,
  MessageSquare,
  BarChart3,
  PieChart,
  BookOpen,
  X,
  Sparkles,
  Building2,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Globe,
  Receipt,
  Activity,
  Mail,
  DollarSign
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

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  currentUser, 
  branches,
  onBranchChange,
  onLogout,
  isOpen,
  onClose,
  churches,
  activeChurchId,
  onChurchSwitch,
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isChurchMenuOpen, setIsChurchMenuOpen] = useState(false);

  const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

  const platformItems = [
    { id: 'PLATFORM_DASHBOARD', label: 'Platform Overview', icon: Activity },
    { id: 'TENANTS', label: 'Tenants', icon: Building2 },
    { id: 'INVITATIONS', label: 'Invitations', icon: Mail },
    { id: 'BILLING', label: 'Billing', icon: DollarSign },
    { id: 'PLATFORM_SETTINGS', label: 'Platform Settings', icon: Globe },
  ];

  const adminItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { id: 'MEMBERS', label: 'Congregation', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { id: 'FINANCE', label: 'Finance Hub', icon: Receipt, roles: [UserRole.ADMIN, UserRole.TREASURER, UserRole.SUPER_ADMIN] },
    { id: 'EVENTS', label: 'Calendar', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { id: 'COMMUNICATION', label: 'Outreach', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.SUPER_ADMIN] },
    { id: 'GROUPS', label: 'Departments', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { id: 'SERMONS', label: 'Sermon Archive', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SUPER_ADMIN] },
    { id: 'AUDIT_LOGS', label: 'System Audit', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'BILLING', label: 'Subscription', icon: CreditCard, roles: [UserRole.ADMIN] },
  ];

  const memberItems = [
    { id: 'MY_PORTAL', label: 'My Sanctuary', icon: Sparkles, roles: [UserRole.MEMBER] },
    { id: 'SERMONS', label: 'Sermon Archive', icon: BookOpen, roles: [UserRole.MEMBER] },
    { id: 'MY_GIVING', label: 'Stewardship', icon: Wallet, roles: [UserRole.MEMBER] },
  ];

  const menuItems = currentUser.role === UserRole.MEMBER ? memberItems : adminItems;
  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));
  const activeChurch = churches?.find(c => c.id === activeChurchId);

  return (
    <aside className={`
      w-64 h-full bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-100 shadow-2xl lg:shadow-sm z-[70] transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <ImaniLogoIcon />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-brand-primary uppercase">Imani CMS</h1>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Enterprise SaaS</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
        </div>

        {isSuperAdmin && churches && (
          <div className="mb-6 relative">
            <button 
              onClick={() => setIsChurchMenuOpen(!isChurchMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-brand-indigo/5 border border-brand-indigo/20 rounded-2xl group hover:border-brand-indigo transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 size={16} className="text-brand-indigo"/>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Viewing Church</p>
                  <p className="text-xs font-bold text-brand-indigo truncate">{activeChurch?.name || 'All Churches'}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${isChurchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isChurchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { onChurchSwitch?.(null); setIsChurchMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold border-b border-slate-50 ${!activeChurchId ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                  All Churches (Platform View)
                </button>
                {churches.map(church => (
                  <button key={church.id} onClick={() => { onChurchSwitch?.(church.id); setIsChurchMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-0 border-slate-50 ${activeChurchId === church.id ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {church.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isSuperAdmin && currentUser.role !== UserRole.MEMBER && (
          <div className="mb-6 relative">
            <button 
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-brand-primary transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 size={16} className="text-brand-primary"/>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Parish</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{currentUser.branch || branches[0]}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBranchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {branches.map((branch) => (
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
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {isSuperAdmin && !activeChurchId && (
          <>
            <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform</p>
            {platformItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id as AppView)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive ? 'bg-brand-indigo/10 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'
                  }`}>
                  <Icon size={18} className={isActive ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
            <div className="my-3 mx-4 border-t border-slate-100" />
          </>
        )}

        {isSuperAdmin && activeChurchId && (
          <div className="px-4 py-2 mb-1">
            <button onClick={() => onChurchSwitch?.(null)} className="text-[10px] font-bold text-brand-indigo hover:underline flex items-center gap-1">
              ← Back to Platform
            </button>
          </div>
        )}

        {isSuperAdmin && activeChurchId && (
          <p className="px-4 pt-1 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{activeChurch?.name || 'Church'}</p>
        )}

        {!isSuperAdmin && (
          <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Navigation</p>
        )}

        {!(isSuperAdmin && !activeChurchId) && filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              <Icon size={18} className={isActive ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        { !isSuperAdmin && currentUser.role !== UserRole.MEMBER && (
          <button onClick={() => setView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${currentView === 'SETTINGS' ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <SettingsIcon size={18} className={currentView === 'SETTINGS' ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
            <span className="text-sm">Church Settings</span>
          </button>
        )}
        
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 flex items-center gap-3 border border-slate-100/50">
          <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter truncate">{currentUser.role}</p>
          </div>
          <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Logout"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
