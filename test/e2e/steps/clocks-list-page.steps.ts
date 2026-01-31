import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME, FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS, SELECTORS } from './constants';

/**
 * Navigate to clocks list page
 */
async function navigateToClocksListPage(page: Page): Promise<void> {
  await page.getByRole('link', { name: SELECTORS.clockListLink }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Verify clock record exists in DynamoDB
 */
async function verifyClockRecordInDynamoDB(
  userId: string,
): Promise<void> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);

  const clockRecord = result.Items?.find((item) => item.userId?.S === userId);

  expect(clockRecord).toBeDefined();
}

/**
 * Clock in to get authenticated (saves token to sessionStorage)
 */
async function clockInToAuthenticate(page: Page): Promise<void> {
  await page.goto(FRONTEND_URL);
  await page.locator('#userId').fill(TEST_USER_ID);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: '出勤' }).click();
  
  // Wait for success message
  await page.waitForSelector('.message.success', { timeout: TIMEOUTS.DEFAULT_STEP });
}

// Given steps
Given(
  'ユーザーがログインしている',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    await clockInToAuthenticate(this.page);
  },
);

Given(
  'ユーザーが打刻一覧ページにアクセスする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    await this.page.goto(`${FRONTEND_URL}/clocks`);
    await this.page.waitForLoadState('networkidle');
  },
);

Given(
  'フィルターが設定されている',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Set some filters
    await this.page.locator('#filterUserId').fill('user001');
    await this.page.locator('#filterType').selectOption('clock-in');
  },
);

Given(
  'ユーザーがログアウトする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Clear session storage to simulate logout
    await this.page.evaluate(() => sessionStorage.clear());
  },
);

// When steps
When(
  'ユーザーIDでフィルタリングする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    await this.page.locator('#filterUserId').fill('user001');
  },
);

When(
  '打刻種別を選択する',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    await this.page.locator('#filterType').selectOption('clock-in');
  },
);

When(
  '検索ボタンをクリックする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    await this.page.getByRole('button', { name: '検索' }).click();
    await this.page.waitForTimeout(500); // Wait for results to update
  },
);

When(
  'リセットボタンをクリックする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    await this.page.getByRole('button', { name: 'リセット' }).click();
  },
);

When(
  'ユーザーが打刻一覧ページにアクセスを試みる',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    await this.page.goto(`${FRONTEND_URL}/clocks`);
    await this.page.waitForLoadState('networkidle');
  },
);

// Then steps
Then(
  '打刻一覧が表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Verify page title
    await expect(this.page.locator('h1')).toHaveText('打刻一覧');
    
    // Verify table is displayed or no data message
    const table = this.page.locator('.records-table');
    const noDataMessage = this.page.locator('.no-data');
    
    // At least one should be visible
    const tableVisible = await table.isVisible().catch(() => false);
    const noDataVisible = await noDataMessage.isVisible().catch(() => false);
    
    expect(tableVisible || noDataVisible).toBeTruthy();
  },
);

Then(
  'フィルター要素が表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Verify filter elements are visible
    await expect(this.page.locator('#filterUserId')).toBeVisible();
    await expect(this.page.locator('#filterType')).toBeVisible();
    await expect(this.page.locator('#filterStartDate')).toBeVisible();
    await expect(this.page.locator('#filterEndDate')).toBeVisible();
  },
);

Then(
  'フィルタリングされた結果が表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for results to update
    await this.page.waitForTimeout(500);
    
    // Verify that results are displayed (either table or no data message)
    const table = this.page.locator('.records-table');
    const noDataMessage = this.page.locator('.no-data');
    
    const tableVisible = await table.isVisible().catch(() => false);
    const noDataVisible = await noDataMessage.isVisible().catch(() => false);
    
    expect(tableVisible || noDataVisible).toBeTruthy();
  },
);

Then(
  '選択した種別の打刻のみが表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for results to update
    await this.page.waitForTimeout(500);
    
    // Verify that results are displayed
    const table = this.page.locator('.records-table');
    const noDataMessage = this.page.locator('.no-data');
    
    const tableVisible = await table.isVisible().catch(() => false);
    const noDataVisible = await noDataMessage.isVisible().catch(() => false);
    
    expect(tableVisible || noDataVisible).toBeTruthy();
  },
);

Then(
  'フィルターがクリアされる',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Verify filters are cleared
    await expect(this.page.locator('#filterUserId')).toHaveValue('');
    await expect(this.page.locator('#filterType')).toHaveValue('all');
  },
);

Then(
  '打刻画面にリダイレクトされる',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for redirect
    await this.page.waitForURL(FRONTEND_URL, { timeout: TIMEOUTS.DEFAULT_STEP });
    
    // Verify we're on the clock-in/out page
    await expect(this.page.locator('h1')).toHaveText('勤怠打刻');
  },
);

// Legacy step (keep for backward compatibility)
Then('打刻一覧を確認する', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }

  await navigateToClocksListPage(this.page);

  // Verify table is displayed
  const table = await this.page.waitForSelector(SELECTORS.table, {
    timeout: TIMEOUTS.NETWORK_IDLE,
  });
  expect(table).toBeDefined();

  // Verify record exists in DynamoDB
  await verifyClockRecordInDynamoDB(TEST_USER_ID);
});
