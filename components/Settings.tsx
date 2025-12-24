
import React, { useState } from 'react';
import { 
  Users, Wallet, Calendar, Plus, Trash2, 
  ChevronRight, Shield, UserPlus, Info, 
  CheckCircle2, Lock, LayoutGrid, ToggleLeft, ToggleRight,
  Home, Bell, Globe, Camera, Save, Smartphone, Settings2,
  X, Loader2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { SystemRole } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ROLES' | 'PREFERENCES'>('PROFILE');
  const [selectedRoleId, setSelectedRoleId] = useState('role-1');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const [churchInfo, setChurchInfo] = useState({
    name: 'Imani Central Parish',
    address: '123 Harambee Ave, Nairobi',
    phone: '+254 700 000 000',
    email: 'info@imani.org',
    website: 'www.imani.org'
  });

  const [notifications, setNotifications] = useState({
    mpesa: true,
    birthdays: true,
    events: false,
    memberJoining: true
  });

  const [roles, setRoles] = useState<SystemRole[]>([
    {
      id: 'role-1',
      name: 'Finance Team',
      memberCount: 3,
      description: 'Manage financial records, tithes, and budgets.',
      custom: true,
      modules: []
    },
    { id: 'role-2', name: 'Administrator', memberCount: 2, description: 'Full access to all modules.', modules: [] },
  ]);

  const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });

  const activeRole = roles.find(r => r.id === selectedRoleId);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Logic for saving profile would go here (already updated state)
    }, 1500);
  };

  const handleCreateRole = () => {
    if (!newRoleData.name) return;
    const role: SystemRole = {
      id: `role-${Date.now()}`,
      name: newRoleData.name,
      description: newRoleData.description,
      memberCount: 0,
      custom: true,
      modules: []
    };
    setRoles([...roles, role]);
    setNewRoleData({ name: '', description: '' });
    setShowCreateRoleModal(false);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h2>
        <p className="text-slate-500 font-medium">Configure your church profile, user roles, and app preferences.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar gap-4 lg:gap-8 pb-px">
        <button 
          onClick={() => setActiveTab('PROFILE')}
          className={`whitespace-nowrap flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 px-2 ${activeTab === 'PROFILE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Home size={18} /> Church Profile
        </button>
        <button 
          onClick={() => setActiveTab('ROLES')}
          className={`whitespace-nowrap flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 px-2 ${activeTab === 'ROLES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Shield size={18} /> Roles & Security
        </button>
        <button 
          onClick={() => setActiveTab('PREFERENCES')}
          className={`whitespace-nowrap flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 px-2 ${activeTab === 'PREFERENCES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Settings2 size={18} /> Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm p-6 lg:p-12 space-y-10">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 lg:w-48 lg:h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative group cursor-pointer">
                  <span className="text-6xl font-black text-slate-200">I</span>
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 rounded-[2.5rem] transition-all flex items-center justify-center">
                    <Camera className="text-white opacity-0 group-hover:opacity-100" size={32}/>
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Church Logo</p>
              </div>

              <div className="flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Church Name</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={churchInfo.name} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Official Email</label>
                    <input type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={churchInfo.email} onChange={e => setChurchInfo({...churchInfo, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Phone Number</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={churchInfo.phone} onChange={e => setChurchInfo({...churchInfo, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Website</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={churchInfo.website} onChange={e => setChurchInfo({...churchInfo, website: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Physical Address</label>
                  <textarea rows={3} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold resize-none" value={churchInfo.address} onChange={e => setChurchInfo({...churchInfo, address: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-slate-50">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {isSaving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              {roles.map(r => (
                <button 
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full p-6 text-left rounded-[2rem] border transition-all ${selectedRoleId === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  <p className="font-black text-lg">{r.name}</p>
                  <p className={`text-xs mt-1 font-medium ${selectedRoleId === r.id ? 'text-indigo-100' : 'text-slate-400'}`}>{r.memberCount} active users</p>
                </button>
              ))}
              <button 
                onClick={() => setShowCreateRoleModal(true)}
                className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black flex items-center justify-center gap-3 hover:bg-slate-50 hover:text-indigo-600 transition-all"
              >
                <Plus size={20}/> Create New Role
              </button>
            </div>
            <div className="lg:col-span-8 bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800">{activeRole?.name} Permissions</h3>
                   <p className="text-sm text-slate-400 font-medium mt-1">{activeRole?.description}</p>
                 </div>
                 <Shield className="text-indigo-600" size={32}/>
               </div>
               <div className="space-y-4">
                  {['Finance Management', 'Membership Access', 'Communication Logs', 'System Settings', 'Reports Export'].map(perm => (
                    <div key={perm} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700">{perm}</span>
                      <button className="text-indigo-600"><ToggleRight size={32}/></button>
                    </div>
                  ))}
               </div>
               <button onClick={handleSaveProfile} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all">Update Permissions</button>
            </div>
          </div>
        )}

        {activeTab === 'PREFERENCES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Bell size={24} className="text-amber-500"/> Notifications</h4>
              <div className="space-y-6">
                {Object.entries(notifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button 
                      onClick={() => setNotifications({...notifications, [key]: !val})}
                      className={val ? 'text-indigo-600' : 'text-slate-300'}
                    >
                      {val ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
               <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Smartphone size={24} className="text-indigo-600"/> M-Pesa Integration</h4>
               <div className="space-y-6">
                  <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white space-y-4">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Status: <span className="text-emerald-400">Connected</span></p>
                    <p className="text-sm font-medium opacity-80">Receiving instant webhooks from Safaricom Daraja API for Till 908123.</p>
                  </div>
                  <button 
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-600 text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isTestingWebhook ? <RefreshCcw className="animate-spin" size={16}/> : <RefreshCcw size={16}/>}
                    {isTestingWebhook ? 'Awaiting Daraja...' : 'Test Webhook Endpoint'}
                  </button>
                  <button className="w-full py-4 bg-white border border-rose-100 rounded-xl font-black text-rose-500 text-sm hover:bg-rose-50 transition-all">Disconnect Service</button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-800">Create Role</h3>
              <button onClick={() => setShowCreateRoleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Role Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Media Ministry Leader" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newRoleData.name}
                    onChange={e => setNewRoleData({...newRoleData, name: e.target.value})}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe responsibilities..." 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none"
                    value={newRoleData.description}
                    onChange={e => setNewRoleData({...newRoleData, description: e.target.value})}
                  />
               </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowCreateRoleModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl">Cancel</button>
              <button onClick={handleCreateRole} className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Create Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
