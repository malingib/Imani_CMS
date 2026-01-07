
import React, { useState, useMemo } from 'react';
import { 
  Home, Shield, Settings2, Bell, Globe, 
  Smartphone, Save, Camera, RefreshCcw,
  ToggleRight, ToggleLeft, Plus, X, Loader2,
  Mail, MessageSquare, UserPlus, Calendar,
  CheckCircle2, Share2, Key, Link as LinkIcon,
  Zap, Database, ShieldAlert, CreditCard,
  ShieldCheck, Lock, Eye, EyeOff, Activity,
  SmartphoneNfc, Landmark, ExternalLink,
  ShieldQuestion, AlertCircle, Copy, Trash2
} from 'lucide-react';
import { SystemRole, UserRole, ApiKey } from '../types';

interface SettingsProps {
  currentUserRole: UserRole;
}

type SettingTab = 'PROFILE' | 'ROLES' | 'PREFERENCES' | 'INTEGRATIONS' | 'PLATFORM_GLOBAL' | 'API_KEYS';

const Settings: React.FC<SettingsProps> = ({ currentUserRole }) => {
  const isOwner = currentUserRole === UserRole.SYSTEM_OWNER;

  const availableTabs = useMemo(() => {
    const tabs: { id: SettingTab; label: string; icon: any }[] = [
      { id: 'PROFILE', label: 'Parish Profile', icon: Home }
    ];

    if (isOwner) {
      tabs.push({ id: 'PLATFORM_GLOBAL', label: 'Inherited Policy', icon: Globe });
      tabs.push({ id: 'API_KEYS', label: 'API Management', icon: Key });
    }

    if (currentUserRole === UserRole.ADMIN) {
      tabs.push({ id: 'ROLES', label: 'Access Control', icon: Shield });
      tabs.push({ id: 'PREFERENCES', label: 'System Alerts', icon: Bell });
      tabs.push({ id: 'INTEGRATIONS', label: 'Payment Hub', icon: SmartphoneNfc });
    }

    return tabs;
  }, [currentUserRole, isOwner]);

  const [activeTab, setActiveTab] = useState<SettingTab>(isOwner ? 'PLATFORM_GLOBAL' : 'PROFILE');
  const [isSaving, setIsSaving] = useState(false);

  // Platform Global Settings (Inherited by new tenants)
  const [globalPolicy, setGlobalPolicy] = useState({
    defaultChannel: 'SMS',
    reminderLeadTime: '1h',
    autoAuditLogs: true,
    allowInternationalGiving: false,
    enforcePciCompliance: true
  });

  // API Key Management State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'ak1', name: 'Mobile App Bridge', key: 'IMANI_LIVE_829X_PQLM', createdAt: '2024-05-12', lastUsed: '2 mins ago', status: 'ACTIVE' },
    { id: 'ak2', name: 'Daraja Webhook Node', key: 'IMANI_MPESA_001K_RECON', createdAt: '2024-01-20', lastUsed: '1h ago', status: 'ACTIVE' }
  ]);

  const generateNewKey = () => {
    const newKey: ApiKey = {
      id: `ak-${Date.now()}`,
      name: 'New Integration Client',
      key: `IMANI_${Math.random().toString(36).substr(2, 12).toUpperCase()}_DEV`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'ACTIVE'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleSaveGlobal = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">
          {isOwner ? 'Platform Global Configuration' : 'System Settings'}
        </h2>
        <p className="text-slate-500 text-sm sm:text-lg font-medium">Configuring technical boundaries and operational defaults.</p>
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

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {activeTab === 'PLATFORM_GLOBAL' && isOwner && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 space-y-12 animate-in slide-in-from-bottom-2 duration-400">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                <div className="p-4 bg-brand-primary text-brand-gold rounded-2xl shadow-xl"><Globe size={32}/></div>
                <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Inherited Policy Control</h3>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Default behavior for new tenant provisioning</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Default Notification Hub</label>
                      <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                         {['SMS', 'Email', 'WhatsApp'].map(chan => (
                            <button 
                              key={chan} 
                              onClick={() => setGlobalPolicy({...globalPolicy, defaultChannel: chan})}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${globalPolicy.defaultChannel === chan ? 'bg-white text-brand-primary shadow-md' : 'text-slate-400'}`}
                            >
                               {chan}
                            </button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Event Reminder Lead Time</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                        value={globalPolicy.reminderLeadTime}
                        onChange={e => setGlobalPolicy({...globalPolicy, reminderLeadTime: e.target.value})}
                      >
                         <option value="30m">30 Minutes</option>
                         <option value="1h">1 Hour</option>
                         <option value="2h">2 Hours</option>
                         <option value="24h">24 Hours</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                         <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Auto Audit Trail</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Mandatory log for all tenants</p>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${globalPolicy.autoAuditLogs ? 'bg-brand-emerald' : 'bg-slate-300'}`}
                        onClick={() => setGlobalPolicy({...globalPolicy, autoAuditLogs: !globalPolicy.autoAuditLogs})}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${globalPolicy.autoAuditLogs ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                         <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Enforce PCI-DSS Compliance</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Strict Daraja integration standards</p>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${globalPolicy.enforcePciCompliance ? 'bg-brand-emerald' : 'bg-slate-300'}`}
                        onClick={() => setGlobalPolicy({...globalPolicy, enforcePciCompliance: !globalPolicy.enforcePciCompliance})}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${globalPolicy.enforcePciCompliance ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-50">
                <button onClick={handleSaveGlobal} disabled={isSaving} className="px-10 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3">
                   {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Push Global Policy
                </button>
             </div>
          </div>
        )}

        {activeTab === 'API_KEYS' && isOwner && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 space-y-10 animate-in slide-in-from-right-2 duration-400">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-50 pb-10">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-brand-gold text-brand-primary rounded-2xl shadow-xl"><Key size={32}/></div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">API Management</h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Bearer tokens for mobile apps and third-party nodes</p>
                   </div>
                </div>
                <button 
                  onClick={generateNewKey}
                  className="px-8 py-4 bg-brand-primary text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"
                >
                   <Plus size={16}/> Provision Token
                </button>
             </div>

             <div className="space-y-4">
                {apiKeys.map(key => (
                   <div key={key.id} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col sm:flex-row justify-between items-center gap-6 ${key.status === 'ACTIVE' ? 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl' : 'bg-slate-100 border-transparent opacity-50'}`}>
                      <div className="flex items-center gap-6 flex-1 min-w-0 w-full sm:w-auto">
                         <div className={`p-4 rounded-2xl ${key.status === 'ACTIVE' ? 'bg-brand-indigo/10 text-brand-indigo' : 'bg-slate-200 text-slate-400'}`}>
                            <Smartphone size={24}/>
                         </div>
                         <div className="min-w-0">
                            <div className="flex items-center gap-3">
                               <h4 className="font-black text-slate-800 uppercase tracking-tight">{key.name}</h4>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${key.status === 'ACTIVE' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-slate-300 text-slate-600'}`}>{key.status}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                               <code className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{key.key}</code>
                               <button className="text-slate-300 hover:text-brand-primary"><Copy size={14}/></button>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                         <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-slate-400">Last Pulse</p>
                            <p className="text-xs font-bold text-slate-600">{key.lastUsed}</p>
                         </div>
                         <button 
                           onClick={() => setApiKeys(apiKeys.map(k => k.id === key.id ? {...k, status: k.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'} : k))}
                           className={`p-4 rounded-2xl transition-all ${key.status === 'ACTIVE' ? 'bg-white text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500 text-white shadow-lg'}`}
                         >
                            {key.status === 'ACTIVE' ? <ShieldAlert size={20}/> : <RefreshCcw size={20}/>}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
