import { test, expect } from '@playwright/test';

test.describe('打刻ページ', () => {
  test('ログインフォームと打刻ボタンが表示されること', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
    
    // 出勤・退勤ボタンは常に表示され、未ログイン時も有効
    await expect(page.getByRole('button', { name: '出勤' })).toBeVisible();
    await expect(page.getByRole('button', { name: '退勤' })).toBeVisible();
    await expect(page.getByRole('button', { name: '出勤' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '退勤' })).toBeEnabled();
    
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

  test('ログインが成功し打刻ボタンが有効になること', async ({ page }) => {
    await page.goto('/');
    
    // 認証情報を入力
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 成功メッセージを待つ
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Login successful');
    
    // ログイン後も打刻ボタンが有効
    await expect(page.getByRole('button', { name: '出勤' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '退勤' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
    
    // ログインフォームは非表示
    await expect(page.locator('#userId')).not.toBeVisible();
    await expect(page.locator('#password')).not.toBeVisible();
  });

  test('未ログイン時にユーザーIDとパスワードで出勤打刻ができること', async ({ page }) => {
    await page.goto('/');
    
    // 認証情報を入力
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    
    // 出勤ボタンをクリック（ログインせずに直接打刻）
    await page.getByRole('button', { name: '出勤' }).click();
    
    // 成功メッセージを待つ
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText(
      'Clock in successful',
    );
  });

  test('ログイン後に出勤打刻ができること', async ({ page }) => {
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

  test('入力フィールドが空の場合はエラーを表示すること', async ({ page }) => {
    await page.goto('/');
    
    // フィールドを入力せずにログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // エラーメッセージを待つ
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText(
      'User ID and password are required',
    );
  });

  test('打刻一覧ページへ遷移できること', async ({ page }) => {
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
