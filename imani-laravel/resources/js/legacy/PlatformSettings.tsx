import React, { useState } from 'react';
import { Save, ToggleLeft, ToggleRight, CheckCircle2, Loader2 } from 'lucide-react';

interface PlatformFlags {
  sms_integration?: boolean;
  ai_features?: boolean;
  allow_self_signup?: boolean;
  maintenance_mode?: boolean;
  [key: string]: boolean | undefined;
}

const DEFAULTS: PlatformFlags = {
  sms_integration: true,
  ai_features: true,
  allow_self_signup: false,
  maintenance_mode: false,
};

interface PlatformSettingsProps {
  flags: PlatformFlags;
  onSave: (flags: PlatformFlags) => void;
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ flags: initialFlags, onSave }) => {
  const [flags, setFlags] = useState<PlatformFlags>({ ...DEFAULTS, ...initialFlags });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = () => {
    setSaving(true);
    onSave(flags);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ToggleSwitch = ({ flag, label, desc }: { flag: string; label: string; desc: string }) => (
    <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100">
      <div>
        <p className="font-black text-brand-primary text-sm">{label}</p>
        <p className="text-xs font-bold text-slate-400 mt-1">{desc}</p>
      </div>
      <button type="button" onClick={() => toggle(flag)} className="text-brand-indigo hover:text-brand-primary transition-colors">
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

      <div className="space-y-4 max-w-2xl">
        <ToggleSwitch flag="sms_integration" label="SMS Integration" desc="Enable SMS broadcasts platform-wide" />
        <ToggleSwitch flag="ai_features" label="AI Features" desc="Enable Gemini-powered ministry tools" />
        <ToggleSwitch flag="allow_self_signup" label="Self Signup" desc="Allow public church registration" />
        <ToggleSwitch flag="maintenance_mode" label="Maintenance Mode" desc="Show maintenance page to non-admins" />
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50">
        {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
        {saved ? 'Saved' : 'Save Settings'}
      </button>
    </div>
  );
};

export default PlatformSettings;
