// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserRole } from '../../types';

const { mockFrom, mockInvoke } = vi.hoisted(() => ({ mockFrom: vi.fn(), mockInvoke: vi.fn() }));

vi.mock('../../src/lib/supabase', () => ({ supabase: { from: mockFrom, functions: { invoke: mockInvoke } } }));

import Settings from '../../components/Settings';

describe('Settings integration feedback', () => {
  beforeEach(() => {
    mockInvoke.mockResolvedValue({ data: { configured: false, settings: {} }, error: null });
    mockFrom.mockImplementation((table: string) => {
      const query: any = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        single: vi.fn(async () => ({
          data: { name: 'Demo Church', address: '', phone: '', email: '', website: '' },
          error: null,
        })),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        upsert: vi.fn(async () => ({
          error: table === 'church_settings' ? { message: 'row level security denied' } : null,
        })),
      };
      return query;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows provider credentials as unconfigured until saved', async () => {
    render(<Settings currentUserRole={UserRole.ADMIN} churchId="church-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Integrations' }));

    expect(await screen.findByText('M-Pesa Daraja')).toBeTruthy();
    expect(screen.getByText('MobiWave SMS')).toBeTruthy();
    expect(screen.queryByText('Credentials saved')).toBeNull();
    expect(screen.queryByText('Connection verified.')).toBeNull();
  });

  it('does not request church notification preferences for treasurers', async () => {
    render(<Settings currentUserRole={UserRole.TREASURER} churchId="church-1" />);

    expect(await screen.findByRole('button', { name: 'Integrations' })).toBeTruthy();
    expect(mockFrom).toHaveBeenCalledWith('churches');
    expect(mockFrom).not.toHaveBeenCalledWith('church_settings');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a save error when RLS rejects a settings update', async () => {
    render(<Settings currentUserRole={UserRole.PASTOR} churchId="church-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: /Commit Changes/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not be saved'));
  });
});
