import { Page } from '@playwright/test';
import { DEMO_PASSWORD, USERS } from './test-data';

export async function loginAs(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.getByPlaceholder('e.g. pastor@imani.org').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /Sign In to Portal/i }).click();
}

export async function loginAsSuperAdmin(page: Page) {
  await loginAs(page, USERS.superAdmin);
  await page.waitForURL(/\/platform/);
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, USERS.admin);
  await page.waitForURL(/\/dashboard/);
}

export async function loginAsMember(page: Page) {
  await loginAs(page, USERS.member);
  await page.waitForURL(/\/portal/);
}
