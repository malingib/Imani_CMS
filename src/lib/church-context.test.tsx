// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const { mockGetUser, mockMaybeSingle, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { ChurchProvider, useChurch } from './church-context';

function ChurchConsumer() {
  const { activeChurchId, activeChurch, configurationError } = useChurch();
  return (
    <div>
      <span data-testid="church-id">{activeChurchId || 'none'}</span>
      <span data-testid="church-name">{activeChurch?.name || 'none'}</span>
      <span data-testid="configuration-error">{configurationError || 'none'}</span>
    </div>
  );
}

describe('ChurchProvider single-church deployment', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('resolves only the canonical Demo Church by default', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Demo Church',
        slug: 'demo-church',
        tier: 'basic',
        status: 'active',
      },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    });

    render(
      <ChurchProvider churchId={null}>
        <ChurchConsumer />
      </ChurchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('00000000-0000-0000-0000-000000000001');
      expect(screen.getByTestId('church-name').textContent).toBe('Demo Church');
      expect(screen.getByTestId('configuration-error').textContent).toBe('none');
    });

    expect(mockFrom).toHaveBeenCalledWith('churches');
    expect(mockMaybeSingle).toHaveBeenCalledOnce();
  });

  it('fails closed when the configured church is archived or unavailable', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Demo Church',
        slug: 'demo-church',
        tier: 'basic',
        status: 'archived',
      },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    });

    render(
      <ChurchProvider churchId={null}>
        <ChurchConsumer />
      </ChurchProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('none');
      expect(screen.getByTestId('configuration-error').textContent).toContain('unavailable');
    });
  });
});
