import { test, expect } from '@playwright/test';

test.describe('Clock In/Out Page', () => {
  test('should display login form with clock buttons', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
    
    // 出勤・退勤ボタンは常に表示される（未ログイン時は無効）
    await expect(page.getByRole('button', { name: '出勤' })).toBeVisible();
    await expect(page.getByRole('button', { name: '退勤' })).toBeVisible();
    await expect(page.getByRole('button', { name: '出勤' })).toBeDisabled();
    await expect(page.getByRole('button', { name: '退勤' })).toBeDisabled();
    
    // フォーム要素を確認（ログイン前）
    await expect(page.locator('#userId')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // アニメーション完了を待つ
    await page.waitForTimeout(500);
    
    // ビジュアルリグレッションテスト - ClockInOutPage.screenshot.pngに保存
    
    await expect(page).toHaveScreenshot(['ClockInOutPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('should login successfully and enable clock buttons', async ({ page }) => {
    await page.goto('/');
    
    // 認証情報を入力
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 成功メッセージを待つ
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Login successful');
    
    // ログイン後は打刻ボタンが有効になる
    await expect(page.getByRole('button', { name: '出勤' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '退勤' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
    
    // ログインフォームは非表示
    await expect(page.locator('#userId')).not.toBeVisible();
    await expect(page.locator('#password')).not.toBeVisible();
  });

  test('should handle clock in', async ({ page }) => {
    await page.goto('/');
    
    // まずログイン
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForSelector('.message.success');
    
    // 出勤ボタンをクリック
    await page.getByRole('button', { name: '出勤' }).click();
    
    // 成功メッセージを待つ
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText(
      'Clock in successful',
    );
  });

  test('should show error for empty fields', async ({ page }) => {
    await page.goto('/');
    
    // フィールドを入力せずにログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // エラーメッセージを待つ
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText(
      'User ID and password are required',
    );
  });

  test('should navigate to records list', async ({ page }) => {
    await page.goto('/');
    
    // まずログイン
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForSelector('.message.success');
    
    // 打刻一覧へのリンクをクリック
    await page.getByRole('link', { name: '打刻一覧を見る' }).click();
    
    // 打刻一覧ページに遷移するはず
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });
});
