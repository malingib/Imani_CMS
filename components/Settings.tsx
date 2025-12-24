
import React, { useState } from 'react';
import { 
  Users, Wallet, Calendar, Plus, Trash2, 
  ChevronRight, Shield, UserPlus, Info, 
  CheckCircle2, Lock, LayoutGrid, ToggleLeft, ToggleRight
} from 'lucide-react';
import { SystemRole } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MANAGE' | 'ASSIGN'>('MANAGE');
  const [selectedRoleId, setSelectedRoleId] = useState('role-1');

  const [roles, setRoles] = useState<SystemRole[]>([
    {
      id: 'role-1',
      name: 'Finance Team',
      memberCount: 3,
      description: 'Members with this role can manage financial records, process tithes, and view budgets. They cannot modify system settings.',
      custom: true,
      modules: [
        {
          id: 'finance',
          label: 'Finance & Giving',
          enabled: true,
          permissions: [
            { id: 'view-giving', label: 'View Giving Records', enabled: true },
            { id: 'mpesa-recon', label: 'M-Pesa Reconciliation', enabled: true, critical: true },
            { id: 'export-finance', label: 'Export Financial Reports', enabled: false },
          ]
        },
        {
          id: 'people',
          label: 'People & Membership',
          enabled: false,
          permissions: []
        },
        {
          id: 'events',
          label: 'Events & Check-in',
          enabled: false,
          permissions: []
        }
      ]
    },
    { id: 'role-2', name: 'Administrator', memberCount: 2, description: 'Full access to all system modules and settings.', modules: [] },
    { id: 'role-3', name: 'Ministry Leaders', memberCount: 12, description: 'Access to groups and attendance tracking for their respective ministries.', modules: [] },
    { id: 'role-4', name: 'Ushers', memberCount: 24, description: 'Basic access to check-in systems on service days.', modules: [] },
  ]);

  const activeRole = roles.find(r => r.id === selectedRoleId);

  const toggleModule = (roleId: string, moduleId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) return role;
      return {
        ...role,
        modules: role.modules.map(mod => mod.id === moduleId ? { ...mod, enabled: !mod.enabled } : mod)
      };
    }));
  };

  const togglePermission = (roleId: string, moduleId: string, permId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) return role;
      return {
        ...role,
        modules: role.modules.map(mod => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            permissions: mod.permissions.map(p => p.id === permId ? { ...p, enabled: !p.enabled } : p)
          };
        })
      };
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <span>Settings</span>
        <ChevronRight size={14} />
        <span>Users</span>
        <ChevronRight size={14} />
        <span className="text-slate-800">Roles & Permissions</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Roles & Permissions</h2>
          <p className="text-slate-500 mt-1 font-medium">Define access levels and assign roles to church staff and volunteers.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md">
          <Plus size={20} /> Add New Role
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button 
          onClick={() => setActiveTab('MANAGE')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 px-2 ${activeTab === 'MANAGE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Shield size={18} /> Manage Roles
        </button>
        <button 
          onClick={() => setActiveTab('ASSIGN')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 px-2 ${activeTab === 'ASSIGN' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <UserPlus size={18} /> Assign Users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Role List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Roles</span>
          </div>
          <div className="flex-1">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left p-5 border-l-4 transition-all flex items-center justify-between ${selectedRoleId === role.id ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div>
                  <h4 className={`font-bold text-sm ${selectedRoleId === role.id ? 'text-indigo-600' : 'text-slate-700'}`}>{role.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{role.memberCount} Members</p>
                </div>
                {selectedRoleId === role.id && <ChevronRight size={16} className="text-indigo-400" />}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-2 w-full justify-center py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors uppercase tracking-widest text-[11px]">
              <Trash2 size={16} /> Delete Role
            </button>
          </div>
        </div>

        {/* Right Content: Role Permissions */}
        {activeRole ? (
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-800">{activeRole.name}</h3>
              {activeRole.custom && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">Custom Role</span>
              )}
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              {activeRole.description}
            </p>

            {/* Modules */}
            <div className="space-y-4">
              {activeRole.modules.map(module => (
                <div key={module.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Module Header */}
                  <div className="p-5 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${module.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                        {module.id === 'finance' ? <Wallet size={20}/> : module.id === 'people' ? <Users size={20}/> : <Calendar size={20}/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{module.label}</h4>
                        <p className="text-xs text-slate-400 font-medium">Controls access to {module.label.toLowerCase()} records.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-500">Enable Module</span>
                      <button 
                        onClick={() => toggleModule(activeRole.id, module.id)}
                        className={`transition-all ${module.enabled ? 'text-indigo-600' : 'text-slate-300'}`}
                      >
                        {module.enabled ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                      </button>
                    </div>
                  </div>

                  {/* Sub-permissions */}
                  {module.enabled && module.permissions.length > 0 && (
                    <div className="divide-y divide-slate-50">
                      {module.permissions.map(perm => (
                        <div key={perm.id} className="p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">{perm.label}</span>
                              {perm.critical && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded uppercase tracking-widest border border-rose-100">Critical</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Allows viewing of individual {perm.label.toLowerCase()}.</p>
                          </div>
                          <button 
                            onClick={() => togglePermission(activeRole.id, module.id, perm.id)}
                            className={`transition-all ${perm.enabled ? 'text-indigo-600' : 'text-slate-300'}`}
                          >
                            {perm.enabled ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Disabled Mock Modules for Visual consistency with image */}
              {!activeRole.modules.find(m => m.id === 'people') && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Users size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-800">People & Membership</h4>
                      <p className="text-xs text-slate-400 font-medium">Controls access to member database and profiles.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400">Enable Module</span>
                    <ToggleLeft size={32} className="text-slate-200"/>
                  </div>
                </div>
              )}
              {!activeRole.modules.find(m => m.id === 'events') && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Calendar size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Events & Check-in</h4>
                      <p className="text-xs text-slate-400 font-medium">Controls calendar management and child check-in systems.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400">Enable Module</span>
                    <ToggleLeft size={32} className="text-slate-200"/>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-slate-200">
              <button className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                Cancel Changes
              </button>
              <button className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md">
                <CheckCircle2 size={18} /> Save Role
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center py-20 text-slate-300">
            <Shield size={64} className="mb-4 opacity-20" />
            <p className="font-bold">Select a role to manage permissions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
