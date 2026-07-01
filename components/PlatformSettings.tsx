import React, { useState } from 'react';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';

interface FeatureFlags {
  smsIntegration: boolean;
  aiFeatures: boolean;
  allowSelfSignup: boolean;
  maintenanceMode: boolean;
}

const PlatformSettings: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    smsIntegration: true,
    aiFeatures: true,
    allowSelfSignup: false,
    maintenanceMode: false,
  });

  const [defaultLimits] = useState({
    maxMembersBasic: 200,
    maxMembersPro: 99999,
    trialDays: 14,
  });

  const toggle = (key: keyof FeatureFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ flag, label, desc }: { flag: keyof FeatureFlags; label: string; desc: string }) => (
    <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100">
      <div>
        <p className="font-black text-brand-primary text-sm">{label}</p>
        <p className="text-xs font-bold text-slate-400 mt-1">{desc}</p>
      </div>
      <button onClick={() => toggle(flag)} className="text-brand-indigo hover:text-brand-primary transition-colors">
        {flags[flag] ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-primary tracking-tight">Platform Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Global configuration</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Feature Flags</h2>
        <ToggleSwitch flag="smsIntegration" label="SMS Integration" desc="Enable SMS alerts and notifications for all churches" />
        <ToggleSwitch flag="aiFeatures" label="AI Features" desc="Daily verses, sermon outlines, AI chat assistant" />
        <ToggleSwitch flag="allowSelfSignup" label="Allow Self-Signup" desc="Let churches sign up without super admin invitation" />
        <ToggleSwitch flag="maintenanceMode" label="Maintenance Mode" desc="Block access for all non-super-admin users" />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Default Limits</h2>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Max Members</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{defaultLimits.maxMembersBasic.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Max Members</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{defaultLimits.maxMembersPro.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trial Period</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{defaultLimits.trialDays} days</p>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
        <Save size={18} /> Save Settings
      </button>
    </div>
  );
};

export default PlatformSettings;
