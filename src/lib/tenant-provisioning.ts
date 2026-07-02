type SupabaseLikeClient = { from(table: string): any };

export type ProvisionTenantInput = {
  name: string;
  slug?: string;
  tier: string;
  adminEmail?: string;
  onboardingStep?: string;
};

export type ProvisionedChurchRow = Record<string, unknown>;

export function createChurchSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getTrialEnd(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function provisionTenantChurch(client: SupabaseLikeClient, input: ProvisionTenantInput): Promise<ProvisionedChurchRow> {
  const name = input.name.trim();
  if (!name) throw new Error('Church name is required');

  const slug = input.slug?.trim() || createChurchSlug(name);
  if (!slug) throw new Error('Invalid church name');

  const { data: existing, error: existingError } = await client.from('churches').select('id').eq('slug', slug).maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) throw new Error(`A church with slug "${slug}" already exists`);

  const trialEnd = getTrialEnd();
  const churchRow = {
    name,
    slug,
    tier: input.tier,
    status: 'trialing',
    trial_end_date: trialEnd,
    onboarding_step: input.onboardingStep || 'welcome',
  };

  const { data, error } = await client.from('churches').insert([churchRow]).select();
  if (error) throw new Error(error.message);
  const church = data?.[0] as ProvisionedChurchRow | undefined;
  if (!church) throw new Error('Failed to create church');

  try {
    const { error: subscriptionError } = await client.from('subscriptions').insert([{ church_id: church.id, tier: input.tier, status: 'trialing', start_date: new Date().toISOString(), end_date: trialEnd }]);
    if (subscriptionError) throw subscriptionError;

    if (input.adminEmail?.trim()) {
      const { error: invitationError } = await client.from('invitations').insert([{ 
        church_id: church.id,
        email: input.adminEmail.trim(),
        role: 'ADMIN',
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }]);
      if (invitationError) throw invitationError;
    }
  } catch (error) {
    await client.from('churches').delete().eq('id', church.id);
    throw error;
  }

  return church;
}

export async function attachMemberCounts<T extends Record<string, unknown>>(client: SupabaseLikeClient, churches: T[]): Promise<(T & { memberCount: number })[]> {
  return Promise.all(
    churches.map(async (church) => {
      if (typeof church.member_count === 'number') {
        return { ...church, memberCount: church.member_count as number };
      }

      const { count, error } = await client.from('members').select('*', { count: 'exact', head: true }).eq('church_id', church.id);
      if (error) throw new Error(error.message);
      return { ...church, memberCount: count || 0 };
    })
  );
}
