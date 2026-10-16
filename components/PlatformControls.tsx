import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, BellRing, CheckCircle2, CreditCard, LoaderCircle, RefreshCw, Save, ShieldAlert, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useChurch } from '../src/lib/church-context';

type ChurchControl = {
  id: string; name: string; tier: string; status: string; billing_status: string;
  monthly_fee: number; billing_currency: string; billing_period_end: string | null;
  suspended_at: string | null; suspension_reason: string | null; restrictions: Record<string, boolean>;
  minimum_client_version: string | null; latest_client_version: string | null;
};
type Release = { id: string; version: string; title: string; notes: string; release_channel: string; status: string; published_at: string | null; created_at: string };
type ActivityLog = { id: string; action: string; user_name: string; module: string; severity: string; timestamp: string; metadata: Record<string, unknown> | null };

const RESTRICTIONS = [
  { key: 'members', label: 'Membership management', description: 'Create, edit, import and export member records.' },
  { key: 'finance', label: 'Finance and giving', description: 'Transactions, budgets, giving and financial reports.' },
  { key: 'communications', label: 'Communications', description: 'Church-wide announcements and messaging tools.' },
  { key: 'events', label: 'Events and groups', description: 'Manage events, attendance and ministry groups.' },
  { key: 'exports', label: 'Data exports', description: 'Download CSV and report exports.' },
  { key: 'ai', label: 'AI features', description: 'AI-assisted features and generated content.' },
] as const;

