import { Page, Locator, expect } from '@playwright/test';

export class ClockInOutPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly clockInButton: Locator;
  readonly clockOutButton: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly clocksListLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1');
    this.userIdInput = page.locator('#userId');
    this.passwordInput = page.locator('#password');
    this.clockInButton = page.getByRole('button', { name: '出勤' });
    this.clockOutButton = page.getByRole('button', { name: '退勤' });
    this.loginButton = page.getByRole('button', { name: 'ログイン' });
    this.logoutButton = page.getByRole('button', { name: 'ログアウト' });
    this.successMessage = page.locator('.message.success');
    this.errorMessage = page.locator('.message.error');
    this.clocksListLink = page.getByRole('link', { name: '打刻一覧を見る' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async fillUserId(userId: string) {
    await this.userIdInput.fill(userId);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillCredentials(userId: string, password: string) {
    await this.fillUserId(userId);
    await this.fillPassword(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickClockIn() {
    await this.clockInButton.click();
  }

  async clickClockOut() {
    await this.clockOutButton.click();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async clickClocksListLink() {
    await this.clocksListLink.click();
  }

  async login(userId: string, password: string) {
    await this.fillCredentials(userId, password);
    await this.clickLogin();
    await this.waitForSuccessMessage();
  }

  async clockInWithoutLogin(userId: string, password: string) {
    await this.fillCredentials(userId, password);
    await this.clickClockIn();
  }

  async clockInWithLogin(userId: string, password: string) {
    await this.login(userId, password);
    await this.clickClockIn();
  }

  async waitForSuccessMessage() {
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async waitForErrorMessage() {
    await this.errorMessage.waitFor({ state: 'visible' });
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(500);
  }

  async expectPageTitleToBe(title: string) {
    await expect(this.pageTitle).toHaveText(title);
  }

  async expectClockButtonsVisible() {
    await expect(this.clockInButton).toBeVisible();
    await expect(this.clockOutButton).toBeVisible();
  }

  async expectClockButtonsEnabled() {
    await expect(this.clockInButton).toBeEnabled();
    await expect(this.clockOutButton).toBeEnabled();
  }

  async expectLoginFormVisible() {
    await expect(this.userIdInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectLoginFormNotVisible() {
    await expect(this.userIdInput).not.toBeVisible();
    await expect(this.passwordInput).not.toBeVisible();
  }

  async expectLogoutButtonVisible() {
    await expect(this.logoutButton).toBeVisible();
  }

  async expectSuccessMessage(message: string) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(message);
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async takeScreenshot(name: string[]) {
    await expect(this.page).toHaveScreenshot(name, {
      fullPage: true,
    });
  }
}
