
import React, { useState } from 'react';
// Added CheckCircle2 to imports from lucide-react to fix 'Cannot find name' error
import { 
  Home, Shield, Settings2, Bell, Globe, 
  Smartphone, Save, Camera, RefreshCcw,
  ToggleRight, ToggleLeft, Plus, X, Loader2,
  Mail, MessageSquare, UserPlus, Calendar,
  CheckCircle2
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

  const [notificationPrefs, setNotificationPrefs] = useState({
    memberJoinsEmail: true,
    memberJoinsSMS: false,
    eventRemindersEmail: true,
    eventRemindersSMS: true,
    mpesaConfirmationsSMS: true,
    mpesaConfirmationsEmail: true
  });

  const roles: SystemRole[] = [
    { id: 'role-1', name: 'Finance Team', memberCount: 3, description: 'Manage treasury records.', modules: [] },
    { id: 'role-2', name: 'Administrator', memberCount: 2, description: 'Full system oversight.', modules: [] },
  ];

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const togglePref = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">System Settings</h2>
        <p className="text-slate-500 text-sm sm:text-lg font-medium">Configure global identity, user roles, and notification integrity.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar gap-4 sm:gap-8 pb-px max-w-full">
        <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-2 pb-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b-2 px-2 transition-all whitespace-nowrap ${activeTab === 'PROFILE' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-brand-indigo'}`}><Home size={18} /> Profile</button>
        <button onClick={() => setActiveTab('ROLES')} className={`flex items-center gap-2 pb-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b-2 px-2 transition-all whitespace-nowrap ${activeTab === 'ROLES' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-brand-indigo'}`}><Shield size={18} /> Roles</button>
        <button onClick={() => setActiveTab('PREFERENCES')} className={`flex items-center gap-2 pb-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b-2 px-2 transition-all whitespace-nowrap ${activeTab === 'PREFERENCES' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-brand-indigo'}`}><Bell size={18} /> Notifications</button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-6 sm:p-12 space-y-10 animate-in slide-in-from-bottom-2 duration-400">
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
               <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative group flex-shrink-0 mx-auto lg:mx-0 shadow-inner">
                  <span className="text-4xl sm:text-6xl font-black text-slate-200">I</span>
                  <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-[2rem] sm:rounded-[2.5rem] transition-all flex items-center justify-center cursor-pointer"><Camera className="text-brand-primary" size={32}/></div>
               </div>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Church Name</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm" value={churchInfo.name} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Official Email</label>
                    <input type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm" value={churchInfo.email} onChange={e => setChurchInfo({...churchInfo, email: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">HQ Address</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm" value={churchInfo.address} onChange={e => setChurchInfo({...churchInfo, address: e.target.value})} />
                  </div>
               </div>
            </div>
            <div className="flex justify-center lg:justify-start pt-4">
              <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {isSaving ? 'Updating...' : 'Save Global Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-4 space-y-4">
              {roles.map(r => (
                <button key={r.id} onClick={() => setSelectedRoleId(r.id)} className={`w-full p-6 text-left rounded-[1.5rem] sm:rounded-[2rem] border transition-all ${selectedRoleId === r.id ? 'bg-brand-primary text-white shadow-xl shadow-indigo-100 border-brand-primary' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                  <p className="font-black text-lg">{r.name}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">{r.memberCount} active users</p>
                </button>
              ))}
              <button className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-brand-primary hover:text-brand-primary transition-all">
                 <Plus size={16}/> Create Custom Role
              </button>
            </div>
            <div className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Permission Grid</h3>
                  <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest rounded-lg">High Security</span>
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Finance Ledger Management', val: true },
                    { label: 'Membership Data Modification', val: true },
                    { label: 'Outreach & SMS Broadcasting', val: false },
                    { label: 'Sermon Lab Generation', val: true }
                  ].map(perm => (
                    <div key={perm.label} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
                      <span className="font-bold text-slate-700 text-sm">{perm.label}</span>
                      <button className="text-brand-primary group-hover:scale-110 transition-transform"><ToggleRight size={32}/></button>
                    </div>
                  ))}
               </div>
               <div className="pt-6">
                 <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Reset to Defaults</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'PREFERENCES' && (
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-6 sm:p-12 space-y-12 animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
               {/* New Member Alerts */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><UserPlus size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">New Soul Alerts</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('memberJoinsEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Email Alerts</span>
                        </div>
                        {notificationPrefs.memberJoinsEmail ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('memberJoinsSMS')}>
                        <div className="flex items-center gap-3">
                           <MessageSquare size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">SMS Blast (Admin)</span>
                        </div>
                        {notificationPrefs.memberJoinsSMS ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                  </div>
               </div>

               {/* Event Alerts */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl"><Calendar size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Schedule Echo</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('eventRemindersEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Email Reminders</span>
                        </div>
                        {notificationPrefs.eventRemindersEmail ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('eventRemindersSMS')}>
                        <div className="flex items-center gap-3">
                           <Smartphone size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">SMS Handshake</span>
                        </div>
                        {notificationPrefs.eventRemindersSMS ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                  </div>
               </div>

               {/* Financial Compliance Alerts */}
               <div className="space-y-6 lg:col-span-2 border-t border-slate-50 pt-10">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-2xl"><Smartphone size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Treasury Pulsar</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('mpesaConfirmationsSMS')}>
                        <div className="flex items-center gap-3 min-w-0">
                           <Smartphone size={18} className="text-slate-400 flex-shrink-0"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm truncate">STK Receipt SMS</span>
                        </div>
                        {notificationPrefs.mpesaConfirmationsSMS ? <ToggleRight className="text-brand-emerald flex-shrink-0" size={32}/> : <ToggleLeft className="text-slate-300 flex-shrink-0" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => togglePref('mpesaConfirmationsEmail')}>
                        <div className="flex items-center gap-3 min-w-0">
                           <Mail size={18} className="text-slate-400 flex-shrink-0"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm truncate">Weekly Stewardship Email</span>
                        </div>
                        {notificationPrefs.mpesaConfirmationsEmail ? <ToggleRight className="text-brand-emerald flex-shrink-0" size={32}/> : <ToggleLeft className="text-slate-300 flex-shrink-0" size={32}/>}
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-center lg:justify-start pt-6">
              <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} {isSaving ? 'Syncing...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
