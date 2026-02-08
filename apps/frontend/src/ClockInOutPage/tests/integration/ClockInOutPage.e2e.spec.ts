import { test, expect } from '@playwright/test';
import { ClockInOutPage } from './ClockInOutPage.page';

test.describe('打刻ページ', () => {
  test('ログインフォームと打刻ボタンが表示されること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.expectPageTitleToBe('勤怠打刻');
    await clockInOutPage.expectClockButtonsVisible();
    await clockInOutPage.expectClockButtonsEnabled();
    await clockInOutPage.expectLoginFormVisible();
    await clockInOutPage.waitForAnimation();
    await clockInOutPage.takeScreenshot(['ClockInOutPage.screenshot.png']);
  });

  test('ログインが成功し打刻ボタンが有効になること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.login('user001', 'password123');
    await clockInOutPage.expectSuccessMessage('Login successful');
    await clockInOutPage.expectClockButtonsEnabled();
    await clockInOutPage.expectLogoutButtonVisible();
    await clockInOutPage.expectLoginFormNotVisible();
  });

  test('未ログイン時にユーザーIDとパスワードで出勤打刻ができること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.clockInWithoutLogin('user001', 'password123');
    await clockInOutPage.expectSuccessMessage('Clock in successful');
  });

  test('ログイン後に出勤打刻ができること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.clockInWithLogin('user001', 'password123');
    await clockInOutPage.expectSuccessMessage('Clock in successful');
  });

  test('入力フィールドが空の場合はエラーを表示すること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.clickLogin();
    await clockInOutPage.expectErrorMessage('User ID and password are required');
  });

  test('打刻一覧ページへ遷移できること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    await clockInOutPage.login('user001', 'password123');
    await clockInOutPage.clickClocksListLink();
    
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });
});
