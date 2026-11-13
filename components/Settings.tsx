
import React, { useState, useMemo, useEffect } from 'react';
import { Home, Shield, Bell, Smartphone, Save, Camera, ToggleRight, ToggleLeft, Plus, Loader2, Mail, MessageSquare, UserPlus, Calendar, CheckCircle2, Lock, SmartphoneNfc } from 'lucide-react';
import { UserRole } from '../types';
import { createChurchSettingsService, DEFAULT_CHURCH_NOTIFICATION_PREFERENCES, EMPTY_CHURCH_PROFILE } from '../src/lib/church-settings-service';
import { supabase } from '../src/lib/supabase';
import IntegrationSettingsPanel from './IntegrationSettingsPanel';

const churchSettingsService = createChurchSettingsService(supabase);

interface SettingsProps {
  currentUserRole: UserRole;
  churchId: string;
}

type SettingTab = 'PROFILE' | 'PREFERENCES' | 'INTEGRATIONS';

const Settings: React.FC<SettingsProps> = ({ currentUserRole, churchId }) => {
  // Define tab permissions
  const availableTabs = useMemo(() => {
    const tabs: { id: SettingTab; label: string; icon: any }[] = [
      { id: 'PROFILE', label: 'Parish Profile', icon: Home }
    ];

    if (currentUserRole === UserRole.ADMIN) {
      tabs.push({ id: 'PREFERENCES', label: 'System Alerts', icon: Bell });
      tabs.push({ id: 'INTEGRATIONS', label: 'Integrations', icon: SmartphoneNfc });
    } else if (currentUserRole === UserRole.PASTOR || currentUserRole === UserRole.SECRETARY) {
      tabs.push({ id: 'PREFERENCES', label: 'Notifications', icon: Bell });
      tabs.push({ id: 'INTEGRATIONS', label: 'Integrations', icon: SmartphoneNfc });
    } else if (currentUserRole === UserRole.TREASURER) {
      tabs.push({ id: 'INTEGRATIONS', label: 'Integrations', icon: SmartphoneNfc });
    }

    return tabs;
  }, [currentUserRole]);

  const [activeTab, setActiveTab] = useState<SettingTab>('PROFILE');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [churchInfo, setChurchInfo] = useState(EMPTY_CHURCH_PROFILE);
  const [notificationPrefs, setNotificationPrefs] = useState(DEFAULT_CHURCH_NOTIFICATION_PREFERENCES);


  const handleSaveProfile = async () => {
    await persistSetting('Church profile', () => churchSettingsService.saveChurchProfile(churchId, churchInfo));
  };

  const handleSaveNotificationPrefs = async () => {
    await persistSetting('Notification preferences', () => churchSettingsService.saveNotificationPreferences(churchId, notificationPrefs));
  };

  const togglePref = (key: keyof typeof notificationPrefs) => {
    if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.PASTOR) return;
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = currentUserRole === UserRole.ADMIN;
  const persistSetting = async (label: string, save: () => Promise<void>) => {
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await save();
      setSaveFeedback({ ok: true, message: `${label} saved.` });
    } catch (error) {
      setSaveFeedback({ ok: false, message: error instanceof Error ? error.message : `${label} could not be saved. Check your access and connection, then try again.` });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (!churchId) return () => { alive = false; };
    void Promise.all([
      churchSettingsService.getChurchProfile(churchId),
      churchSettingsService.getNotificationPreferences(churchId),
    ]).then(([profile, preferences]) => {
      if (!alive) return;
      setChurchInfo(profile);
      setNotificationPrefs(preferences);
    }).catch((error) => {
      if (alive) setSaveFeedback({
        ok: false,
        message: error instanceof Error ? error.message : 'Could not load church settings.',
      });
    });
    return () => { alive = false; };
  }, [churchId]);

  return (
    <div className="imani-page imani-page--settings space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-2xl font-semibold text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Church Settings</h2>
        <p className="text-slate-500 text-sm sm:text-lg font-medium">Manage church identity, access, notifications, and provider integrations.</p>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar gap-4 sm:gap-8 pb-px max-w-full">
        {availableTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 pb-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b-2 px-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-brand-indigo'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {saveFeedback && (
        <p role={saveFeedback.ok ? 'status' : 'alert'} className={`rounded-lg border px-4 py-3 text-sm ${saveFeedback.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {saveFeedback.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-xl sm:rounded-xl border border-slate-100 shadow-sm p-6 sm:p-6 space-y-10 animate-in slide-in-from-bottom-2 duration-400">
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
               <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-slate-50 rounded-xl sm:rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group flex-shrink-0 mx-auto lg:mx-0 shadow-inner">
                  <span className="text-4xl sm:text-6xl font-black text-slate-200">I</span>
                  {isAdmin && (
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-xl sm:rounded-xl transition-all flex items-center justify-center cursor-pointer">
                      <Camera className="text-brand-primary" size={32}/>
                    </div>
                  )}
               </div>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Church Name</label>
                    <input 
                      disabled={!isAdmin}
                      type="text" 
                      className={`w-full p-4 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm transition-all ${!isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 text-slate-700 shadow-inner'}`} 
                      value={churchInfo.name} 
                      onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Official Email</label>
                    <input 
                      disabled={!isAdmin}
                      type="email" 
                      className={`w-full p-4 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm transition-all ${!isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 text-slate-700 shadow-inner'}`} 
                      value={churchInfo.email} 
                      onChange={e => setChurchInfo({...churchInfo, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Address</label>
                    <input 
                      disabled={!isAdmin}
                      type="text" 
                      className={`w-full p-4 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm transition-all ${!isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 text-slate-700 shadow-inner'}`} 
                      value={churchInfo.address} 
                      onChange={e => setChurchInfo({...churchInfo, address: e.target.value})} 
                    />
                  </div>
               </div>
            </div>
            
            {!isAdmin && (
              <div className="p-6 bg-slate-50 rounded-2xl flex items-start gap-4 border border-slate-100">
                <Lock className="text-slate-300 shrink-0" size={20}/>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Only church administrators can update the church profile.</p>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-center lg:justify-start pt-4">
                <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-sm hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {isSaving ? 'Updating...' : 'Save Church Profile'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'INTEGRATIONS' && <IntegrationSettingsPanel scope="church" churchId={churchId} role={currentUserRole} />}

        {activeTab === 'PREFERENCES' && (isAdmin || currentUserRole === UserRole.PASTOR) && (
          <div className="bg-white rounded-xl sm:rounded-xl border border-slate-100 shadow-sm p-6 sm:p-6 space-y-12 animate-in slide-in-from-left-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><UserPlus size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Member Notifications</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('memberJoinsEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">New Member Email</span>
                        </div>
                        {notificationPrefs.memberJoinsEmail ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('memberJoinsSMS')}>
                        <div className="flex items-center gap-3">
                           <MessageSquare size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">New Member SMS</span>
                        </div>
                        {notificationPrefs.memberJoinsSMS ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl"><Calendar size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Event Notifications</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('eventRemindersEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Event Reminder Email</span>
                        </div>
                        {notificationPrefs.eventRemindersEmail ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('eventRemindersSMS')}>
                        <div className="flex items-center gap-3">
                           <Smartphone size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Service Reminders SMS</span>
                        </div>
                        {notificationPrefs.eventRemindersSMS ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-center lg:justify-start pt-6 border-t border-slate-50">
              <button onClick={handleSaveNotificationPrefs} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-sm hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} Commit Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
