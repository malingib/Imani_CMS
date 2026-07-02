type SupabaseLikeClient = { from(table: string): any };
import { attachMemberCounts, createChurchSlug, provisionTenantChurch } from './tenant-provisioning';

export type ChurchRecord = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  tier: string;
  status: string;
  created_at: string;
  trial_end_date?: string;
  onboarding_step?: string;
  memberCount?: number;
};

type CreateChurchInput = {
  name: string;
  slug?: string;
  tier: string;
  adminEmail?: string;
};

export function createTenantsService(client: SupabaseLikeClient) {
  return {
    async listChurchesWithMemberCounts(): Promise<ChurchRecord[]> {
      const { data, error } = await client.from('churches').select('*').order('name');
      if (error) throw new Error(error.message);
      return attachMemberCounts(client, (data || []) as ChurchRecord[]) as Promise<ChurchRecord[]>;
    },

    async createChurchWithDefaults(input: CreateChurchInput): Promise<ChurchRecord> {
      return await provisionTenantChurch(client, input) as ChurchRecord;
    },

    async toggleChurchStatus(church: Pick<ChurchRecord, 'id' | 'status'>): Promise<void> {
      const status = church.status === 'active' ? 'suspended' : 'active';
      const { error } = await client.from('churches').update({ status }).eq('id', church.id);
      if (error) throw new Error(error.message);
    },
  };
}
