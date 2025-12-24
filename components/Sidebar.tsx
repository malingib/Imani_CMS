
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
  ChevronUp,
  Globe
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
    {/* Circle Backdrop */}
    <circle cx="100" cy="100" r="80" fill="#1E293B" />
    <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="6" opacity="0.9" />
    
    {/* Church Structure */}
    <path d="M60 140 V100 L100 70 L140 100 V140 H60Z" fill="white" opacity="0.9" />
    <path d="M45 140 V115 L60 100 V140 H45Z" fill="white" opacity="0.6" />
    <path d="M140 100 L155 115 V140 H140 V100Z" fill="white" opacity="0.6" />
    
    {/* Arched Door */}
    <path d="M85 140 V115 C85 105 115 105 115 115 V140 H85Z" fill="#FFB800" />
    
    {/* Cross */}
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

  const adminItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER] },
    { id: 'MEMBERS', label: 'Membership', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.MEMBER] },
    { id: 'FINANCE', label: 'Finance', icon: Wallet, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'GROUPS', label: 'Groups', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'EVENTS', label: 'Events', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.MEMBER] },
    { id: 'COMMUNICATION', label: 'Outreach', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'SERMONS', label: 'Ministry Word', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.MEMBER] },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TREASURER] },
  ];

  const memberItems = [
    { id: 'MY_PORTAL', label: 'My Sanctuary', icon: Sparkles, roles: [UserRole.MEMBER] },
    { id: 'MEMBERS', label: 'Directory', icon: Users, roles: [UserRole.MEMBER] },
    { id: 'SERMONS', label: 'Word Library', icon: BookOpen, roles: [UserRole.MEMBER] },
    { id: 'EVENTS', label: 'Church Life', icon: CalendarDays, roles: [UserRole.MEMBER] },
    { id: 'MY_GIVING', label: 'My Giving', icon: Wallet, roles: [UserRole.MEMBER] },
  ];

  const menuItems = currentUser.role === UserRole.MEMBER ? memberItems : adminItems;
  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className={`
      w-64 h-full bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-100 shadow-2xl lg:shadow-sm z-[70] transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">
              <ImaniLogoIcon />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-brand-primary truncate uppercase">Imani CMS</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Official Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-brand-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {currentUser.role !== UserRole.MEMBER && (
          <div className="mb-6 relative">
            <button 
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl group hover:border-brand-primary transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 bg-white rounded-lg text-brand-primary shadow-sm flex-shrink-0"><Building2 size={14}/></div>
                <div className="text-left min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Branch</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{currentUser.branch || branches[0]}</p>
                </div>
              </div>
              {isBranchMenuOpen ? <ChevronUp size={12} className="text-brand-primary" /> : <ChevronDown size={12} className="text-slate-300" />}
            </button>

            {isBranchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      onBranchChange(branch);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[10px] sm:text-xs font-bold transition-colors border-b last:border-0 border-slate-50 ${
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
      </div>
      
      <nav className="flex-1 px-4 space-y-0.5 sm:space-y-1 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-100 text-brand-primary font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'} />
              <span className="text-xs sm:text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="px-2 sm:px-4 py-1.5 sm:py-2">
          <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Simulation</p>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[9px] sm:text-[10px] font-bold py-1.5 px-2 outline-none appearance-none cursor-pointer focus:border-brand-primary"
            value={currentUser.role}
            onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
          >
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setView('SETTINGS')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            currentView === 'SETTINGS' ? 'bg-slate-100 text-brand-primary font-bold' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon size={18} className={currentView === 'SETTINGS' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'} />
          <span className="text-xs sm:text-sm">Global Settings</span>
        </button>
        
        <div className="mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center gap-2 sm:gap-3 mb-4">
          <img src={currentUser.avatar} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-black tracking-tighter truncate">{currentUser.role}</p>
          </div>
          <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-colors p-1 flex-shrink-0"><LogOut size={16} /></button>
        </div>

        <div className="text-center py-2 border-t border-slate-50">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Globe size={8} /> Powered by <span className="text-brand-primary opacity-60">Mobiwave Innovations</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
