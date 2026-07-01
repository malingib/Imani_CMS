import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Save, ToggleLeft, ToggleRight, CheckCircle2, Loader2 } from 'lucide-react';

interface PlatformFlags {
  sms_integration: boolean;
  ai_features: boolean;
  allow_self_signup: boolean;
  maintenance_mode: boolean;
}

const DEFAULTS: PlatformFlags = {
  sms_integration: true,
  ai_features: true,
  allow_self_signup: false,
  maintenance_mode: false,
};

const DEFAULT_LIMITS = {
  max_members_basic: 200,
  max_members_pro: 99999,
  trial_days: 14,
};

const PlatformSettings: React.FC = () => {
  const [flags, setFlags] = useState<PlatformFlags>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('platform_settings').select('*').single().then(({ data, error }) => {
      if (!error && data?.flags) {
        setFlags({ ...DEFAULTS, ...data.flags });
      }
      setLoading(false);
    });
  }, []);

  const toggle = (key: keyof PlatformFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('platform_settings').upsert(
      { id: 'global', flags },
      { onConflict: 'id' }
    );
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const ToggleSwitch = ({ flag, label, desc }: { flag: keyof PlatformFlags; label: string; desc: string }) => (
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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-primary tracking-tight">Platform Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Global configuration</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Feature Flags</h2>
        <ToggleSwitch flag="sms_integration" label="SMS Integration" desc="Enable SMS alerts and notifications for all churches" />
        <ToggleSwitch flag="ai_features" label="AI Features" desc="Daily verses, sermon outlines, AI chat assistant" />
        <ToggleSwitch flag="allow_self_signup" label="Allow Self-Signup" desc="Let churches sign up without super admin invitation" />
        <ToggleSwitch flag="maintenance_mode" label="Maintenance Mode" desc="Block access for all non-super-admin users" />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Default Limits</h2>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Max Members</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{DEFAULT_LIMITS.max_members_basic.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Max Members</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{DEFAULT_LIMITS.max_members_pro.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trial Period</p>
            <p className="text-2xl font-black text-brand-primary mt-1">{DEFAULT_LIMITS.trial_days} days</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <span className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in">
            <CheckCircle2 size={18} /> Settings saved
          </span>
        )}
      </div>
    </div>
  );
};

export default PlatformSettings;
