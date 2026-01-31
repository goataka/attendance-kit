import { test, expect } from '@playwright/test';

test.describe('Clock In/Out Page', () => {
  test('should display clock in/out form', async ({ page }) => {
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

  test('should handle clock in', async ({ page }) => {
    await page.goto('/');
    
    // Fill in credentials
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    
    // Click clock in button
    await page.getByRole('button', { name: '出勤' }).click();
    
    // Wait for success message
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Clock in successful');
  });

  test('should show error for empty fields', async ({ page }) => {
    await page.goto('/');
    
    // Click clock in without filling fields
    await page.getByRole('button', { name: '出勤' }).click();
    
    // Wait for error message
    await expect(page.locator('.message.error')).toBeVisible();
    await expect(page.locator('.message.error')).toContainText('User ID and password are required');
  });

  test('should navigate to records list after clock in', async ({ page }) => {
    await page.goto('/');
    
    // Clock in first to get authenticated
    await page.locator('#userId').fill('user001');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: '出勤' }).click();
    await expect(page.locator('.message.success')).toBeVisible();
    
    // Click link to records
    await page.getByRole('link', { name: '打刻一覧を見る' }).click();
    
    // Should navigate to records page
    await expect(page).toHaveURL('/clocks');
  });

  test('should redirect to home when accessing records without authentication', async ({ page }) => {
    await page.goto('/clocks');
    
    // Should redirect back to home (not authenticated)
    await expect(page).toHaveURL('/');
  });
});
