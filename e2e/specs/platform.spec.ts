import { test, expect } from '@playwright/test';
import { PlatformPage } from '../pages/platform-page';
import { mockSupabase } from '../fixtures/supabase-mock';

test.describe('Super Admin Platform', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
  });

  test.describe('Platform Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('shows aggregated stats cards', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Platform Dashboard' })).toBeVisible();
      await expect(page.getByText('Total Churches')).toBeVisible();
      await expect(page.getByText('Total Members')).toBeVisible();
      await expect(page.getByText('Total Revenue')).toBeVisible();
      await expect(page.getByText('System Health')).toBeVisible();
    });

    test('shows platform overview info box', async ({ page }) => {
      await expect(page.getByText('Platform Overview').first()).toBeVisible();
      await expect(page.getByText(/Tenants section/)).toBeVisible();
    });
  });

  test.describe('Platform Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('sidebar shows platform nav items', async ({ page }) => {
      const platform = new PlatformPage(page);
      await expect(platform.platformOverviewLink).toBeVisible();
      await expect(platform.tenantsLink).toBeVisible();
      await expect(platform.invitationsLink).toBeVisible();
      await expect(platform.billingLink).toBeVisible();
      await expect(platform.platformSettingsLink).toBeVisible();
    });

    test('navigates to Tenants view', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.navigateToTenants();
      await expect(page.getByRole('heading', { name: 'Tenants' })).toBeVisible();
      await expect(page.getByText('Demo Church')).toBeVisible();
      await expect(page.getByText('Nairobi Chapel')).toBeVisible();
    });

    test('navigates to Billing view', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.navigateToBilling();
      await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Subscriptions' })).toBeVisible();
      await expect(page.getByText('Active Subscriptions')).toBeVisible();
    });

    test('navigates to Invitations view', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.navigateToInvitations();
      await expect(page.getByRole('heading', { name: 'Invitations' })).toBeVisible();
    });

    test('navigates to Platform Settings', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.navigateToPlatformSettings();
      await expect(page.getByText('Feature Flags')).toBeVisible();
      await expect(page.getByText('Default Limits')).toBeVisible();
    });
  });

  test.describe('Church Switching', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('church switcher shows in sidebar for super admin', async ({ page }) => {
      const platform = new PlatformPage(page);
      await expect(platform.churchSwitcherTrigger).toBeVisible();
      await platform.churchSwitcherTrigger.click();
      await expect(page.getByRole('button', { name: 'All Churches (Platform View)' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Demo Church' })).toBeVisible();
    });

    test('switching to a church shows church views', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.switchToChurch('Demo Church');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('button', { name: /Back to Platform/i })).toBeVisible();
    });

    test('back to platform returns to platform nav', async ({ page }) => {
      const platform = new PlatformPage(page);
      await platform.switchToChurch('Demo Church');
      await page.getByRole('button', { name: /Back to Platform/i }).click();
      await expect(page.getByRole('heading', { name: 'Platform Dashboard' })).toBeVisible();
    });
  });
});
