import { test, expect } from '@playwright/test';

test.describe('Clock In/Out Page', () => {
  // ログインを行うヘルパー関数
  async function login(page: any) {
    await page.goto('/login');
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('/clock');
  }

  test('should display clock in/out form after login', async ({ page }) => {
    await login(page);
    
    // Check page title
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
    
    // Check user info
    await expect(page.locator('.user-id')).toContainText('User: user001');
    
    // Check form elements
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

  test('should handle clock in after login', async ({ page }) => {
    await login(page);
    
    // Fill in password only (user is already authenticated)
    await page.locator('#password').fill('password123');
    
    // Click clock in button
    await page.getByRole('button', { name: '出勤' }).click();
    
    // Wait for success message
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Clock in successful');
  });

  test('should show error for empty password', async ({ page }) => {
    await login(page);
    
    // Click clock in without filling password
    await page.getByRole('button', { name: '出勤' }).click();
    
    // Wait for error message
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText('Password is required');
  });

  test('should navigate to records list', async ({ page }) => {
    await login(page);
    
    // Click link to records
    await page.getByRole('link', { name: '打刻一覧を見る' }).click();
    
    // Should navigate to records page
    await expect(page).toHaveURL('/clocks');
    await expect(page.locator('h1')).toHaveText('打刻一覧');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access clock page without login
    await page.goto('/clock');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toHaveText('ログイン');
  });
});
