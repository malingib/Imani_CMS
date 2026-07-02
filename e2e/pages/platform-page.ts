import { Page, Locator } from '@playwright/test';

export class PlatformPage {
  readonly page: Page;

  // Sidebar platform buttons
  readonly platformOverviewLink: Locator;
  readonly tenantsLink: Locator;
  readonly invitationsLink: Locator;
  readonly billingLink: Locator;
  readonly platformSettingsLink: Locator;

  // Church switcher
  readonly churchSwitcherTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.platformOverviewLink = page.getByRole('button', { name: 'Platform Overview' });
    this.tenantsLink = page.getByRole('button', { name: 'Tenants' });
    this.invitationsLink = page.getByRole('button', { name: 'Invitations' });
    this.billingLink = page.getByRole('button', { name: 'Billing' });
    this.platformSettingsLink = page.getByRole('button', { name: 'Platform Settings' });
    this.churchSwitcherTrigger = page.getByRole('button', { name: /Viewing Church/ });
  }

  async navigateToTenants() {
    await this.tenantsLink.click();
  }

  async navigateToBilling() {
    await this.billingLink.click();
  }

  async navigateToPlatformSettings() {
    await this.platformSettingsLink.click();
  }

  async navigateToInvitations() {
    await this.invitationsLink.click();
  }

  async switchToChurch(name: string) {
    await this.churchSwitcherTrigger.click();
    await this.page.getByRole('button', { name }).first().click();
  }

  async switchToAllChurches() {
    await this.churchSwitcherTrigger.click();
    await this.page.getByRole('button', { name: 'All Churches' }).click();
  }
}
