// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserRole } from '../../types';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('../../src/lib/supabase', () => ({ supabase: { from: mockFrom } }));

import Settings from '../../components/Settings';

describe('Settings integration feedback', () => {
  beforeEach(() => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ single: async () => ({ data: { id: 'global', flags: {} }, error: null }) }),
      upsert: async () => ({ error: { message: 'row level security denied' } }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not report the enabled flag as a verified payment connection', async () => {
    render(<Settings currentUserRole={UserRole.TREASURER} churchId="church-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Payments' }));

    expect(await screen.findByText('Enabled')).toBeTruthy();
    expect(screen.getByText('Not tested')).toBeTruthy();
    expect(screen.queryByText('Connected')).toBeNull();
  });

  it('shows a save error when RLS rejects a settings update', async () => {
    render(<Settings currentUserRole={UserRole.PASTOR} churchId="church-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: /Commit Changes/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not be saved'));
  });
});
