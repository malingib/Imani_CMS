import { test, expect } from '@playwright/test';
import { PlatformPage } from '../pages/platform-page';
import { mockSupabase } from '../fixtures/supabase-mock';
import { MOCK_CHURCHES } from '../fixtures/mock-data';

test.describe('Tenants Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');
  });

  test('shows list of all churches with member counts', async ({ page }) => {
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();

    await expect(page.getByText(`${MOCK_CHURCHES.length} churches`)).toBeVisible();
    for (const church of MOCK_CHURCHES) {
      await expect(page.getByText(church.name)).toBeVisible();
    }
  });

  test('shows new church modal', async ({ page }) => {
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();

    await page.getByRole('button', { name: 'New Church' }).click();
    await expect(page.getByText('Church Name')).toBeVisible();
    await expect(page.getByText('Tier')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Church' })).toBeVisible();
  });

  test('closes modal on backdrop click', async ({ page }) => {
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();

    await page.getByRole('button', { name: 'New Church' }).click();
    await expect(page.getByText('Church Name')).toBeVisible();

    // Click the backdrop (outer fixed div) near the edge
    await page.mouse.click(10, 150);
    await expect(page.getByText('Church Name')).not.toBeVisible();
  });

  test('clicking a church navigates to its dashboard', async ({ page }) => {
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();

    await page.getByText('Demo Church').first().click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows status icons for active churches', async ({ page }) => {
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();

    const checkIcons = page.locator('svg.text-green-500');
    await expect(checkIcons.first()).toBeVisible();
  });
});
