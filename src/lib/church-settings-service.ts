type QueryResult<T> = { data: T | null; error: { message: string; code?: string } | null };
type SupabaseLikeClient = {
  from(table: string): any;
  rpc(name: string, args: Record<string, unknown>): PromiseLike<QueryResult<unknown>>;
};

export type ChurchProfile = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

export type ChurchNotificationPreferences = {
  memberJoinsEmail: boolean;
  memberJoinsSMS: boolean;
  eventRemindersEmail: boolean;
  eventRemindersSMS: boolean;
  mpesaConfirmationsSMS: boolean;
  mpesaConfirmationsEmail: boolean;
};

export const DEFAULT_CHURCH_NOTIFICATION_PREFERENCES: ChurchNotificationPreferences = {
  memberJoinsEmail: true,
  memberJoinsSMS: false,
  eventRemindersEmail: true,
  eventRemindersSMS: true,
  mpesaConfirmationsSMS: true,
  mpesaConfirmationsEmail: true,
};

export const EMPTY_CHURCH_PROFILE: ChurchProfile = {
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
};

export function createChurchSettingsService(client: SupabaseLikeClient) {
  return {
    async getChurchProfile(churchId: string): Promise<ChurchProfile> {
      const { data, error } = await client
        .from('churches')
        .select('name,address,phone,email,website')
        .eq('id', churchId)
        .single();
      if (error) throw new Error(error.message);
      return {
        name: data?.name || '',
        address: data?.address || '',
        phone: data?.phone || '',
        email: data?.email || '',
        website: data?.website || '',
      };
    },

    async saveChurchProfile(churchId: string, profile: ChurchProfile): Promise<void> {
      const { error } = await client.rpc('church_update_profile', {
        p_church_id: churchId,
        p_name: profile.name.trim(),
        p_address: profile.address.trim(),
        p_phone: profile.phone.trim(),
        p_email: profile.email.trim(),
        p_website: profile.website.trim(),
      });
      if (error) throw new Error(error.message);
    },

    async getNotificationPreferences(churchId: string): Promise<ChurchNotificationPreferences> {
      const { data, error } = await client
        .from('church_settings')
        .select('notification_preferences')
        .eq('church_id', churchId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return {
        ...DEFAULT_CHURCH_NOTIFICATION_PREFERENCES,
        ...(data?.notification_preferences || {}),
      };
    },

    async saveNotificationPreferences(
      churchId: string,
      preferences: ChurchNotificationPreferences,
    ): Promise<void> {
      const { error } = await client
        .from('church_settings')
        .upsert(
          { church_id: churchId, notification_preferences: preferences },
          { onConflict: 'church_id' },
        );
      if (error) throw new Error(error.message);
    },
  };
}
