type SupabaseLikeClient = { from(table: string): any };

export type PlatformFlags = {
  sms_integration: boolean;
  ai_features: boolean;
  allow_self_signup: boolean;
  maintenance_mode: boolean;
};

export const DEFAULT_PLATFORM_FLAGS: PlatformFlags = {
  sms_integration: true,
  ai_features: true,
  allow_self_signup: false,
  maintenance_mode: false,
};

export function createPlatformSettingsService(client: SupabaseLikeClient) {
  return {
    async getPlatformSettings(): Promise<{ id?: string; flags: PlatformFlags }> {
      const { data, error } = await client.from('platform_settings').select('*').single();
      if (error && data == null) {
        return { flags: DEFAULT_PLATFORM_FLAGS };
      }
      return {
        ...(data || {}),
        flags: { ...DEFAULT_PLATFORM_FLAGS, ...(data?.flags || {}) },
      };
    },

    async savePlatformSettings(flags: PlatformFlags): Promise<void> {
      const current = await this.getPlatformSettings();
      const mergedFlags = { ...(current.flags || {}), ...flags } as Record<string, unknown>;
      const { error } = await client.from('platform_settings').upsert({ id: 'global', flags: mergedFlags }, { onConflict: 'id' });
      if (error) throw new Error(error.message);
    },

    async getSetting<T>(key: string, fallback: T): Promise<T> {
      const settings = await this.getPlatformSettings();
      const value = (settings.flags as Record<string, unknown> | undefined)?.[key];
      return (value as T | undefined) ?? fallback;
    },

    async saveSetting<T>(key: string, value: T): Promise<void> {
      const settings = await this.getPlatformSettings();
      const mergedFlags = { ...(settings.flags || {}), [key]: value } as Record<string, unknown>;
      const { error } = await client.from('platform_settings').upsert({ id: 'global', flags: mergedFlags }, { onConflict: 'id' });
      if (error) throw new Error(error.message);
    },
  };
}
