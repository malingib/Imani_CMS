import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Invitation {
  id: string;
  churchId: string;
  email: string;
  role: string;
  expiresAt?: string;
  acceptedAt?: string | null;
  churchName?: string;
}

interface InvitationsManagerProps {
  invitations: Invitation[];
  churches: { id: string; name: string }[];
  onSendInvite: (data: { churchId: string; email: string; role: string }) => void;
}

const InvitationsManager: React.FC<InvitationsManagerProps> = ({ invitations, churches, onSendInvite }) => {
  const [showSend, setShowSend] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [churchId, setChurchId] = useState(churches[0]?.id ?? '');

  const sendInvite = () => {
    if (!email || !churchId) return;
    onSendInvite({ churchId, email, role });
    setShowSend(false);
    setEmail('');
  };

  const statusIcon = (inv: Invitation) => {
    if (inv.acceptedAt) return <CheckCircle2 size={16} className="text-green-500" />;
    if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-amber-400" />;
  };

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
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              {statusIcon(inv)}
              <div>
                <p className="font-bold text-sm text-slate-800">{inv.email}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">{inv.churchName} · {inv.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showSend && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowSend(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-brand-primary mb-6">Send Invitation</h2>
            <div className="space-y-4">
              <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={churchId} onChange={(e) => setChurchId(e.target.value)}>
                {churches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="email" placeholder="email@church.org" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                {['ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={sendInvite} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsManager;
