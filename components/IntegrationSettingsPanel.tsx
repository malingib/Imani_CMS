import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save, ShieldCheck } from 'lucide-react';
import { getIntegrationConfig, saveIntegrationConfig, type IntegrationProvider, type IntegrationScope } from '../src/lib/integration-config-service';

type Props = { target: IntegrationScope; allowedProviders?: IntegrationProvider[]; title?: string };

const blank = {
  daraja: { enabled: false, configured: false, config: { environment: 'production', shortcode: '', transactionType: 'CustomerPayBillOnline', callbackUrl: '' } },
  mobiwave_sms: { enabled: false, configured: false, config: { apiBaseUrl: '', senderId: '' } },
};

const IntegrationSettingsPanel: React.FC<Props> = ({ target, allowedProviders = ['daraja', 'mobiwave_sms'], title = 'Integrations' }) => {
  const [provider, setProvider] = useState<IntegrationProvider>(allowedProviders[0] || 'daraja');
  const [values, setValues] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    getIntegrationConfig(provider, target).then((result) => {
      if (!active) return;
      const defaults = blank[provider].config;
      setValues({ ...defaults, ...result.config });
      setEnabled(result.enabled); setConfigured(result.configured);
      setSecrets({});
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Unable to load integration.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [provider, target.scope, target.scope === 'church' ? target.churchId : 'platform']);

  const update = (key: string, value: string) => setValues(prev => ({ ...prev, [key]: value }));
  const updateSecret = (key: string, value: string) => setSecrets(prev => ({ ...prev, [key]: value }));

  const fields = provider === 'daraja'
    ? [
      { key: 'environment', label: 'Environment', kind: 'select', options: [{ value: 'production', label: 'Production' }, { value: 'sandbox', label: 'Sandbox' }] },
      { key: 'shortcode', label: 'Business shortcode', kind: 'text' },
      { key: 'transactionType', label: 'Transaction type', kind: 'select', options: [{ value: 'CustomerPayBillOnline', label: 'PayBill' }, { value: 'CustomerBuyGoodsOnline', label: 'Buy Goods / Till' }] },
      { key: 'callbackUrl', label: 'Callback URL', kind: 'text' },
    ]
    : [
      { key: 'apiBaseUrl', label: 'MobiWave SMS API base URL', kind: 'text' },
      { key: 'senderId', label: 'Sender ID', kind: 'text' },
    ];
  const secretFields = provider === 'daraja'
    ? [{ key: 'consumerKey', label: 'Consumer key' }, { key: 'consumerSecret', label: 'Consumer secret' }, { key: 'passkey', label: 'STK passkey' }]
    : [{ key: 'apiKey', label: 'API key / token' }, { key: 'apiSecret', label: 'API secret (if supplied)' }];

  const save = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await saveIntegrationConfig(provider, target, { enabled, config: values, secrets });
      setConfigured(result.configured); setSecrets({});
      setNotice('Integration settings saved securely. Secret values are never returned to this screen.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save integration settings.'); }
    finally { setSaving(false); }
  };

  return <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">Credentials are encrypted server-side and never stored in browser-readable platform settings.</p></div>
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600"><ShieldCheck size={16}/>{configured ? 'Credentials configured' : 'Credentials not configured'}</span>
    </div>
    {allowedProviders.length > 1 && <div className="flex gap-2 border-b border-slate-100 pb-3">
      {allowedProviders.map(p => <button key={p} type="button" onClick={() => setProvider(p)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${provider === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{p === 'daraja' ? 'M-Pesa Daraja' : 'MobiWave SMS'}</button>)}
    </div>}
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    {notice && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={16}/>{notice}</div>}
    {loading ? <div className="flex items-center gap-2 py-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={17}/>Loading secure configuration…</div> : <>
      <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span><span className="block text-sm font-semibold text-slate-800">Enable integration</span><span className="text-xs text-slate-500">Turning this on does not itself initiate live payments or messages.</span></span><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="h-4 w-4"/></label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(field => <label key={field.key} className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">{field.label}</span>{field.kind === 'select' ? <select value={values[field.key] || ''} onChange={e => update(field.key, e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">{((field as any).options || []).map((option: { value: string; label: string }) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input value={values[field.key] || ''} onChange={e => update(field.key, e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder={field.key === 'callbackUrl' ? 'https://…/functions/v1/mpesa-stk' : ''}/>}</label>)}
        {secretFields.map(field => <label key={field.key} className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">{field.label}</span><input type="password" autoComplete="new-password" value={secrets[field.key] || ''} onChange={e => updateSecret(field.key, e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder={configured ? 'Saved securely — enter only to replace' : 'Enter secret value'}/></label>)}
      </div>
      <div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}Save secure settings</button></div>
    </>}
  </section>;
};
export default IntegrationSettingsPanel;