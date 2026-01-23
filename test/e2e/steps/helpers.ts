import { Page } from '@playwright/test';

// Test credentials
export const TEST_USER_ID = 'user001';
export const TEST_PASSWORD = 'password123';

/**
 * Fill login credentials on the page
 */
export async function fillLoginCredentials(page: Page, userId: string = TEST_USER_ID, password: string = TEST_PASSWORD): Promise<void> {
  await page.fill('#userId', userId);
  await page.fill('#password', password);
}

/**
 * Click clock-in button and wait for message
 */
export async function clickClockInAndWaitForMessage(page: Page): Promise<void> {
  await page.click('text=出勤');
  await page.waitForSelector('.message', { timeout: 15000 });
}

/**
 * Navigate to clocks list page
 */
export async function navigateToClocksListPage(page: Page): Promise<void> {
  await page.click('text=打刻一覧を見る');
  await page.waitForLoadState('networkidle');
}
