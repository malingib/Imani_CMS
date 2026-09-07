import type { SupabaseClient } from '@supabase/supabase-js';

export type ChurchProfile = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website?: string | null;
  tier: string;
  status: string;
  trial_end_date: string | null;
  onboarding_step: string | null;
};

export type MembershipAdminRow = {
  id: string;
  user_id: string;
  church_id: string;
  role: 'ADMIN' | 'PASTOR' | 'STAFF' | 'MEMBER';
  status: 'active' | 'suspended';
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type InvitationRole = MembershipAdminRow['role'];

export function createChurchAdministrationService(client: SupabaseClient) {
  return {
    async getChurch(churchId: string): Promise<ChurchProfile> {
      const { data, error } = await client.from('churches').select('*').eq('id', churchId).single();
      if (error) throw new Error(error.message);
      return data as ChurchProfile;
    },

    async updateProfile(input: {
      churchId: string;
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      logoUrl?: string;
    }): Promise<ChurchProfile> {
      const { data, error } = await client.rpc('admin_update_church_profile', {
        p_church_id: input.churchId,
        p_name: input.name,
        p_address: input.address ?? null,
        p_phone: input.phone ?? null,
        p_email: input.email ?? null,
        p_website: input.website ?? null,
        p_logo_url: input.logoUrl ?? null,
      });
      if (error) throw new Error(error.message);
      return data as ChurchProfile;
    },

    async setOnboardingStep(churchId: string, step: 'welcome' | 'profile' | 'team' | 'preferences' | 'complete'): Promise<ChurchProfile> {
      const { data, error } = await client.rpc('admin_set_onboarding_step', {
        p_church_id: churchId,
        p_step: step,
      });
      if (error) throw new Error(error.message);
      return data as ChurchProfile;
    },

    async listMemberships(churchId: string): Promise<MembershipAdminRow[]> {
      const { data, error } = await client.rpc('admin_list_church_memberships', { p_church_id: churchId });
      if (error) throw new Error(error.message);
      return (data ?? []) as MembershipAdminRow[];
    },

    async createInvitation(input: {
      churchId: string;
      email: string;
      role: InvitationRole;
      expiresDays?: number;
    }) {
      const { data, error } = await client.rpc('admin_create_church_invitation', {
        p_church_id: input.churchId,
        p_email: input.email.trim().toLowerCase(),
        p_role: input.role,
        p_expires_days: input.expiresDays ?? 7,
      });
      if (error) throw new Error(error.message);
      return data;
    },

    async setRole(membershipId: string, role: MembershipAdminRow['role']) {
      const { data, error } = await client.rpc('admin_set_membership_role', { p_membership_id: membershipId, p_role: role });
      if (error) throw new Error(error.message);
      return data as MembershipAdminRow;
    },

    async setStatus(membershipId: string, status: MembershipAdminRow['status']) {
      const { data, error } = await client.rpc('admin_set_membership_status', { p_membership_id: membershipId, p_status: status });
      if (error) throw new Error(error.message);
      return data as MembershipAdminRow;
    },
  };
}
