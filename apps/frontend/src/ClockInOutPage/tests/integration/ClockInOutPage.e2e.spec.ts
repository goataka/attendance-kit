import { test, expect } from '@playwright/test';
import { ClockInOutPage } from './ClockInOutPage.page';

test.describe('打刻ページ', () => {
  test('ログインフォームと打刻ボタンが表示されること', async ({ page }) => {
    // Given: 打刻ページへアクセス
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    
    // When: ページが表示される
    await clockInOutPage.expectPageTitleToBe('勤怠打刻');
    
    // Then: ログインフォームと打刻ボタンが表示される
    await clockInOutPage.expectClockButtonsVisible();
    await clockInOutPage.expectClockButtonsEnabled();
    await clockInOutPage.expectLoginFormVisible();
    await clockInOutPage.waitForAnimation();
    await clockInOutPage.takeScreenshot(['ClockInOutPage.screenshot.png']);
  });

  test('ログインが成功し打刻ボタンが有効になること', async ({ page }) => {
    // Given: 打刻ページを表示
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    
    // When: ログイン操作を実行
    await clockInOutPage.login('user001', 'password123');
    
    // Then: ログイン成功状態を確認
    await clockInOutPage.expectSuccessMessage('Login successful');
    await clockInOutPage.expectClockButtonsEnabled();
    await clockInOutPage.expectLogoutButtonVisible();
    await clockInOutPage.expectLoginFormNotVisible();
  });

  test('未ログイン時にユーザーIDとパスワードで出勤打刻ができること', async ({ page }) => {
    // Given: 打刻ページを表示
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    
    // When: 未ログイン状態で打刻操作を実行
    await clockInOutPage.clockInWithoutLogin('user001', 'password123');
    
    // Then: 打刻成功メッセージが表示される
    await clockInOutPage.expectSuccessMessage('Clock in successful');
  });

  test('ログイン後に出勤打刻ができること', async ({ page }) => {
    // Given: 打刻ページを表示
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    
    // When: ログイン後に打刻操作を実行
    await clockInOutPage.clockInWithLogin('user001', 'password123');
    
    // Then: 打刻成功メッセージが表示される
    await clockInOutPage.expectSuccessMessage('Clock in successful');
  });

  test('入力フィールドが空の場合はエラーを表示すること', async ({ page }) => {
    // Given: 打刻ページを表示
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    
    // When: 入力なしでログインボタンをクリック
    await clockInOutPage.clickLogin();
    
    // Then: エラーメッセージが表示される
    await clockInOutPage.expectErrorMessage('User ID and password are required');
  });

  test('打刻一覧ページへ遷移できること', async ({ page }) => {
    // Given: ログイン済みの状態
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();
    await clockInOutPage.login('user001', 'password123');
    
    // When: 打刻一覧リンクをクリック
    await clockInOutPage.clickClocksListLink();
    
    // Then: 打刻一覧ページに遷移する
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });
});
