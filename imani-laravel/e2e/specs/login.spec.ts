import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe('Login', () => {
  test('shows login form with all required elements', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'IMANI' })).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
  });

  test('shows daily verse on desktop', async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 800 });
    const login = new LoginPage(page);
    await login.goto();

    await expect(page.getByText(/For I know the plans/i)).toBeVisible();
  });

  test('shows footer links at bottom', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Compliance' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Security' })).toBeVisible();
  });

  test('can navigate to privacy policy from login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Portal/i })).toBeVisible();
  });
});
