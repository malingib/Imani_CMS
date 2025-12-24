
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CalendarDays, 
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Layers,
  MessageSquare,
  BarChart3,
  UserCircle,
  PieChart,
  BookOpen
} from 'lucide-react';
import { AppView, User, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onRoleSwitch }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER] },
    { id: 'MEMBERS', label: 'Membership', icon: Users, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'FINANCE', label: 'Finance', icon: Wallet, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'ANALYTICS', label: 'Analytics', icon: PieChart, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'GROUPS', label: 'Groups', icon: Layers, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'EVENTS', label: 'Events', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'COMMUNICATION', label: 'Communication', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.PASTOR, UserRole.SECRETARY] },
    { id: 'SERMONS', label: 'Sermons', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.PASTOR] },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TREASURER] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 h-screen bg-white text-slate-600 fixed left-0 top-0 flex flex-col border-r border-slate-100 shadow-sm z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg">
          <span className="font-black text-xl">C</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">ChurchCMS</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Admin Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto mt-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Switch Role (Demo)</p>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold py-1 px-2 outline-none"
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
            currentView === 'SETTINGS' 
              ? 'bg-indigo-50 text-indigo-700 font-bold' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
          }`}
        >
          <SettingsIcon size={20} className={currentView === 'SETTINGS' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} />
          <span className="text-sm">Settings</span>
        </button>
        
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{currentUser.role}</p>
          </div>
          <button className="text-slate-300 hover:text-rose-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
