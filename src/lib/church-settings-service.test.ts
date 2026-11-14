import { describe, expect, it, vi } from 'vitest';
import {
  createChurchSettingsService,
  DEFAULT_CHURCH_NOTIFICATION_PREFERENCES,
} from './church-settings-service';

function makeQuery(result: { data: unknown; error: { message: string; code?: string } | null }) {
  const query: any = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.single = vi.fn(async () => result);
  query.maybeSingle = vi.fn(async () => result);
  query.upsert = vi.fn(async () => result);
  return query;
}

describe('church settings service', () => {
  it('loads the church profile from its church row', async () => {
    const profileQuery = makeQuery({
      data: { name: 'Demo Church', address: 'Kilifi', phone: '0700000000', email: 'office@example.org', website: 'https://example.org' },
      error: null,
    });
    const client = { from: vi.fn(() => profileQuery), rpc: vi.fn() } as any;
    const service = createChurchSettingsService(client);

    await expect(service.getChurchProfile('church-1')).resolves.toEqual({
      name: 'Demo Church',
      address: 'Kilifi',
      phone: '0700000000',
      email: 'office@example.org',
      website: 'https://example.org',
    });
    expect(client.from).toHaveBeenCalledWith('churches');
    expect(profileQuery.eq).toHaveBeenCalledWith('id', 'church-1');
  });

  it('merges stored notification preferences with defaults', async () => {
    const settingsQuery = makeQuery({
      data: { notification_preferences: { memberJoinsSMS: true } },
      error: null,
    });
    const client = { from: vi.fn(() => settingsQuery), rpc: vi.fn() } as any;
    const service = createChurchSettingsService(client);

    await expect(service.getNotificationPreferences('church-1')).resolves.toEqual({
      ...DEFAULT_CHURCH_NOTIFICATION_PREFERENCES,
      memberJoinsSMS: true,
    });
    expect(client.from).toHaveBeenCalledWith('church_settings');
  });

  it('saves church profile through the restricted profile RPC', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    const client = { from: vi.fn(), rpc } as any;
    const service = createChurchSettingsService(client);

    await service.saveChurchProfile('church-1', {
      name: ' Demo Church ',
      address: ' Kilifi ',
      phone: ' 0700000000 ',
      email: ' office@example.org ',
      website: ' https://example.org ',
    });

    expect(rpc).toHaveBeenCalledWith('church_update_profile', {
      p_church_id: 'church-1',
      p_name: 'Demo Church',
      p_address: 'Kilifi',
      p_phone: '0700000000',
      p_email: 'office@example.org',
      p_website: 'https://example.org',
    });
  });

  it('upserts notification preferences by church ID', async () => {
    const settingsQuery = makeQuery({ data: null, error: null });
    const client = { from: vi.fn(() => settingsQuery), rpc: vi.fn() } as any;
    const service = createChurchSettingsService(client);

    await service.saveNotificationPreferences('church-1', DEFAULT_CHURCH_NOTIFICATION_PREFERENCES);

    expect(client.from).toHaveBeenCalledWith('church_settings');
    expect(settingsQuery.upsert).toHaveBeenCalledWith(
      { church_id: 'church-1', notification_preferences: DEFAULT_CHURCH_NOTIFICATION_PREFERENCES },
      { onConflict: 'church_id' },
    );
  });
});
