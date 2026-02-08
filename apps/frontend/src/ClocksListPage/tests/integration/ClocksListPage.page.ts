import { Page, Locator, expect } from '@playwright/test';

export class ClocksListPage {
  readonly page: Page;
  readonly clocksListLink: Locator;
  readonly table: Locator;
  readonly userIdFilter: Locator;
  readonly typeFilter: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.clocksListLink = page.getByRole('link', { name: '打刻一覧' });
    this.table = page.locator('table');
    this.userIdFilter = page.getByLabel('User ID');
    this.typeFilter = page.getByLabel('打刻種別');
    this.searchButton = page.getByRole('button', { name: '検索' });
    this.resetButton = page.getByRole('button', { name: 'リセット' });
  }

  async goto() {
    await this.page.goto('/clocks');
  }

  async navigateToPageViaLink() {
    await this.clocksListLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectClockRecordsVisible() {
    await expect(this.table).toBeVisible({ timeout: 10000 });
    const rows = await this.table.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  }

  async expectNoRecordsMessage() {
    await expect(this.page.getByText('打刻データがありません')).toBeVisible();
  }

  async searchByUserId(userId: string) {
    await this.userIdFilter.fill(userId);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchByType(type: 'clock-in' | 'clock-out') {
    await this.typeFilter.selectOption(type);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async resetFilters() {
    await this.resetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectUserIdInRecords(userId: string) {
    await expect(this.page.getByText(userId).first()).toBeVisible();
  }
}
