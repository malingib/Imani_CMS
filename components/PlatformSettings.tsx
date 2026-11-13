import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createPlatformSettingsService, DEFAULT_PLATFORM_FLAGS, type PlatformFlags, type PlatformLimits } from '../src/lib/platform-settings-service';
import { Save, ToggleLeft, ToggleRight, CheckCircle2, Loader2 } from 'lucide-react';
import IntegrationSettingsPanel from './IntegrationSettingsPanel';

const platformSettingsService = createPlatformSettingsService(supabase);

const DEFAULT_LIMITS: PlatformLimits = {
  max_members_basic: 200,
  max_members_pro: 99999,
  trial_days: 14,
};

const PlatformSettings: React.FC = () => {
  const [flags, setFlags] = useState<PlatformFlags>(DEFAULT_PLATFORM_FLAGS);
  const [limits, setLimits] = useState<PlatformLimits>(DEFAULT_LIMITS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    platformSettingsService.getPlatformSettings().then((settings) => {
      if (alive) {
        const { default_limits: savedLimits, ...featureFlags } = settings.flags;
        setFlags(featureFlags);
        setLimits({ ...DEFAULT_LIMITS, ...(savedLimits || {}) });
      }
    }).catch((loadError) => {
      if (alive) {
        setLoadFailed(true);
        setError(loadError instanceof Error ? loadError.message : 'Platform settings could not be loaded.');
      }
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const toggle = (key: keyof PlatformFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async () => {
    if (loadFailed) return;
    if (!Number.isSafeInteger(limits.max_members_basic) || limits.max_members_basic < 1
      || !Number.isSafeInteger(limits.max_members_pro) || limits.max_members_pro < limits.max_members_basic
      || !Number.isSafeInteger(limits.trial_days) || limits.trial_days < 0 || limits.trial_days > 90) {
      setError('Check the member limits and trial duration. Pro capacity must be at least the Basic capacity; trial duration must be 0–90 days.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await platformSettingsService.savePlatformSettings({ ...flags, default_limits: limits });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Platform settings could not be saved.');
    } finally {
      setSaving(false);
    }
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

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-600">Platform provider credentials</h2>
        <IntegrationSettingsPanel scope="platform" role="SUPER_ADMIN" />
      </section>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Default Limits</h2>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic max members</span>
            <input type="number" min="1" step="1" value={limits.max_members_basic} onChange={e => setLimits(old => ({ ...old, max_members_basic: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-semibold text-brand-primary" />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro max members</span>
            <input type="number" min={limits.max_members_basic} step="1" value={limits.max_members_pro} onChange={e => setLimits(old => ({ ...old, max_members_pro: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-semibold text-brand-primary" />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trial duration (days)</span>
            <input type="number" min="0" max="90" step="1" value={limits.trial_days} onChange={e => setLimits(old => ({ ...old, trial_days: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-semibold text-brand-primary" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving || loadFailed} className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-sm shadow-brand-primary/20 disabled:opacity-70">
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
