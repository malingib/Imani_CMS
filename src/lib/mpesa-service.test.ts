import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('triggerStkPush', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects zero and negative amounts before calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { triggerStkPush } = await import('./mpesa-service');

    await expect(triggerStkPush(0, '0712345678', 'Tithe', 'Test Member'))
      .resolves.toMatchObject({ success: false });
    await expect(triggerStkPush(-1, '0712345678', 'Tithe', 'Test Member'))
      .resolves.toMatchObject({ success: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not initiate payment until a verified Supabase Daraja workflow exists', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { triggerStkPush } = await import('./mpesa-service');

    const result = await triggerStkPush(500, '0712 345 678', 'Offering', 'Test Member');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: false });
    expect(result.message).toContain('No payment prompt was sent');
  });

  it('rejects malformed phone numbers without calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { triggerStkPush } = await import('./mpesa-service');

    await expect(triggerStkPush(250, '12345', 'Tithe', 'Test Member'))
      .resolves.toMatchObject({ success: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
