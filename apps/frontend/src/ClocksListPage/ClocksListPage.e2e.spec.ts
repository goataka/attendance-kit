import { test, expect } from '@playwright/test';
import ClockInOutPage from '../shared/page-objects/ClockInOutPage';
import ClocksListPage from '../shared/page-objects/ClocksListPage';

test.describe('打刻一覧ページ', () => {
  // Seed data before each test
  test.beforeEach(async ({ page }) => {
    // Given: 打刻画面のページオブジェクトを作成してテストデータを準備
    const clockInOutPage = new ClockInOutPage(page);

    // When: テストデータを追加（出勤を打刻）
    await clockInOutPage.goto();
    await clockInOutPage.fillLoginCredentials('user001', 'password123');
    await clockInOutPage.performClockIn();
    await clockInOutPage.expectSuccessMessage();
  });

  test('打刻一覧が表示されること', async ({ page }) => {
    // Given: 打刻画面のページオブジェクトを作成してテストデータを準備
   
    const clocksListPage = new ClocksListPage(page);

    // When: 打刻一覧画面に遷移
    await clocksListPage.goto();

    // Then: ページタイトル、フィルター、テーブルが表示される
    await clocksListPage.expectTitleToBeVisible();
    await clocksListPage.expectFiltersToBeVisible();
    await clocksListPage.expectTableToBeVisible();
    await clocksListPage.expectTableHeaderToContainText('ID');

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    // Visual regression test - saves to ClocksListPage.screenshot.png
    await expect(page).toHaveScreenshot(['ClocksListPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('ユーザーIDで絞り込みできること', async ({ page }) => {
    // Given: 打刻一覧画面のページオブジェクトを作成
    const clocksListPage = new ClocksListPage(page);
    await clocksListPage.goto();
    // When: 初期データの読み込みを待機してユーザーIDでフィルター
    await clocksListPage.waitForTableData();
    await clocksListPage.filterByUserId('user001');

    // Then: フィルター結果に指定したユーザーが含まれる
    await clocksListPage.expectFirstRowToContainText('user001');
  });

  test('フィルタをリセットできること', async ({ page }) => {
    // Given: 打刻一覧画面のページオブジェクトを作成
    const clocksListPage = new ClocksListPage(page);
    await clocksListPage.goto();

    // When: フィルターを設定してリセット
    await clocksListPage.fillFilterUserId('user001');
    await clocksListPage.selectFilterType('clock-in');
    await clocksListPage.resetFilters();

    // Then: フィルターがクリアされる
    await clocksListPage.expectFilterUserIdToHaveValue('');
    await clocksListPage.expectFilterTypeToHaveValue('all');
  });

  test('打刻ページに戻れること', async ({ page }) => {
    // Given: 打刻一覧画面のページオブジェクトを作成
    const clocksListPage = new ClocksListPage(page);
    await clocksListPage.goto();

    // When: 打刻画面に戻るリンクをクリック
    await clocksListPage.clickBackToClockInLink();

    // Then: 打刻画面に遷移する
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
  });
});
