import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('triggerStkPush', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_LARAVEL_URL', 'https://payments.example');
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

  it('normalizes Kenyan mobile numbers and passes the selected gift details', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, checkoutRequestId: 'ws_CO_test_123' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { triggerStkPush } = await import('./mpesa-service');

    const result = await triggerStkPush(500, '0712 345 678', 'Offering', 'Test Member');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body)).toEqual({
      amount: 500,
      phone: '254712345678',
      type: 'Offering',
      memberName: 'Test Member',
    });
    expect(result).toMatchObject({
      success: true,
      checkoutRequestId: 'ws_CO_test_123',
    });
    expect(result.message).toContain('after payment confirmation');
  });

  it('does not report success when the backend response lacks explicit acceptance', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'received' }),
    }));
    const { triggerStkPush } = await import('./mpesa-service');

    await expect(triggerStkPush(250, '254712345678', 'Tithe', 'Test Member'))
      .resolves.toMatchObject({ success: false });
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
