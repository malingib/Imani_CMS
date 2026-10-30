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
    mockFrom.mockImplementation(() => ({
      select: () => ({ single: async () => ({ data: { id: 'global', flags: {} }, error: null }) }),
      upsert: async () => ({ error: { message: 'row level security denied' } }),
    }));
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

  it('shows a save error when RLS rejects a settings update', async () => {
    render(<Settings currentUserRole={UserRole.PASTOR} churchId="church-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: /Commit Changes/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not be saved'));
  });
});
