
import React, { useState } from 'react';
import { 
  Home, Shield, Settings2, Bell, Globe, 
  Smartphone, Save, Camera, RefreshCcw,
  ToggleRight, ToggleLeft, Plus, X, Loader2
} from 'lucide-react';
import { SystemRole } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ROLES' | 'PREFERENCES'>('PROFILE');
  const [selectedRoleId, setSelectedRoleId] = useState('role-1');
  const [isSaving, setIsSaving] = useState(false);

  const [churchInfo, setChurchInfo] = useState({
    name: 'Imani Central Parish',
    address: '123 Harambee Ave, Nairobi',
    phone: '+254 700 000 000',
    email: 'info@imani.org',
    website: 'www.imani.org'
  });

  const [notifications, setNotifications] = useState({ mpesa: true, birthdays: true });

  const roles: SystemRole[] = [
    { id: 'role-1', name: 'Finance Team', memberCount: 3, description: 'Manage records.', modules: [] },
    { id: 'role-2', name: 'Administrator', memberCount: 2, description: 'Full access.', modules: [] },
  ];

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">System Settings</h2>
        <p className="text-slate-500 font-medium">Configure your church profile, user roles, and app preferences.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar gap-4 lg:gap-8 pb-px">
        <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 px-2 transition-all ${activeTab === 'PROFILE' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}><Home size={18} /> Profile</button>
        <button onClick={() => setActiveTab('ROLES')} className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 px-2 transition-all ${activeTab === 'ROLES' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}><Shield size={18} /> Roles</button>
        <button onClick={() => setActiveTab('PREFERENCES')} className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 px-2 transition-all ${activeTab === 'PREFERENCES' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}><Settings2 size={18} /> Preferences</button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm p-6 lg:p-12 space-y-10">
            <div className="flex flex-col lg:flex-row gap-12">
               <div className="w-32 h-32 lg:w-48 lg:h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative group">
                  <span className="text-6xl font-black text-slate-200">I</span>
                  <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-all flex items-center justify-center"><Camera className="text-brand-primary" size={32}/></div>
               </div>
               <div className="flex-1 grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Church Name</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none" value={churchInfo.name} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Email</label>
                    <input type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none" value={churchInfo.email} onChange={e => setChurchInfo({...churchInfo, email: e.target.value})} />
                  </div>
               </div>
            </div>
            <button onClick={handleSaveProfile} disabled={isSaving} className="px-10 py-4 bg-brand-primary text-white rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} {isSaving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              {roles.map(r => (
                <button key={r.id} onClick={() => setSelectedRoleId(r.id)} className={`w-full p-6 text-left rounded-[2rem] border transition-all ${selectedRoleId === r.id ? 'bg-brand-primary text-white shadow-xl shadow-indigo-100 border-brand-primary' : 'bg-white border-slate-100 text-slate-600'}`}>
                  <p className="font-black text-lg">{r.name}</p>
                  <p className="text-xs mt-1 font-medium">{r.memberCount} users</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-8 bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-2xl font-black text-slate-800">Permissions</h3>
               <div className="space-y-4">
                  {['Finance', 'Membership', 'Outreach'].map(perm => (
                    <div key={perm} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700">{perm}</span>
                      <button className="text-brand-primary"><ToggleRight size={32}/></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
