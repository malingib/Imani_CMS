import { Page, Locator } from '@playwright/test';

export class PlatformPage {
  readonly page: Page;
  readonly platformOverviewLink: Locator;
  readonly tenantsLink: Locator;
  readonly invitationsLink: Locator;
  readonly billingLink: Locator;
  readonly platformSettingsLink: Locator;
  readonly churchSwitcherTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.platformOverviewLink = page.getByRole('link', { name: 'Platform Overview' });
    this.tenantsLink = page.getByRole('link', { name: 'Tenants' });
    this.invitationsLink = page.getByRole('link', { name: 'Invitations' });
    this.billingLink = page.getByRole('link', { name: 'Billing' });
    this.platformSettingsLink = page.getByRole('link', { name: 'Platform Settings' });
    this.churchSwitcherTrigger = page.getByRole('button', { name: /Viewing Church/i });
  }

  async navigateToTenants() {
    await this.tenantsLink.click();
    await this.page.waitForURL(/\/platform\/tenants/);
  }

  async navigateToBilling() {
    await this.billingLink.click();
    await this.page.waitForURL(/\/platform\/billing/);
  }

  async navigateToPlatformSettings() {
    await this.platformSettingsLink.click();
    await this.page.waitForURL(/\/platform\/settings/);
  }

  async navigateToInvitations() {
    await this.invitationsLink.click();
    await this.page.waitForURL(/\/platform\/invitations/);
  }

  async switchToChurch(name: string) {
    await this.churchSwitcherTrigger.click();
    await this.page.getByRole('button', { name, exact: true }).click();
    await this.page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  }

  async switchToAllChurches() {
    await this.churchSwitcherTrigger.click();
    await this.page.getByRole('button', { name: 'All Churches (Platform View)' }).click();
    await this.page.waitForURL(/\/platform\/?$/, { timeout: 15_000 });
  }
}