const PlatformControls: React.FC = () => {
  const { activeChurchId } = useChurch();
  const [church, setChurch] = useState<ChurchControl | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);\n  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fee, setFee] = useState('0');
  const [billingStatus, setBillingStatus] = useState('trial');
  const [tier, setTier] = useState('basic');
  const [billingDate, setBillingDate] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [version, setVersion] = useState('');
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releaseChannel, setReleaseChannel] = useState('stable');
  const [releaseStatus, setReleaseStatus] = useState('draft');

  const load = useCallback(async () => {
    setLoading(true); setError(''); setNotice('');
    try {
      if (activeChurchId) {
        const { data, error: churchError } = await supabase.from('churches').select('id,name,tier,status,billing_status,monthly_fee,billing_currency,billing_period_end,suspended_at,suspension_reason,restrictions,minimum_client_version,latest_client_version').eq('id', activeChurchId).single();
        if (churchError) throw churchError;
        const c = data as ChurchControl;
        setChurch(c); setFee(String(c.monthly_fee ?? 0)); setBillingStatus(c.billing_status || 'trial'); setTier(c.tier || 'basic');
        setBillingDate(c.billing_period_end ? c.billing_period_end.slice(0,10) : '');
        setSuspensionReason(c.suspension_reason || '');
      }
      const { data: releaseData, error: releaseError } = await supabase.from('platform_releases').select('*').order('created_at', { ascending: false });
      if (releaseError) throw releaseError;
      setReleases((releaseData || []) as Release[]);
      if (activeChurchId) {
        const { data: activityData, error: activityError } = await supabase.from('audit_logs').select('id,action,user_name,module,severity,timestamp,metadata').eq('church_id', activeChurchId).order('timestamp', { ascending: false }).limit(50);
        if (activityError) throw activityError;
        setActivity((activityData || []) as ActivityLog[]);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load platform controls.'); }
    finally { setLoading(false); }
  }, [activeChurchId]);

  useEffect(() => { void load(); }, [load]);

  const recordAudit = async (action: string, metadata: Record<string, unknown>) => {
    if (!church) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        church_id: church.id, user_id: user?.id ?? null,
        user_name: user?.email ?? 'Superadmin', action,
        module: 'PLATFORM_SETTINGS', severity: 'WARN', metadata,
      });
    } catch (auditError) {
      console.warn('Platform action audit could not be written', auditError);
    }
  };

  const saveChurch = async (patch: Record<string, unknown>, message: string) => {
    if (!church) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase.from('churches').update(patch).eq('id', church.id);
      if (updateError) throw updateError;
      await recordAudit(message, patch);
      setNotice(message); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'The change could not be saved.'); }
    finally { setSaving(false); }
  };

  const saveBilling = () => saveChurch({
    tier, billing_status: billingStatus, monthly_fee: Number(fee),
    billing_period_end: billingDate ? new Date(billingDate + 'T23:59:59').toISOString() : null,
  }, 'Billing settings saved.');
  const toggleRestriction = (key: string, value: boolean) => {
    if (!church) return;
    void saveChurch({ restrictions: { ...(church.restrictions || {}), [key]: value } }, 'Restriction updated.');
  };
  const suspend = () => saveChurch({ status: 'suspended', suspended_at: new Date().toISOString(), suspension_reason: suspensionReason.trim() || 'Suspended by platform administrator' }, 'Client access suspended.');
  const reactivate = () => saveChurch({ status: 'active', suspended_at: null, suspension_reason: null }, 'Client access reactivated.');

  const publishRelease = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from('platform_releases').insert({
        version: version.trim(), title: releaseTitle.trim(), notes: releaseNotes.trim(),
        release_channel: releaseChannel, status: releaseStatus,
        published_at: releaseStatus === 'draft' ? null : new Date().toISOString(), created_by: user?.id || null,
      });
      if (insertError) throw insertError;
      if (church) await recordAudit('Platform release record saved', { version: version.trim(), title: releaseTitle.trim(), release_channel: releaseChannel, status: releaseStatus });
      setVersion(''); setReleaseTitle(''); setReleaseNotes(''); setNotice('Release record saved.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Release could not be saved.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-3 p-10 text-slate-500"><LoaderCircle className="animate-spin" />Loading platform controls…</div>;
  if (!church) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No configured Demo Church record is available. Check the deployment church ID and permissions.</div>;

  const path = window.location.pathname;
  const section = path.includes('/billing') ? 'billing' : path.includes('/restrictions') ? 'restrictions' : path.includes('/suspensions') ? 'suspensions' : path.includes('/updates') ? 'updates' : path.includes('/activity') ? 'activity' : 'billing';
  const heading = section === 'billing' ? 'Billing & Plans' : section === 'restrictions' ? 'Feature Restrictions' : section === 'suspensions' ? 'Suspensions & Access' : section === 'activity' ? 'Audit & Activity' : 'Platform Updates';

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Platform controls / {church.name}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-brand-primary">{heading}</h1><p className="mt-2 text-sm text-slate-500">Manage the configured client without mixing these controls into church operations.</p></div>
      <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"><RefreshCw size={16}/> Refresh</button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={17}/>{notice}</div>}
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className={`h-2.5 w-2.5 rounded-full ${church.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`}/>
      <strong className="text-sm">{church.name}</strong><span className="text-xs text-slate-500">Plan: {church.tier}</span><span className="text-xs text-slate-500">Status: {church.status}</span><span className="text-xs text-slate-500">Billing: {church.billing_status}</span>
    </div>

    {section === 'billing' && <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><CreditCard className="text-brand-primary"/><div><h2 className="font-black">Subscription and billing</h2><p className="text-sm text-slate-500">Set the commercial plan and billing cycle for Demo Church.</p></div></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Plan<select value={tier} onChange={e=>setTier(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label>
        <label className="space-y-2 text-sm font-semibold">Billing status<select value={billingStatus} onChange={e=>setBillingStatus(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"><option value="trial">Trial</option><option value="active">Active / paid</option><option value="past_due">Past due</option><option value="grace_period">Grace period</option><option value="cancelled">Cancelled</option></select></label>
        <label className="space-y-2 text-sm font-semibold">Monthly fee (KES)<input type="number" min="0" step="1" value={fee} onChange={e=>setFee(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"/></label>
        <label className="space-y-2 text-sm font-semibold">Paid through / billing period end<input type="date" value={billingDate} onChange={e=>setBillingDate(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"/></label>
      </div>
      <button disabled={saving} onClick={saveBilling} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/> Save billing settings</button>
    </div>}

    {section === 'restrictions' && <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><SlidersHorizontal className="text-brand-primary"/><div><h2 className="font-black">Feature access restrictions</h2><p className="text-sm text-slate-500">Turn off specific modules for the client. Restrictions are saved against the church record.</p></div></div>
      <div className="divide-y divide-slate-100">{RESTRICTIONS.map(item=><div key={item.key} className="flex items-center justify-between gap-5 py-4"><div><p className="font-bold text-sm">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.description}</p></div><button role="switch" aria-checked={church.restrictions?.[item.key] !== false} disabled={saving} onClick={()=>toggleRestriction(item.key, church.restrictions?.[item.key] === false)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${church.restrictions?.[item.key] !== false ? 'bg-emerald-600' : 'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${church.restrictions?.[item.key] !== false ? 'left-6' : 'left-1'}`}/></button></div>)}</div>
      <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">These switches currently gate the related modules in the church interface. Treat them as operational controls, not a complete security boundary, until the matching database policies and export/API paths are separately tested.</p>
    </div>}

    {section === 'suspensions' && <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><ShieldAlert className="text-rose-600"/><div><h2 className="font-black">Suspend or restore client access</h2><p className="text-sm text-slate-500">Use for non-payment, security concerns or a requested service pause.</p></div></div>
      {church.status === 'suspended' ? <div className="space-y-4"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="font-bold text-rose-800">Access is currently suspended</p><p className="mt-1 text-sm text-rose-700">{church.suspension_reason || 'No reason recorded.'}</p>{church.suspended_at && <p className="mt-1 text-xs text-rose-600">Since {new Date(church.suspended_at).toLocaleString()}</p>}</div><button disabled={saving} onClick={reactivate} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={16}/> Restore access</button></div> : <div className="space-y-4"><label className="block space-y-2 text-sm font-semibold">Reason for suspension<textarea value={suspensionReason} onChange={e=>setSuspensionReason(e.target.value)} rows={3} placeholder="e.g. Subscription overdue after grace period" className="w-full rounded-lg border border-slate-200 p-3"/></label><button disabled={saving} onClick={suspend} className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Ban size={16}/> Suspend client access</button></div>}
      <p className="mt-5 text-xs leading-5 text-slate-500">Suspension must be enforced by the app and database access policies, not only by hiding navigation. The superadmin will retain platform access to restore service.</p>
    </div>}

    {section === 'activity' && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5"><h2 className="font-black">Recent platform activity</h2><p className="mt-1 text-sm text-slate-500">Latest audited changes associated with the configured church.</p></div>
      {activity.length === 0 ? <p className="p-6 text-sm text-slate-500">No audit events found for this client yet.</p> : activity.map(item => <div key={item.id} className="flex flex-col gap-2 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{item.action}</strong><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{item.severity}</span></div><p className="mt-1 text-xs text-slate-500">{item.user_name} · {item.module}</p>{item.metadata && <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-400">{JSON.stringify(item.metadata, null, 2)}</pre>}</div><time className="shrink-0 text-xs text-slate-400">{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</time></div>)}
    </div>}

    {section === 'updates' && <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3"><UploadCloud className="text-brand-primary"/><div><h2 className="font-black">Release management</h2><p className="text-sm text-slate-500">Record release notes and mark stable releases as published or required. This does not deploy code; deployments remain managed through GitHub and Vercel.</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">Version<input value={version} onChange={e=>setVersion(e.target.value)} placeholder="e.g. 1.4.0" className="w-full rounded-lg border border-slate-200 p-3"/></label>
          <label className="space-y-2 text-sm font-semibold">Release title<input value={releaseTitle} onChange={e=>setReleaseTitle(e.target.value)} placeholder="Release title" className="w-full rounded-lg border border-slate-200 p-3"/></label>
          <label className="space-y-2 text-sm font-semibold">Channel<select value={releaseChannel} onChange={e=>setReleaseChannel(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"><option value="stable">Stable</option><option value="beta">Beta</option></select></label>
          <label className="space-y-2 text-sm font-semibold">Release state<select value={releaseStatus} onChange={e=>setReleaseStatus(e.target.value)} className="w-full rounded-lg border border-slate-200 p-3"><option value="draft">Draft</option><option value="published">Published</option><option value="required">Required update</option></select></label>
          <label className="space-y-2 text-sm font-semibold sm:col-span-2">Release notes<textarea value={releaseNotes} onChange={e=>setReleaseNotes(e.target.value)} rows={3} placeholder="Fixes, improvements and compatibility notes" className="w-full rounded-lg border border-slate-200 p-3"/></label>
        </div>
        <button disabled={saving || !version.trim() || !releaseTitle.trim()} onClick={publishRelease} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/> Save release</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-black">Release history</h2></div>{releases.length===0 ? <p className="p-6 text-sm text-slate-500">No releases recorded yet.</p> : releases.map(r=><div key={r.id} className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><strong>{r.version} · {r.title}</strong><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{r.status}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{r.release_channel}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{r.notes || 'No notes supplied.'}</p></div><time className="shrink-0 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</time></div>)}</div>
    </div>}
  </div>;
};

export default PlatformControls;
