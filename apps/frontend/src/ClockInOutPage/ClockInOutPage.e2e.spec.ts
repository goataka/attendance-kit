import { test, expect } from '@playwright/test';
import ClockInOutPage from './ClockInOutPage.page';

test.describe('打刻ページ', () => {
  test('打刻フォームが表示されること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);

    // When: 打刻画面に遷移
    await clockInOutPage.goto();

    // Then: ページタイトルとフォーム要素が表示される
    await clockInOutPage.expectTitleToBeVisible();
    await clockInOutPage.expectFormToBeVisible();

    // Wait for any animations to complete
    await clockInOutPage.waitForAnimations();

    // Visual regression test - saves to ClockInOutPage.screenshot.png
    await expect(page).toHaveScreenshot(['ClockInOutPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('出勤打刻ができること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();

    // When: ログイン情報を入力して出勤ボタンをクリック
    await clockInOutPage.fillLoginCredentials('user001', 'password123');
    await clockInOutPage.performClockIn();

    // Then: 成功メッセージが表示される
    await clockInOutPage.expectSuccessMessage('Clock in successful');
  });

  test('入力が空の場合はエラーが表示されること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();

    // When: フィールドを空のまま出勤ボタンをクリック
    await clockInOutPage.clickClockIn();

    // Then: エラーメッセージが表示される
    await clockInOutPage.expectErrorMessage('User ID and password are required');
  });

  test('打刻一覧ページに遷移できること', async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    await clockInOutPage.goto();

    // When: 打刻一覧リンクをクリック
    await clockInOutPage.clickClockListLink();

    // Then: 打刻一覧ページに遷移する
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });
});
