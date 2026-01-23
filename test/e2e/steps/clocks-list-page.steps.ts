import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { page, dynamoClient, TABLE_NAME } from './common.steps';

// Test credentials
const TEST_USER_ID = 'user001';

// ClocksListPage - 打刻一覧ページのステップ
Then('Clock-inデータがDynamoDBに保存される', async function () {
  // 打刻一覧ページに移動
  await page.click('text=打刻一覧を見る');
  await page.waitForLoadState('networkidle');
  
  // テーブルが表示されることを確認
  const table = await page.waitForSelector('table', { timeout: 5000 });
  expect(table).toBeDefined();
  
  // DynamoDBから直接確認
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);
  
  console.log(`📊 DynamoDB scan result: ${JSON.stringify(result, null, 2)}`);
  console.log(`📊 Found ${result.Items?.length || 0} items in DynamoDB`);
  
  // TEST_USER_IDのclock-inレコードが存在することを確認
  const clockInRecord = result.Items?.find(
    item => item.userId?.S === TEST_USER_ID && item.type?.S === 'clock-in'
  );
  
  if (!clockInRecord) {
    console.error(`❌ Clock-in record not found for ${TEST_USER_ID}`);
    console.error(`Available items: ${JSON.stringify(result.Items, null, 2)}`);
  }
  
  expect(clockInRecord).toBeDefined();
  
  console.log(`✓ Found clock-in record for ${TEST_USER_ID} in DynamoDB`);
});
