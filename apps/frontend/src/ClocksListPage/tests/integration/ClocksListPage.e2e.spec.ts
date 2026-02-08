import { test, expect } from '@playwright/test';
import { ClockInOutPage } from '@/ClockInOutPage/tests/integration/ClockInOutPage.page';
import { ClocksListPage } from './ClocksListPage.page';

test.describe('Clocks List Page', () => {
  // 各テストの前にデータをシード
  test.beforeEach(async ({ page }) => {
    const clockInOutPage = new ClockInOutPage(page);
    
    await clockInOutPage.goto();
    
    // ログイン
    await clockInOutPage.login('user001', 'password123');
    await clockInOutPage.expectSuccessMessage('Login successful');
    
    // 打刻データを追加
    await clockInOutPage.clickClockIn();
    await clockInOutPage.expectSuccessMessage('Clock in successful');
    
    // 打刻一覧ページへ移動（リンクをクリックすることでsessionStorageが維持される）
    const clocksListPage = new ClocksListPage(page);
    await clocksListPage.navigateToPageViaLink();
    await expect(page).toHaveURL('/clocks');
  });

  test('should display records list', async ({ page }) => {
    // Given: 打刻データが存在する状態
    
    // When: 打刻一覧ページが表示される
    await expect(page.locator('h1')).toHaveText('打刻一覧');
    
    // Then: フィルター要素とテーブルが表示される
    await expect(page.locator('#filterUserId')).toBeVisible();
    await expect(page.locator('#filterType')).toBeVisible();
    await expect(page.locator('#filterStartDate')).toBeVisible();
    await expect(page.locator('#filterEndDate')).toBeVisible();
    await expect(page.locator('.records-table')).toBeVisible();
    await expect(page.locator('.records-table th').first()).toContainText('ID');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot(['ClocksListPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('should filter records by user ID', async ({ page }) => {
    // Given: 初期データが読み込まれている
    await page.waitForSelector('.records-table tbody tr');
    
    // When: ユーザーIDでフィルタリング
    await page.locator('#filterUserId').fill('user001');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(500);
    
    // Then: フィルタリング結果が表示される
    const firstRow = page.locator('.records-table tbody tr').first();
    await expect(firstRow).toContainText('user001');
  });

  test('should reset filters', async ({ page }) => {
    // Given: フィルターを設定
    await page.locator('#filterUserId').fill('user001');
    await page.locator('#filterType').selectOption('clock-in');
    
    // When: フィルターをリセット
    await page.getByRole('button', { name: 'リセット' }).click();
    
    // Then: フィルターがクリアされる
    await expect(page.locator('#filterUserId')).toHaveValue('');
    await expect(page.locator('#filterType')).toHaveValue('all');
  });

  test('should navigate back to clock in page', async ({ page }) => {
    // Given: 打刻一覧ページを表示
    
    // When: 打刻画面へのリンクをクリック
    await page.getByRole('link', { name: '打刻画面に戻る' }).click();
    
    // Then: 打刻画面に遷移する
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
  });
});
