import { test, expect } from '@playwright/test';

test.describe('打刻ページ', () => {
  test('打刻フォームが表示されること', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page.locator('h1')).toHaveText('勤怠打刻');

    // Check form elements
    await expect(page.locator('#userId')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: '出勤' })).toBeVisible();
    await expect(page.getByRole('button', { name: '退勤' })).toBeVisible();

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    // Visual regression test - saves to ClockInOutPage.screenshot.png
    await expect(page).toHaveScreenshot(['ClockInOutPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('出勤打刻ができること', async ({ page }) => {
    await page.goto('/');

    // Fill in credentials
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');

    // Click clock in button
    await page.getByRole('button', { name: '出勤' }).click();

    // Wait for success message
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText(
      'Clock in successful',
    );
  });

  test('入力が空の場合はエラーが表示されること', async ({ page }) => {
    await page.goto('/');

    // Click clock in without filling fields
    await page.getByRole('button', { name: '出勤' }).click();

    // Wait for error message
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText(
      'User ID and password are required',
    );
  });

  test('打刻一覧ページに遷移できること', async ({ page }) => {
    await page.goto('/');

    // Click link to records
    await page.getByRole('link', { name: '打刻一覧を見る' }).click();

    // Should navigate to records page
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });
});
