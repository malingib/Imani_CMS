import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, ChevronRight, Loader2, Mail, Save, Shield, UserPlus, Users, X } from 'lucide-react';
import { UserRole } from '../types';
import { createChurchAdministrationService, type ChurchProfile, type InvitationRole, type MembershipAdminRow } from '../src/lib/church-administration-service';
import { supabase } from '../src/lib/supabase';
import Settings from './Settings';

const service = createChurchAdministrationService(supabase);

type Props = { currentUserRole: UserRole; churchId: string };
type AdminTab = 'OVERVIEW' | 'PROFILE' | 'TEAM' | 'SYSTEM';

const STEPS: Array<{ id: ChurchProfile['onboarding_step']; label: string }> = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'profile', label: 'Church profile' },
  { id: 'team', label: 'Team' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'complete', label: 'Complete' },
];

const ROLE_LABELS: Record<InvitationRole, string> = {
  ADMIN: 'Administrator',
  PASTOR: 'Pastor',
  STAFF: 'Staff',
  MEMBER: 'Member',
};

const ChurchAdministration: React.FC<Props> = ({ currentUserRole, churchId }) => {
  const [tab, setTab] = useState<AdminTab>('OVERVIEW');
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [memberships, setMemberships] = useState<MembershipAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InvitationRole>('MEMBER');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', address: '', phone: '', email: '', website: '', logoUrl: '' });

  const isAdmin = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.SUPER_ADMIN;

  const load = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const result = await service.getChurch(churchId);
      setChurch(result);
      setProfile({
        name: result.name || '',
        address: result.address || '',
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        logoUrl: result.logo_url || '',
      });
      if (isAdmin) setMemberships(await service.listMemberships(churchId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load church administration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [churchId, isAdmin]);

  const currentStepIndex = useMemo(() => {
    const index = STEPS.findIndex(step => step.id === (church?.onboarding_step || 'welcome'));
    return index < 0 ? 0 : index;
  }, [church?.onboarding_step]);

  const saveProfile = async () => {
    if (!churchId || !profile.name.trim()) return;
    setSaving(true); setMessage('');
    try {
      const updated = await service.updateProfile({ churchId, name: profile.name.trim(), address: profile.address, phone: profile.phone, email: profile.email, website: profile.website, logoUrl: profile.logoUrl });
      setChurch(updated);
      setMessage('Church profile saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save profile.'); }
    finally { setSaving(false); }
  };

  const advanceOnboarding = async () => {
    if (!churchId) return;
    const next = STEPS[Math.min(currentStepIndex + 1, STEPS.length - 1)].id as 'welcome' | 'profile' | 'team' | 'preferences' | 'complete';
    try { setChurch(await service.setOnboardingStep(churchId, next)); setMessage('Onboarding progress updated.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update onboarding.'); }
  };

  const createInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!churchId || !inviteEmail.trim()) return;
    setInviteSaving(true); setMessage('');
    try {
      await service.createInvitation({ churchId, email: inviteEmail, role: inviteRole, expiresDays: 7 });
      setInviteEmail(''); setInviteRole('MEMBER'); setInviteOpen(false);
      setMessage('Invitation created. The recipient can complete account setup from the invitation link.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to create invitation.'); }
    finally { setInviteSaving(false); }
  };

  const changeRole = async (row: MembershipAdminRow, role: InvitationRole) => {
    try { const updated = await service.setRole(row.id, role); setMemberships(items => items.map(item => item.id === row.id ? updated : item)); setMessage('Membership role updated.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update role.'); }
  };

  const changeStatus = async (row: MembershipAdminRow) => {
    const status = row.status === 'active' ? 'suspended' : 'active';
    try { const updated = await service.setStatus(row.id, status); setMemberships(items => items.map(item => item.id === row.id ? updated : item)); setMessage(status === 'active' ? 'Membership restored.' : 'Membership suspended.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update membership.'); }
  };

  if (!isAdmin) {
    return <Settings currentUserRole={currentUserRole} churchId={churchId} />;
  }

  if (loading) return <div className="p-12 bg-white rounded-[2.5rem] flex items-center gap-3 text-slate-500 font-bold"><Loader2 className="animate-spin" /> Loading church administration…</div>;

  return (
    <div className="space-y-7 max-w-[1300px] mx-auto pb-12">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">Administration</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-2">{church?.name || 'Church administration'}</h2>
        <p className="text-slate-500 font-medium mt-2">Manage your church identity, onboarding, team access, and system configuration.</p>
      </header>

      {message && <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-sm font-bold text-brand-primary flex items-center gap-2"><CheckCircle2 size={18} />{message}</div>}

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {[
          ['OVERVIEW', 'Overview'], ['PROFILE', 'Church profile'], ['TEAM', 'Team & access'], ['SYSTEM', 'System settings'],
        ].map(([id, label]) => <button key={id} onClick={() => setTab(id as AdminTab)} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap ${tab === id ? 'bg-brand-primary text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:border-brand-primary/20'}`}>{label}</button>)}
      </nav>

      {tab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-7 sm:p-10 shadow-sm">
            <div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Onboarding</p><h3 className="text-2xl font-black text-slate-800 mt-2">Build your church workspace</h3></div><Building2 className="text-brand-primary" size={30} /></div>
            <div className="mt-8 space-y-5">{STEPS.map((step, index) => <div key={step.id} className="flex items-center gap-4"><div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${index <= currentStepIndex ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>{index < currentStepIndex ? '✓' : index + 1}</div><div className="flex-1"><p className="font-black text-slate-700">{step.label}</p><div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: index < currentStepIndex ? '100%' : index === currentStepIndex ? '55%' : '0%' }} /></div></div></div>)}</div>
            <button disabled={currentStepIndex >= STEPS.length - 1} onClick={advanceOnboarding} className="mt-8 px-6 py-3 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest disabled:opacity-40 flex items-center gap-2">{currentStepIndex >= STEPS.length - 1 ? 'Setup complete' : 'Continue setup'}<ChevronRight size={16}/></button>
          </section>
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-7 shadow-sm space-y-5"><div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center"><Users /></div><h3 className="text-xl font-black text-slate-800">Team access</h3><p className="text-sm text-slate-500 leading-relaxed">{memberships.filter(m => m.status === 'active').length} active church memberships are provisioned. Invite staff without granting direct database access.</p><button onClick={() => { setTab('TEAM'); setInviteOpen(true); }} className="w-full py-3 rounded-xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><UserPlus size={16}/> Invite a team member</button></section>
        </div>
      )}

      {tab === 'PROFILE' && (
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-7 sm:p-10 shadow-sm space-y-7">
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Church identity</p><h3 className="text-2xl font-black text-slate-800 mt-2">Profile & contact details</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[['name','Church name','text'],['email','Official email','email'],['phone','Phone','text'],['website','Website','url'],['address','Address','text'],['logoUrl','Logo URL','url']].map(([key,label,type]) => <label key={key} className="space-y-2"><span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span><input type={type} value={profile[key as keyof typeof profile]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-sm" /></label>)}
          </div>
          <button onClick={saveProfile} disabled={saving || !profile.name.trim()} className="px-7 py-4 rounded-2xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"><Save size={17}/>{saving ? 'Saving…' : 'Save church profile'}</button>
        </section>
      )}

      {tab === 'TEAM' && (
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authoritative memberships</p><h3 className="text-2xl font-black text-slate-800 mt-2">Team & access</h3></div><button onClick={() => setInviteOpen(true)} className="px-5 py-3 rounded-xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"><UserPlus size={16}/> Invite member</button></div>
          <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400"><tr><th className="px-7 py-4">Person</th><th className="px-7 py-4">Role</th><th className="px-7 py-4">Status</th><th className="px-7 py-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{memberships.map(row => <tr key={row.id}><td className="px-7 py-5"><p className="font-black text-slate-700">{row.name || 'Unnamed user'}</p><p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Mail size={12}/>{row.email || 'No email'}</p></td><td className="px-7 py-5"><select value={row.role} onChange={e => void changeRole(row, e.target.value as InvitationRole)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold bg-white">{(Object.keys(ROLE_LABELS) as InvitationRole[]).map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></td><td className="px-7 py-5"><span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.status}</span></td><td className="px-7 py-5"><button onClick={() => void changeStatus(row)} className="text-xs font-black text-brand-primary">{row.status === 'active' ? 'Suspend' : 'Restore'}</button></td></tr>)}</tbody></table></div>
          {memberships.length === 0 && <div className="p-12 text-center text-slate-400 font-medium">No church memberships found yet.</div>}
        </section>
      )}

      {tab === 'SYSTEM' && <Settings currentUserRole={currentUserRole} churchId={churchId} />}

      {inviteOpen && <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5" onMouseDown={() => setInviteOpen(false)}><form onSubmit={createInvite} onMouseDown={e => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-[2rem] p-7 sm:p-9 shadow-2xl space-y-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team invitation</p><h3 className="text-2xl font-black text-slate-800 mt-1">Invite someone</h3></div><button type="button" onClick={() => setInviteOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X /></button></div><label className="block space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email address</span><input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="person@example.com" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-brand-primary/20" /></label><label className="block space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</span><select value={inviteRole} onChange={e => setInviteRole(e.target.value as InvitationRole)} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold">{(Object.keys(ROLE_LABELS) as InvitationRole[]).map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></label><div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 leading-relaxed flex gap-3"><Shield size={17} className="shrink-0 text-brand-primary"/>Invitation records are created through the protected server-side administration function and audited.</div><button disabled={inviteSaving} className="w-full py-4 rounded-2xl bg-brand-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">{inviteSaving ? <Loader2 className="animate-spin" size={17}/> : <UserPlus size={17}/>} {inviteSaving ? 'Creating invitation…' : 'Create invitation'}</button></form></div>}
    </div>
  );
};

export default ChurchAdministration;
