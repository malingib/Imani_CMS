
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
  Server,
  HelpCircle,
  Network
} from 'lucide-react';
import { AppView, User, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser: User;
  branches: string[];
  onBranchChange: (branch: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
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
  onRoleSwitch, 
  onLogout,
  isOpen,
  onClose 
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  // OWNER-SPECIFIC NAVIGATION (Enterprise Grade)
  const ownerItems = [
    { id: 'OWNER_DASHBOARD', label: 'Platform Hub', icon: Globe },
    { id: 'PARISH_REGISTRY', label: 'Tenant Registry', icon: Network },
    { id: 'FINANCE', label: 'Global Revenue', icon: Receipt },
    { id: 'INFRASTRUCTURE', label: 'Nodes & Health', icon: Server },
    { id: 'PLATFORM_SUPPORT', label: 'Support Desk', icon: HelpCircle },
    { id: 'AUDIT_LOGS', label: 'System Audit', icon: ShieldCheck },
  ];

  // ADMIN/PASTOR NAVIGATION (Church Grade)
  const adminItems = [
    { id: 'DASHBOARD', label: 'Command Center', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'MEMBERS', label: 'Congregation', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'FINANCE', label: 'Church Treasury', icon: Receipt, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'EVENTS', label: 'Church Life', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'COMMUNICATION', label: 'Outreach', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'GROUPS', label: 'Departments', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'ANALYTICS', label: 'Intelligence', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'SERMONS', label: 'Word Archive', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'BILLING', label: 'Subscription', icon: CreditCard, roles: [UserRole.ADMIN] },
  ];

  const memberItems = [
    { id: 'MY_PORTAL', label: 'My Sanctuary', icon: Sparkles, roles: [UserRole.MEMBER] },
    { id: 'SERMONS', label: 'Sermon Archive', icon: BookOpen, roles: [UserRole.MEMBER] },
    { id: 'MY_GIVING', label: 'Stewardship', icon: Wallet, roles: [UserRole.MEMBER] },
  ];

  const getFilteredItems = () => {
    if (currentUser.role === UserRole.SYSTEM_OWNER) return ownerItems;
    if (currentUser.role === UserRole.MEMBER) return memberItems;
    return adminItems.filter(item => item.roles.includes(currentUser.role));
  };

  const filteredItems = getFilteredItems();

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
              <h1 className="text-lg font-black tracking-tight text-brand-primary uppercase leading-none">Imani CMS</h1>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1">Enterprise SaaS</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
        </div>

        {currentUser.role !== UserRole.MEMBER && currentUser.role !== UserRole.SYSTEM_OWNER && (
          <div className="mb-6 relative">
            <button 
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-brand-primary transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 size={16} className="text-brand-primary"/>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Instance</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{currentUser.branch || branches[0]}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBranchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => { onBranchChange(branch); setIsBranchMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-0 border-slate-50 ${
                      currentUser.branch === branch ? 'bg-slate-100 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentUser.role === UserRole.SYSTEM_OWNER && (
          <div className="mb-6 p-4 bg-brand-primary text-white rounded-2xl shadow-lg relative overflow-hidden ring-4 ring-indigo-50 border border-indigo-100">
             <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-gold mb-1">Global Owner</p>
                <p className="text-xs font-black">Mobiwave Portal</p>
             </div>
             <Globe size={48} className="absolute -right-4 -bottom-4 text-white/5" />
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-4 py-2">
           <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.3em] mb-4">Navigation Hub</p>
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="px-4 py-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Simulate Role</p>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold py-2 px-3 outline-none appearance-none cursor-pointer focus:border-brand-indigo transition-all"
              value={currentUser.role}
              onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <ChevronDown size={10} />
            </div>
          </div>
        </div>

        {currentUser.role !== UserRole.MEMBER && (
          <button 
            onClick={() => setView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${currentView === 'SETTINGS' ? 'bg-brand-primary/5 text-brand-indigo font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <SettingsIcon size={18} className={currentView === 'SETTINGS' ? 'text-brand-indigo' : 'text-slate-400 group-hover:text-brand-indigo'} />
            <span className="text-sm">{currentUser.role === UserRole.SYSTEM_OWNER ? 'Global Config' : 'Parish Settings'}</span>
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
