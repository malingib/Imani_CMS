import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { createInvitationsService, type ChurchOption, type InvitationRecord } from '../src/lib/invitations-service';
import { Mail, Send, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

const invitationsService = createInvitationsService(supabase);

const InvitationsManager: React.FC = () => {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [showSend, setShowSend] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [churchId, setChurchId] = useState('');
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const fetch = async () => {
    const [nextInvitations, nextChurches] = await Promise.all([
      invitationsService.listInvitationsWithChurchNames(),
      invitationsService.listChurchOptions(),
    ]);
    setInvitations(nextInvitations);
    setChurches(nextChurches);
    if (!churchId && nextChurches.length > 0) setChurchId(nextChurches[0].id);
  };

  useEffect(() => { fetch(); }, []);

  const sendInvite = async () => {
    if (!email || !churchId) return;
    setSending(true);
    try {
      await invitationsService.sendInvitation({ churchId, email, role });
      setShowSend(false);
      setEmail('');
      await fetch();
    } finally {
      setSending(false);
    }
  };

  const cancelInvite = async (id: string) => {
    await invitationsService.cancelInvitation(id);
    fetch();
  };

  const resendInvite = async (id: string) => {
    setResending(id);
    try {
      await invitationsService.resendInvitation(id);
      await fetch();
    } finally {
      setResending(null);
    }
  };

  const statusIcon = (inv: InvitationRecord) => {
    if (inv.accepted_at) return <CheckCircle2 size={16} className="text-green-500" />;
    if (new Date(inv.expires_at) < new Date()) return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-amber-400" />;
  };

  const statusLabel = (inv: InvitationRecord) => invitationsService.getInvitationStatus(inv);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight">Invitations</h1>
          <p className="text-slate-500 font-medium mt-1">{invitations.length} sent</p>
        </div>
        <button onClick={() => setShowSend(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
          <Send size={18} /> Send Invite
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {invitations.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold text-slate-400">No invitations sent yet</p>
            <p className="text-xs text-slate-400 mt-1">Invite church admins to join the platform</p>
          </div>
        ) : (
          invitations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-4">
                {statusIcon(inv)}
                <div>
                  <p className="font-bold text-sm text-slate-800">{inv.email}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {inv.church_name || 'Unknown'} · {inv.role} · {statusLabel(inv)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold">
                  {new Date(inv.created_at).toLocaleDateString()}
                </span>
                {!inv.accepted_at && (
                  <>
                    <button onClick={() => resendInvite(inv.id)} disabled={resending === inv.id} className="text-brand-primary hover:text-brand-primary/80 text-[10px] font-black uppercase disabled:opacity-40">
                      {resending === inv.id ? 'Sending...' : 'Resend'}
                    </button>
                    <button onClick={() => cancelInvite(inv.id)} className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showSend && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowSend(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-brand-primary mb-6">Send Invitation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Church</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={churchId} onChange={(e) => setChurchId(e.target.value)}>
                  {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@church.org" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Role</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-indigo outline-none" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="ADMIN">Admin</option>
                  <option value="PASTOR">Pastor</option>
                  <option value="TREASURER">Treasurer</option>
                  <option value="SECRETARY">Secretary</option>
                </select>
              </div>
              <button onClick={sendInvite} disabled={sending} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
                {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                {sending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsManager;
