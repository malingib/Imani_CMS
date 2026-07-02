type SupabaseLikeClient = { from(table: string): any };

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
      const { error } = await client.from('invitations').insert([{
        church_id: input.churchId,
        email: input.email,
        role: input.role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }]);
      if (error) throw new Error(error.message);
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
