import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page.locator('h1')).toHaveText('ログイン');
    
    // Check form elements
    await expect(page.locator('#userId')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // Check test accounts are displayed
    await expect(page.locator('.help-text')).toContainText('テスト用アカウント');
    await expect(page.locator('.help-text')).toContainText('user001');
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    // Visual regression test - saves to LoginPage.screenshot.png
    await expect(page).toHaveScreenshot(['LoginPage.screenshot.png'], {
      fullPage: true,
    });
  });

  test('should handle successful login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    
    // Click login button
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // Should navigate to clock page
    await expect(page).toHaveURL('/clock');
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
    await expect(page.locator('.user-id')).toContainText('User: user001');
  });

  test('should show error for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without filling fields
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // Wait for error message
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText('User ID and password are required');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.locator('#userId').fill('invaliduser');
    await page.locator('#password').fill('wrongpassword');
    
    // Click login button
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // Wait for error message
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText('Invalid credentials');
  });

  test('should redirect from root to login page', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toHaveText('ログイン');
  });
});
