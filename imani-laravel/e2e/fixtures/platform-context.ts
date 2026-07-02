import { Page } from '@playwright/test';
import { PlatformPage } from '../pages/platform-page';

/** Ensure super admin is in platform-wide view (not drilled into a church). */
export async function ensurePlatformView(page: Page) {
  await page.goto('/platform');

  const backToPlatform = page.getByRole('button', { name: /Back to Platform/i });
  if (await backToPlatform.isVisible()) {
    await backToPlatform.click();
    await page.waitForURL(/\/platform\/?$/);
    return;
  }

  const platform = new PlatformPage(page);
  const overview = platform.platformOverviewLink;

  if (await overview.isVisible()) {
    return;
  }

  await platform.churchSwitcherTrigger.click();
  await page.getByRole('button', { name: 'All Churches (Platform View)' }).click();
  await page.waitForURL(/\/platform\/?$/);
  await overview.waitFor({ state: 'visible' });
}
