type SupabaseLikeClient = { from(table: string): any };

import { sendInviteEmail } from './emailService';

export type InvitationRecord = {
  id: string;
  church_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  church_name?: string;
};

export type ChurchOption = { id: string; name: string };

export function createInvitationsService(client: SupabaseLikeClient) {
  return {
    async listInvitationsWithChurchNames(): Promise<InvitationRecord[]> {
      const { data, error } = await client.from('invitations').select('*, churches(name)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((invitation: any) => ({ ...invitation, church_name: invitation.churches?.name }));
    },

    async listChurchOptions(): Promise<ChurchOption[]> {
      const { data, error } = await client.from('churches').select('id, name').order('name');
      if (error) throw new Error(error.message);
      return (data || []) as ChurchOption[];
    },

    async sendInvitation(input: { churchId: string; email: string; role: string }): Promise<void> {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await client.from('invitations').insert([{
        church_id: input.churchId,
        email: input.email,
        role: input.role,
        token,
        expires_at: expiresAt,
      }]);
      if (error) throw new Error(error.message);

      try {
        const inserted = Array.isArray(data) && data[0] ? data[0] : undefined;
        const inviteToken = inserted?.token ?? token;
        const churchName = inserted?.church_name ?? undefined;
        const origin = (typeof window !== 'undefined' && (window.location as any)?.origin) || (import.meta.env.VITE_APP_URL as string) || '';
        const inviteLink = origin ? `${origin}/accept-invite?token=${inviteToken}` : '';

        await sendInviteEmail({ to_email: input.email, token: inviteToken, church_name: churchName, role: input.role, invite_link: inviteLink });
      } catch (err) {
        console.error('failed to send invite email', err);
      }
    },

    async resendInvitation(id: string): Promise<void> {
      const { data, error } = await client.from('invitations').select('*, churches(name)').eq('id', id).single();
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Invitation not found');
      if (data.accepted_at) throw new Error('Cannot resend an accepted invitation');

      const newToken = crypto.randomUUID();
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error: updateError } = await client.from('invitations').update({
        token: newToken,
        expires_at: newExpiresAt,
      }).eq('id', id);
      if (updateError) throw new Error(updateError.message);

      const churchName = (data as any).churches?.name;
      const origin = (typeof window !== 'undefined' && (window.location as any)?.origin) || (import.meta.env.VITE_APP_URL as string) || '';
      const inviteLink = origin ? `${origin}/accept-invite?token=${newToken}` : '';

      await sendInviteEmail({
        to_email: data.email,
        token: newToken,
        church_name: churchName,
        role: data.role,
        invite_link: inviteLink,
      });
    },

    async cancelInvitation(id: string): Promise<void> {
      const { error } = await client.from('invitations').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    getInvitationStatus(invitation: InvitationRecord): 'Accepted' | 'Expired' | 'Pending' {
      if (invitation.accepted_at) return 'Accepted';
      if (new Date(invitation.expires_at) < new Date()) return 'Expired';
      return 'Pending';
    },
  };
}
