import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID } from './helpers';

// Navigate to clocks list page
async function navigateToClocksListPage(page: any): Promise<void> {
  await page.click('text=打刻一覧を見る');
  await page.waitForLoadState('networkidle');
}

// 打刻一覧ページのステップ
Then('打刻一覧を確認する', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  
  await navigateToClocksListPage(this.page);
  
  // Verify table is displayed
  const table = await this.page.waitForSelector('table', { timeout: 5000 });
  expect(table).toBeDefined();
  
  // Verify record exists in DynamoDB
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);
  
  const clockRecord = result.Items?.find(
    item => item.userId?.S === TEST_USER_ID
  );
  
  expect(clockRecord).toBeDefined();
});
