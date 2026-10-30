import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Loader2, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

type Props = { scope: 'platform' | 'church'; churchId?: string; role: string };
type Provider = 'mpesa' | 'mobiwave';
type Config = { environment: 'sandbox' | 'production'; shortcode: string; transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline'; accountReference: string; senderId: string };

const blank: Config = { environment: 'sandbox', shortcode: '', transactionType: 'CustomerPayBillOnline', accountReference: 'IMANI', senderId: '' };

async function call(action: string, scope: Props['scope'], churchId: string | undefined, provider: Provider, settings?: object, credentials?: object) {
  const { data, error } = await supabase.functions.invoke('integration-settings', {
    body: { action, scope, churchId: scope === 'church' ? churchId : null, provider, settings, credentials },
  });
  if (error) throw new Error(error.message || 'Integration request failed.');
  if (data?.error) throw new Error(data.error);
  return data;
}

const IntegrationSettingsPanel: React.FC<Props> = ({ scope, churchId, role }) => {
  const canMpesa = scope === 'platform' ? role === 'SUPER_ADMIN' : ['ADMIN', 'TREASURER'].includes(role);
  const canSms = scope === 'platform' ? role === 'SUPER_ADMIN' : ['ADMIN', 'PASTOR', 'SECRETARY'].includes(role);
  const [config, setConfig] = useState<Config>(blank);
  const [secrets, setSecrets] = useState<Record<Provider, Record<string, string>>>({ mpesa: {}, mobiwave: {} });
  const [configured, setConfigured] = useState<Record<Provider, boolean>>({ mpesa: false, mobiwave: false });
  const [status, setStatus] = useState<Record<Provider, string>>({ mpesa: '', mobiwave: '' });
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    void Promise.all((['mpesa', 'mobiwave'] as Provider[]).map(async provider => {
      if (provider === 'mpesa' ? !canMpesa : !canSms) return;
      const data = await call('get', scope, churchId, provider);
      if (!alive) return;
      setConfigured(old => ({ ...old, [provider]: Boolean(data.configured) }));
      if (provider === 'mpesa') setConfig(old => ({ ...old, ...data.settings }));
      else setConfig(old => ({ ...old, senderId: data.settings?.senderId || '' }));
    })).catch(() => { if (alive) setError('Could not load integration settings. Check your connection and access.'); });
    return () => { alive = false; };
  }, [scope, churchId, canMpesa, canSms]);

  const updateSecret = (provider: Provider, key: string, value: string) => setSecrets(old => ({ ...old, [provider]: { ...old[provider], [key]: value } }));
  const settingsFor = (provider: Provider) => provider === 'mpesa'
    ? { environment: config.environment, shortcode: config.shortcode, transactionType: config.transactionType, accountReference: config.accountReference }
    : { senderId: config.senderId };

  const save = async (provider: Provider) => {
    setBusy(provider); setError(''); setStatus(old => ({ ...old, [provider]: '' }));
    try {
      await call('save', scope, churchId, provider, settingsFor(provider), secrets[provider]);
      setConfigured(old => ({ ...old, [provider]: true }));
      setSecrets(old => ({ ...old, [provider]: {} }));
      setStatus(old => ({ ...old, [provider]: 'Saved securely in Supabase Vault.' }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save integration settings.'); }
    finally { setBusy(null); }
  };
  const test = async (provider: Provider) => {
    setBusy(provider); setError(''); setStatus(old => ({ ...old, [provider]: '' }));
    try {
      const result = await call('test', scope, churchId, provider);
      setStatus(old => ({ ...old, [provider]: result.message || (result.connected ? 'Connection verified.' : 'Provider did not accept these credentials.') }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection check failed.'); }
    finally { setBusy(null); }
  };

  const input = (label: string, value: string, onChange: (value: string) => void, type = 'text', placeholder = '') => <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700">{label}</span><input type={type} autoComplete="new-password" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>;
  const actions = (provider: Provider) => <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button disabled={busy !== null} onClick={() => void save(provider)} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === provider ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save credentials</button><button disabled={!configured[provider] || busy !== null} onClick={() => void test(provider)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">{busy === provider ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />} Test connection</button>{configured[provider] && <span className="inline-flex items-center gap-1.5 self-center text-xs font-medium text-emerald-700"><CheckCircle2 size={15} /> Credentials saved</span>}</div>;

  return <section className="space-y-5" aria-label="Provider integrations">
    <header><h2 className="text-xl font-bold text-slate-900">Provider integrations</h2><p className="mt-1 text-sm text-slate-600">{scope === 'platform' ? 'Platform credentials, isolated from every client workspace.' : 'Credentials apply only to this church workspace.'} Secrets are stored in Supabase Vault and never displayed after saving.</p></header>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {canMpesa && <article className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-slate-900">M-Pesa Daraja</h3><p className="mt-1 text-sm text-slate-600">Configure credentials and environment. Connection test checks OAuth only; it does not initiate a payment.</p></div><ShieldCheck className="shrink-0 text-slate-500" /></div><div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700">Environment</span><select value={config.environment} onChange={e => setConfig({ ...config, environment: e.target.value as Config['environment'] })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="sandbox">Sandbox</option><option value="production">Production</option></select></label>{input('Shortcode', config.shortcode, v => setConfig({ ...config, shortcode: v }), 'text', 'Paybill or till number')}{input('Consumer key', secrets.mpesa.consumerKey || '', v => updateSecret('mpesa', 'consumerKey', v), 'password', configured.mpesa ? 'Saved; leave blank to keep' : '')}{input('Consumer secret', secrets.mpesa.consumerSecret || '', v => updateSecret('mpesa', 'consumerSecret', v), 'password', configured.mpesa ? 'Saved; leave blank to keep' : '')}{input('LNM passkey', secrets.mpesa.passkey || '', v => updateSecret('mpesa', 'passkey', v), 'password', configured.mpesa ? 'Saved; leave blank to keep' : '')}{input('Account reference', config.accountReference, v => setConfig({ ...config, accountReference: v }))}<label className="block space-y-1.5 sm:col-span-2"><span className="text-xs font-semibold text-slate-700">Transaction type</span><select value={config.transactionType} onChange={e => setConfig({ ...config, transactionType: e.target.value as Config['transactionType'] })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="CustomerPayBillOnline">Paybill</option><option value="CustomerBuyGoodsOnline">Buy goods</option></select></label></div>{status.mpesa && <p role="status" className="text-sm text-slate-600">{status.mpesa}</p>}{actions('mpesa')}</article>}
    {canSms && <article className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div><h3 className="font-bold text-slate-900">MobiWave SMS</h3><p className="mt-1 text-sm text-slate-600">Connection test reads provider account information. It does not send a message.</p></div><div className="grid gap-4 sm:grid-cols-2">{input('API token', secrets.mobiwave.apiToken || '', v => updateSecret('mobiwave', 'apiToken', v), 'password', configured.mobiwave ? 'Saved; leave blank to keep' : '')}{input('Sender ID', config.senderId, v => setConfig({ ...config, senderId: v }), 'text', 'Up to 11 letters or numbers')}</div>{status.mobiwave && <p role="status" className="text-sm text-slate-600">{status.mobiwave}</p>}{actions('mobiwave')}</article>}
    {!canMpesa && !canSms && <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Your role cannot manage provider credentials.</p>}
  </section>;
};

export default IntegrationSettingsPanel;
