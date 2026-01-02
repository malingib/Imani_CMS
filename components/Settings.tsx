
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
  ShieldQuestion, AlertCircle
} from 'lucide-react';
import { SystemRole, UserRole } from '../types';

interface SettingsProps {
  currentUserRole: UserRole;
}

type SettingTab = 'PROFILE' | 'ROLES' | 'PREFERENCES' | 'INTEGRATIONS';

const Settings: React.FC<SettingsProps> = ({ currentUserRole }) => {
  // Define tab permissions
  const availableTabs = useMemo(() => {
    const tabs: { id: SettingTab; label: string; icon: any }[] = [
      { id: 'PROFILE', label: 'Parish Profile', icon: Home }
    ];

    if (currentUserRole === UserRole.ADMIN) {
      tabs.push({ id: 'ROLES', label: 'Access Control', icon: Shield });
      tabs.push({ id: 'PREFERENCES', label: 'System Alerts', icon: Bell });
      tabs.push({ id: 'INTEGRATIONS', label: 'Payment Hub', icon: SmartphoneNfc });
    } else if (currentUserRole === UserRole.PASTOR) {
      tabs.push({ id: 'PREFERENCES', label: 'Ministry Alerts', icon: Bell });
    } else if (currentUserRole === UserRole.TREASURER) {
      tabs.push({ id: 'INTEGRATIONS', label: 'Payment Hub', icon: SmartphoneNfc });
    }

    return tabs;
  }, [currentUserRole]);

  const [activeTab, setActiveTab] = useState<SettingTab>('PROFILE');
  const [selectedRoleId, setSelectedRoleId] = useState('role-1');
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

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

  const [integrations, setIntegrations] = useState({
    mpesaEnabled: true,
    paystackEnabled: false,
    mpesaEnv: 'Sandbox',
    mpesaShortcode: '174379',
    mpesaConsumerKey: 'K9jH7s2D1f9G8h3J4kL5mN6pQ7rT8uV9',
    mpesaConsumerSecret: 'P8rL5k4J3h2G1fD9s8A7q6W5e4R3t2Y1',
    mpesaPasskey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    paystackPubKey: 'pk_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    paystackSecKey: 'sk_test_q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6'
  });

  const roles: SystemRole[] = [
    { id: 'role-1', name: 'Finance Team', memberCount: 3, description: 'Manage treasury records.', modules: [] },
    { id: 'role-2', name: 'Administrator', memberCount: 2, description: 'Full system oversight.', modules: [] },
  ];

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => setIsTestingConnection(false), 2000);
  };

  const togglePref = (key: keyof typeof notificationPrefs) => {
    if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.PASTOR) return;
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = currentUserRole === UserRole.ADMIN;
  const isFinance = currentUserRole === UserRole.TREASURER || isAdmin;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">System Settings</h2>
        <p className="text-slate-500 text-sm sm:text-lg font-medium">Global configuration for identity, security, and integrations.</p>
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
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-6 sm:p-12 space-y-10 animate-in slide-in-from-bottom-2 duration-400">
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
               <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative group flex-shrink-0 mx-auto lg:mx-0 shadow-inner">
                  <span className="text-4xl sm:text-6xl font-black text-slate-200">I</span>
                  {isAdmin && (
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-[2rem] sm:rounded-[2.5rem] transition-all flex items-center justify-center cursor-pointer">
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
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">HQ Address</label>
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
                <p className="text-xs text-slate-500 font-medium leading-relaxed">System-wide profile settings are managed exclusively by the Board Administrator. Contact the IT office to request modifications.</p>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-center lg:justify-start pt-4">
                <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {isSaving ? 'Updating...' : 'Save Global Profile'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'INTEGRATIONS' && isFinance && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2 duration-500">
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Zap size={24}/></div>
                         <h4 className="text-xl font-black uppercase tracking-tight">Fintech Gateway</h4>
                      </div>
                      <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                        Authorize <span className="text-white font-black">Direct M-Pesa</span> and <span className="text-white font-black">Paystack Africa</span>. Requires C2B/B2C credentials from Daraja portal.
                      </p>
                      <button 
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-white transition-colors"
                      >
                        {showSecrets ? <EyeOff size={14}/> : <Eye size={14}/>} {showSecrets ? 'Mask Keys' : 'Reveal Secrets'}
                      </button>
                   </div>
                   <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:scale-125 transition-transform duration-1000" />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                   <h4 className="text-sm font-black uppercase text-slate-400 flex items-center gap-3">
                      <ShieldCheck size={18} className="text-brand-indigo"/> Data Sovereignty
                   </h4>
                   <p className="text-xs text-slate-500 leading-relaxed">All transaction signals are verified against Safaricom G2 Public IP headers. Integration keys are strictly siloed from application logs.</p>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-400">Security Mode</span>
                         <span className="text-[10px] font-black uppercase text-brand-emerald">ENCRYPTED</span>
                      </div>
                      <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-brand-emerald w-full" />
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] space-y-4">
                   <ShieldQuestion size={32} className="text-slate-300 mx-auto"/>
                   <h5 className="text-center font-black text-slate-600 uppercase text-xs tracking-tight">Need Daraja Help?</h5>
                   <p className="text-center text-[10px] text-slate-400 font-medium">Follow our integration guide to obtain your Consumer Key and Secret from the Safaricom Developer Portal.</p>
                   <button className="w-full py-3 bg-white border border-slate-200 text-brand-indigo rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                      <ExternalLink size={12}/> API Documentation
                   </button>
                </div>
             </div>

             <div className="lg:col-span-8 space-y-8">
                {/* M-Pesa Card */}
                <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center shadow-inner">
                            <Smartphone size={36}/>
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lipa Na M-Pesa</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Direct M-Pesa Express (STK Push) Hub</p>
                         </div>
                      </div>
                      <div className={`px-5 py-2 rounded-full border flex items-center gap-2 ${integrations.mpesaEnabled ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                         <div className={`w-2 h-2 rounded-full ${integrations.mpesaEnabled ? 'bg-brand-emerald animate-pulse' : 'bg-slate-300'}`}/>
                         <span className="text-[10px] font-black uppercase tracking-widest">{integrations.mpesaEnabled ? 'Direct Link Active' : 'System Detached'}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Daraja Environment</label>
                         <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                            {['Sandbox', 'Live'].map(env => (
                               <button 
                                 key={env} 
                                 onClick={() => setIntegrations({...integrations, mpesaEnv: env})}
                                 className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${integrations.mpesaEnv === env ? 'bg-white text-brand-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                               >
                                  {env}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Paybill / Till Shortcode</label>
                         <div className="relative">
                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-primary outline-none shadow-inner" value={integrations.mpesaShortcode} onChange={e => setIntegrations({...integrations, mpesaShortcode: e.target.value})} />
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Consumer Key</label>
                         <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input 
                              type={showSecrets ? "text" : "password"} 
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-brand-primary outline-none shadow-inner" 
                              value={integrations.mpesaConsumerKey} 
                              onChange={e => setIntegrations({...integrations, mpesaConsumerKey: e.target.value})} 
                            />
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Consumer Secret</label>
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input 
                              type={showSecrets ? "text" : "password"} 
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-brand-primary outline-none shadow-inner" 
                              value={integrations.mpesaConsumerSecret} 
                              onChange={e => setIntegrations({...integrations, mpesaConsumerSecret: e.target.value})} 
                            />
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">LNM Online Passkey</label>
                         <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input 
                              type={showSecrets ? "text" : "password"} 
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-brand-primary outline-none shadow-inner" 
                              value={integrations.mpesaPasskey} 
                              onChange={e => setIntegrations({...integrations, mpesaPasskey: e.target.value})} 
                            />
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-3">
                         <button 
                           onClick={handleTestConnection}
                           disabled={isTestingConnection}
                           className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                         >
                            {isTestingConnection ? <Loader2 className="animate-spin" size={14}/> : <Activity size={14}/>}
                            {isTestingConnection ? 'Testing...' : 'Test STK Pulse'}
                         </button>
                         <div className="flex items-center gap-2 text-slate-400">
                            <Database size={14}/>
                            <span className="text-[10px] font-black uppercase">V3.1 Node Active</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => setIntegrations({...integrations, mpesaEnabled: !integrations.mpesaEnabled})}
                        className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${integrations.mpesaEnabled ? 'bg-slate-900 text-white hover:bg-rose-600' : 'bg-brand-emerald text-white hover:shadow-emerald-100'}`}
                      >
                         {integrations.mpesaEnabled ? 'Revoke Gateway Access' : 'Initialize Direct Bridge'}
                      </button>
                   </div>
                </div>

                {/* Alternative Gateway: Paystack */}
                <div className="bg-slate-50 p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 group transition-all hover:bg-white hover:border-slate-100">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white text-brand-indigo rounded-2xl flex items-center justify-center shadow-sm">
                            <CreditCard size={28}/>
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Paystack Africa</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 mt-1">International & Card Processing</p>
                         </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${integrations.paystackEnabled ? 'bg-indigo-50 border-indigo-100 text-brand-indigo' : 'bg-white border-slate-100 text-slate-300'}`}>
                         <span className="text-[10px] font-black uppercase tracking-widest">{integrations.paystackEnabled ? 'Authorized' : 'Disabled'}</span>
                      </div>
                   </div>

                   {integrations.paystackEnabled ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Public Key</label>
                           <input type="text" readOnly className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-400" value={integrations.paystackPubKey} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Secret Key</label>
                           <input type="password" readOnly className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-400" value={integrations.paystackSecKey} />
                        </div>
                     </div>
                   ) : (
                     <div className="py-6 text-center space-y-4">
                        <p className="text-sm font-medium text-slate-500">Expand your stewardship reach with credit cards and bank transfers.</p>
                        <button 
                           onClick={() => setIntegrations({...integrations, paystackEnabled: true})}
                           className="px-8 py-3 bg-white border border-slate-200 text-brand-indigo rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                        >
                           Enable Paystack Node
                        </button>
                     </div>
                   )}
                </div>

                <div className="p-8 bg-brand-gold/5 border border-brand-gold/20 rounded-[2.5rem] flex items-start gap-6">
                   <AlertCircle className="text-brand-gold shrink-0 mt-1" size={24}/>
                   <div className="space-y-2">
                      <h4 className="font-black text-brand-gold text-sm uppercase tracking-tight">Fintech Compliance Warning</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Ensure your Daraja production app has been fully whitelisted by Safaricom before switching to 'Live' mode. Sandbox transactions will not settle to the church's bank account. Audit logs capture all credential modifications.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ROLES' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 bg-brand-indigo-50 border border-brand-indigo/10 rounded-2xl mb-6">
                <h4 className="text-[10px] font-black uppercase text-brand-indigo tracking-widest flex items-center gap-2 mb-2"><Shield size={12}/> Role Architecture</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Map church governance to system permissions. These roles define module visibility.</p>
              </div>
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
                  <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest rounded-lg">Policy Root</span>
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Finance Ledger Management', val: true },
                    { label: 'Membership Data Modification', val: true },
                    { label: 'Outreach & SMS Broadcasting', val: false },
                    { label: 'Sermon Lab Generation', val: true }
                  ].map(perm => (
                    <div key={perm.label} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${perm.val ? 'bg-brand-emerald' : 'bg-slate-300'}`}/>
                        <span className="font-bold text-slate-700 text-sm">{perm.label}</span>
                      </div>
                      <button className="text-brand-primary group-hover:scale-110 transition-transform"><ToggleRight size={32}/></button>
                    </div>
                  ))}
               </div>
               <div className="pt-6">
                 <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Synchronize Permissions</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'PREFERENCES' && (isAdmin || currentUserRole === UserRole.PASTOR) && (
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-6 sm:p-12 space-y-12 animate-in slide-in-from-left-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><UserPlus size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Growth Monitoring</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('memberJoinsEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Membership Influx Email</span>
                        </div>
                        {notificationPrefs.memberJoinsEmail ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('memberJoinsSMS')}>
                        <div className="flex items-center gap-3">
                           <MessageSquare size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">High-Priority SMS Blast</span>
                        </div>
                        {notificationPrefs.memberJoinsSMS ? <ToggleRight className="text-brand-emerald" size={32}/> : <ToggleLeft className="text-slate-300" size={32}/>}
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl"><Calendar size={20}/></div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">Ecclesiastical Echo</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100" onClick={() => togglePref('eventRemindersEmail')}>
                        <div className="flex items-center gap-3">
                           <Mail size={18} className="text-slate-400"/>
                           <span className="font-bold text-slate-700 text-xs sm:text-sm">Weekly Bulletin Export</span>
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
              <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest">
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
