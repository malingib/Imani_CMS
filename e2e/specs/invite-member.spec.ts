import { test, expect, type Page } from '@playwright/test';
import { PlatformPage } from '../pages/platform-page';
import { LoginPage } from '../pages/login-page';
import { mockSupabase } from '../fixtures/supabase-mock';

async function loginAsSuperAdmin(page: Page) {
  await mockSupabase(page, { session: false });
  await page.goto('/');
  const login = new LoginPage(page);
  await login.login('malingib9@gmail.com', 'password');
  await expect(page.getByRole('heading', { name: 'Platform Dashboard' })).toBeVisible({ timeout: 15000 });
}

test.describe('Invitation and member flows', () => {
  test('super admin can send a church invitation', async ({ page }) => {
    await loginAsSuperAdmin(page);

    const platform = new PlatformPage(page);
    await platform.navigateToInvitations();
    await expect(page.getByRole('heading', { name: 'Invitations' })).toBeVisible();

    await page.getByRole('button', { name: 'Send Invite' }).click();
    await page.locator('select').first().selectOption({ label: 'Demo Church' });
    await page.locator('input[type="email"]').fill('admin@newchurch.test');
    await page.locator('select').nth(1).selectOption('ADMIN');
    await page.getByRole('button', { name: 'Send Invitation' }).click();

    await expect(page.getByText('admin@newchurch.test')).toBeVisible();
    await expect(page.getByText('Demo Church')).toBeVisible();
    await expect(page.getByText(/Pending/i)).toBeVisible();
  });

  test('church member creation and bulk CSV import work end-to-end', async ({ page }) => {
    await loginAsSuperAdmin(page);

    const platform = new PlatformPage(page);
    await platform.switchToChurch('Demo Church');
    await page.getByRole('button', { name: 'Congregation' }).click();
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();

    await page.getByRole('button', { name: /Add Member/i }).click();
    await page.getByLabel('First Name').fill('Amina');
    await page.getByLabel('Last Name').fill('Otieno');
    await page.getByLabel('Phone Number').fill('+254711222333');
    await page.getByLabel('Email Address').fill('amina.otieno@test.com');
    await page.getByLabel('Location').fill('Westlands');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Amina Otieno')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('+254711222333')).toBeVisible();

    await page.getByRole('button', { name: /Bulk Import/i }).click();
    const csv = `Firstname,Lastname,Phone,Email,Location,Groups,Status,JoinDate,Age,Gender,MaritalStatus,MembershipType\n` +
      `Grace,Maina,+254700111222,grace.maina@test.com,Kilimani,Youth Fellowship;Media & Tech,Active,2025-06-01,29,Female,Single,Full Member\n`;

    await page.setInputFiles('input#bulk-csv-input', {
      name: 'members.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv, 'utf-8'),
    });

    await expect(page.getByText('grace.maina@test.com')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Grace Maina')).toBeVisible({ timeout: 10000 });
  });
});
