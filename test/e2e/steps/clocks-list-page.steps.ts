import { Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID } from './helpers';
import { TIMEOUTS, SELECTORS } from './constants';

async function navigateToClocksListPage(page: Page): Promise<void> {
  await page.getByRole('link', { name: SELECTORS.clockListLink }).click();
  await page.waitForLoadState('networkidle');
}

async function verifyClockRecordInDynamoDB(userId: string): Promise<void> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);

  const clockRecord = result.Items?.find((item) => item.userId?.S === userId);

  expect(clockRecord).toBeDefined();
}

// Step definitions
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
