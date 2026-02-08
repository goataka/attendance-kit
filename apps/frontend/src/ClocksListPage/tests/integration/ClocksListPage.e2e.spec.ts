import { test, expect } from '@playwright/test';
import { ClockInOutPage } from '../../../ClockInOutPage/__tests__/integration/ClockInOutPage.page';
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
    // ページタイトルを確認
    await expect(page.locator('h1')).toHaveText('打刻一覧');
    
    // フィルター要素を確認
    await expect(page.locator('#filterUserId')).toBeVisible();
    await expect(page.locator('#filterType')).toBeVisible();
    await expect(page.locator('#filterStartDate')).toBeVisible();
    await expect(page.locator('#filterEndDate')).toBeVisible();
    
    // テーブル構造を確認
    await expect(page.locator('.records-table')).toBeVisible();
    await expect(page.locator('.records-table th').first()).toContainText('ID');
    
    // アニメーション完了を待つ
    await page.waitForTimeout(500);
    
    // ビジュアルリグレッションテスト - ClocksListPage.screenshot.pngに保存
    await expect(page).toHaveScreenshot(['ClocksListPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('should filter records by user ID', async ({ page }) => {
    // 初期データの読み込みを待つ
    await page.waitForSelector('.records-table tbody tr');
    
    // ユーザーIDでフィルタリング
    await page.locator('#filterUserId').fill('user001');
    await page.getByRole('button', { name: '検索' }).click();
    
    // フィルタリング結果を待つ
    await page.waitForTimeout(500);
    
    // 結果にフィルタリングしたユーザーが含まれることを確認
    const firstRow = page.locator('.records-table tbody tr').first();
    await expect(firstRow).toContainText('user001');
  });

  test('should reset filters', async ({ page }) => {
    // フィルターを設定
    await page.locator('#filterUserId').fill('user001');
    await page.locator('#filterType').selectOption('clock-in');
    
    // フィルターをリセット
    await page.getByRole('button', { name: 'リセット' }).click();
    
    // フィルターがクリアされたことを確認
    await expect(page.locator('#filterUserId')).toHaveValue('');
    await expect(page.locator('#filterType')).toHaveValue('all');
  });

  test('should navigate back to clock in page', async ({ page }) => {
    // 打刻画面へのリンクをクリック
    await page.getByRole('link', { name: '打刻画面に戻る' }).click();
    
    // 戻ることを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
  });
});
