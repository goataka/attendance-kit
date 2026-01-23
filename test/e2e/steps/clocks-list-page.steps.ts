import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from './common.steps';
import { CustomWorld } from './world';
import { TEST_USER_ID, navigateToClocksListPage } from './helpers';

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
  
  const clockInRecord = result.Items?.find(
    item => item.userId?.S === TEST_USER_ID && item.type?.S === 'clock-in'
  );
  
  expect(clockInRecord).toBeDefined();
});
