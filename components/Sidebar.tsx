
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
  ChevronUp
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
    { id: 'MEMBERS', label: 'Membership', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'FINANCE', label: 'Finance', icon: Wallet, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'GROUPS', label: 'Groups', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'EVENTS', label: 'Events', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY, UserRole.MEMBER] },
    { id: 'COMMUNICATION', label: 'Communication', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'SERMONS', label: 'Ministry Word', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.MEMBER] },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TREASURER] },
  ];

  const memberItems = [
    { id: 'MY_PORTAL', label: 'My Dashboard', icon: Sparkles, roles: [UserRole.MEMBER] },
    { id: 'SERMONS', label: 'Sermon Library', icon: BookOpen, roles: [UserRole.MEMBER] },
    { id: 'EVENTS', label: 'Church Calendar', icon: CalendarDays, roles: [UserRole.MEMBER] },
    { id: 'MY_GIVING', label: 'My Giving', icon: Wallet, roles: [UserRole.MEMBER] },
  ];

  const menuItems = currentUser.role === UserRole.MEMBER ? memberItems : adminItems;
  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className={`
      w-64 h-screen bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-100 shadow-sm z-[70] transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xl">I</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">Imani CMS</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Enterprise Edition</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SaaS Branch Switcher */}
        {currentUser.role !== UserRole.MEMBER && (
          <div className="mb-6 relative">
            <button 
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm"><Building2 size={16}/></div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Branch</p>
                  <p className="text-xs font-bold text-slate-700 truncate w-24">{currentUser.branch || branches[0]}</p>
                </div>
              </div>
              {isBranchMenuOpen ? <ChevronUp size={14} className="text-indigo-600" /> : <ChevronDown size={14} className="text-slate-300 group-hover:text-indigo-600" />}
            </button>

            {isBranchMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      onBranchChange(branch);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors border-b last:border-0 border-slate-50 ${
                      currentUser.branch === branch ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
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
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="px-4 py-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Simulate Role</p>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold py-1.5 px-2 outline-none appearance-none cursor-pointer"
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
            currentView === 'SETTINGS' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon size={20} className={currentView === 'SETTINGS' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} />
          <span className="text-sm">Global Settings</span>
        </button>
        
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
          <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{currentUser.role}</p>
          </div>
          <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
