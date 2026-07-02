import { test, expect } from '@playwright/test';
import { ensurePlatformView } from '../fixtures/platform-context';
import { CHURCHES } from '../fixtures/test-data';
import { PlatformPage } from '../pages/platform-page';

test.describe('Tenants Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensurePlatformView(page);
    const platform = new PlatformPage(page);
    await platform.navigateToTenants();
  });

  test('shows list of all churches with member counts', async ({ page }) => {
    await expect(page.getByText(`${CHURCHES.length} churches`)).toBeVisible();
    for (const church of CHURCHES) {
      await expect(page.getByText(church).first()).toBeVisible();
    }
  });

  test('shows new church modal', async ({ page }) => {
    await page.getByRole('button', { name: 'New Church' }).click();
    await expect(page.getByText('Church Name')).toBeVisible();
    await expect(page.getByText('Tier')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Church' })).toBeVisible();
  });

  test('closes modal on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: 'New Church' }).click();
    await expect(page.getByText('Church Name')).toBeVisible();

    await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 150 } });
    await expect(page.getByText('Church Name')).not.toBeVisible();
  });

  test('clicking a church navigates to its dashboard', async ({ page }) => {
    await page.getByText('Demo Church').first().click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows status icons for active churches', async ({ page }) => {
    const checkIcons = page.locator('svg.text-green-500');
    await expect(checkIcons.first()).toBeVisible();
  });
});
