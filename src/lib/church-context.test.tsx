// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { ChurchProvider, useChurch } from './church-context';

const church = (id: string, name: string, status = 'active') => ({
  id, name, slug: id, tier: 'basic', status,
});

function ChurchConsumer() {
  const { activeChurchId, activeChurch, churches, configurationError, setActiveChurchId } = useChurch();
  return (
    <div>
      <span data-testid="church-id">{activeChurchId || 'none'}</span>
      <span data-testid="church-name">{activeChurch?.name || 'none'}</span>
      <span data-testid="church-count">{churches.length}</span>
      <span data-testid="configuration-error">{configurationError || 'none'}</span>
      <button onClick={() => setActiveChurchId('church-b')}>select-client</button>
      <button onClick={() => setActiveChurchId('church-suspended')}>select-suspended</button>
      <button onClick={() => setActiveChurchId(null)}>return-platform</button>
    </div>
  );
}

function queryBuilder(tableResults: Record<string, { list?: unknown; single?: unknown }>, table: string) {
  const builder: any = {
    eq: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(tableResults[table]?.list ?? { data: [], error: null })),
    maybeSingle: vi.fn(() => Promise.resolve(tableResults[table]?.single ?? { data: null, error: null })),
  };
  return { select: vi.fn(() => builder) };
}

describe('ChurchProvider multi-tenant workspace resolution', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('loads all non-archived client workspaces for the platform owner without selecting one', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'owner-1', app_metadata: { role: 'SUPER_ADMIN' } } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => queryBuilder({
      churches: {
        list: {
          data: [
            church('church-a', 'Alpha Church'),
            church('church-b', 'Beta Church', 'trialing'),
            church('church-c', 'Archived Church', 'archived'),
          ],
          error: null,
        },
      },
    }, table));

    render(<ChurchProvider churchId={null}><ChurchConsumer /></ChurchProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('none');
      expect(screen.getByTestId('church-name').textContent).toBe('none');
      expect(screen.getByTestId('church-count').textContent).toBe('2');
      expect(screen.getByTestId('configuration-error').textContent).toBe('none');
    });
    expect(mockFrom).toHaveBeenCalledWith('churches');
    expect(mockFrom).not.toHaveBeenCalledWith('church_memberships');
  });

  it('resolves a church staff account from its assigned active membership', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'staff-1', app_metadata: { role: 'ADMIN', church_id: 'church-a' } } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => queryBuilder({
      church_memberships: {
        single: { data: { church_id: 'church-a', role: 'ADMIN', status: 'active' }, error: null },
      },
      churches: {
        single: { data: church('church-a', 'Alpha Church'), error: null },
      },
    }, table));

    render(<ChurchProvider churchId={null}><ChurchConsumer /></ChurchProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('church-a');
      expect(screen.getByTestId('church-name').textContent).toBe('Alpha Church');
      expect(screen.getByTestId('configuration-error').textContent).toBe('none');
    });
    expect(mockFrom).toHaveBeenCalledWith('church_memberships');
    expect(mockFrom).toHaveBeenCalledWith('churches');
  });

  it('denies member-role accounts because member self-service has been removed', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'member-1', app_metadata: { role: 'MEMBER', church_id: 'church-a' } } },
      error: null,
    });

    render(<ChurchProvider churchId={null}><ChurchConsumer /></ChurchProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('none');
      expect(screen.getByTestId('configuration-error').textContent).toContain('does not have a church staff role');
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('fails closed when a church workspace is suspended or archived', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'staff-1', app_metadata: { role: 'ADMIN', church_id: 'church-a' } } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => queryBuilder({
      church_memberships: {
        single: { data: { church_id: 'church-a', role: 'ADMIN', status: 'active' }, error: null },
      },
      churches: {
        single: { data: church('church-a', 'Alpha Church', 'suspended'), error: null },
      },
    }, table));

    render(<ChurchProvider churchId={null}><ChurchConsumer /></ChurchProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('none');
      expect(screen.getByTestId('configuration-error').textContent).toContain('unavailable or suspended');
    });
  });

  it('allows a platform owner to switch between clients and return to platform mode', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'owner-1', app_metadata: { role: 'SUPER_ADMIN' } } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => queryBuilder({
      churches: {
        list: {
          data: [
            church('church-a', 'Alpha Church'),
            church('church-b', 'Beta Church', 'trialing'),
            church('church-suspended', 'Suspended Church', 'suspended'),
          ],
          error: null,
        },
      },
    }, table));

    render(<ChurchProvider churchId={null}><ChurchConsumer /></ChurchProvider>);

    await waitFor(() => expect(screen.getByTestId('church-count').textContent).toBe('3'));
    fireEvent.click(screen.getByText('select-suspended'));
    expect(screen.getByTestId('church-id').textContent).toBe('none');
    fireEvent.click(screen.getByText('select-client'));
    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('church-b');
      expect(screen.getByTestId('church-name').textContent).toBe('Beta Church');
    });
    fireEvent.click(screen.getByText('return-platform'));
    await waitFor(() => {
      expect(screen.getByTestId('church-id').textContent).toBe('none');
      expect(screen.getByTestId('church-name').textContent).toBe('none');
    });
  });
});
