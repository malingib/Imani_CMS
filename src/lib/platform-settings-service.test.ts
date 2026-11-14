import { describe, expect, it, vi } from 'vitest';
import {
  createPlatformSettingsService,
  DEFAULT_PLATFORM_FLAGS,
  type PlatformLimits,
} from './platform-settings-service';

function mockClient(result: { data: any; error: any }) {
  const query: any = {
    select: vi.fn(() => query),
    single: vi.fn(async () => result),
    upsert: vi.fn(async () => ({ error: null })),
  };
  return { client: { from: vi.fn(() => query) } as any, query };
}

describe('platform settings service', () => {
  it('loads persisted feature flags and surfaces database failures', async () => {
    const { client } = mockClient({ data: null, error: { code: '42501', message: 'permission denied' } });
    const service = createPlatformSettingsService(client);

    await expect(service.getPlatformSettings()).rejects.toThrow('permission denied');
  });

  it('preserves persisted platform limits when saving feature flags', async () => {
    const limits: PlatformLimits = { max_members_basic: 250, max_members_pro: 5000, trial_days: 21 };
    const { client, query } = mockClient({
      data: { id: 'global', flags: { ...DEFAULT_PLATFORM_FLAGS, default_limits: limits } },
      error: null,
    });
    const service = createPlatformSettingsService(client);

    await service.savePlatformSettings({ ...DEFAULT_PLATFORM_FLAGS, sms_integration: false });

    expect(query.upsert).toHaveBeenCalledWith({
      id: 'global',
      flags: { ...DEFAULT_PLATFORM_FLAGS, sms_integration: false, default_limits: limits },
    }, { onConflict: 'id' });
  });
});
