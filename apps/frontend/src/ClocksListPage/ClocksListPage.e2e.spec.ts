import { test, expect } from '@playwright/test';

test.describe('Clocks List Page', () => {
  test('should display records list', async ({ page }) => {
    await page.goto('/clocks');
    
    // Check page title
    await expect(page.locator('h1')).toHaveText('打刻一覧');
    
    // Check filter elements
    await expect(page.locator('#filterUserId')).toBeVisible();
    await expect(page.locator('#filterType')).toBeVisible();
    await expect(page.locator('#filterStartDate')).toBeVisible();
    await expect(page.locator('#filterEndDate')).toBeVisible();
    
    // Check table structure
    await expect(page.locator('.records-table')).toBeVisible();
    await expect(page.locator('.records-table th').first()).toContainText('ID');
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    // Visual regression test - saves to ClocksListPage.screenshot.png
    await expect(page).toHaveScreenshot('ClocksListPage.screenshot.png', {
      fullPage: true,
    });
  });

  test('should filter records by user ID', async ({ page }) => {
    await page.goto('/records');
    
    // Wait for initial data to load
    await page.waitForSelector('.records-table tbody tr');
    
    // Filter by user ID
    await page.locator('#filterUserId').fill('user001');
    await page.getByRole('button', { name: '検索' }).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check if results contain filtered user
    const firstRow = page.locator('.records-table tbody tr').first();
    await expect(firstRow).toContainText('user001');
  });

  test('should reset filters', async ({ page }) => {
    await page.goto('/clocks');
    
    // Set some filters
    await page.locator('#filterUserId').fill('user001');
    await page.locator('#filterType').selectOption('clock-in');
    
    // Reset filters
    await page.getByRole('button', { name: 'リセット' }).click();
    
    // Check if filters are cleared
    await expect(page.locator('#filterUserId')).toHaveValue('');
    await expect(page.locator('#filterType')).toHaveValue('all');
  });

  test('should navigate back to clock in page', async ({ page }) => {
    await page.goto('/clocks');
    
    // Click link to clock in page
    await page.getByRole('link', { name: '打刻画面に戻る' }).click();
    
    // Should navigate back
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('勤怠打刻');
  });
});
