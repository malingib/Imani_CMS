import { test as setup } from '@playwright/test';
import { DEMO_PASSWORD, USERS } from './fixtures/test-data';
import { ensurePlatformView } from './fixtures/platform-context';

const authFile = 'e2e/.auth/super-admin.json';

setup('authenticate as super admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('e.g. pastor@imani.org').fill(USERS.superAdmin);
  await page.locator('input[type="password"]').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: /Sign In to Portal/i }).click();
  await page.waitForURL(/\/platform/, { timeout: 15_000 });
  await ensurePlatformView(page);
  await page.context().storageState({ path: authFile });
});
