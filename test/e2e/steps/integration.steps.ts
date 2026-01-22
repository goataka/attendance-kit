import { Given, When, Then } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

// Global state
let browser: Browser;
let context: BrowserContext;
let page: Page;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Test credentials
const TEST_USER_ID = 'user001';
const TEST_PASSWORD = 'password123';

// LocalStack DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const TABLE_NAME = 'attendance-kit-test-clock';

// Setup and Teardown
Given('LocalStackのDynamoDBが起動している', async function () {
  // DynamoDBの接続確認
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 1,
    });
    await dynamoClient.send(command);
    console.log('✓ LocalStack DynamoDB is accessible');
  } catch (error) {
    throw new Error(`LocalStack DynamoDB is not accessible: ${error}`);
  }
});

Given('バックエンドサーバーがローカルで起動している', async function () {
  // バックエンドの接続確認
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    console.log('✓ Backend server is accessible');
  } catch (error) {
    throw new Error(`Backend server is not accessible: ${error}`);
  }
});

Given('フロントエンドサーバーがローカルで起動している', async function () {
  // ブラウザとページの初期化
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();

  // フロントエンドの接続確認
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✓ Frontend server is accessible');
  } catch (error) {
    await browser.close();
    throw new Error(`Frontend server is not accessible: ${error}`);
  }
});

// Scenario: フロントエンドからバックエンドAPIへの接続確認
When('ユーザーがフロントエンドにアクセスする', async function () {
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
});

Then('フロントエンドページが正常に表示される', async function () {
  // ページタイトルまたは特定の要素が存在することを確認
  const title = await page.title();
  expect(title).toBeTruthy();
});

Then('バックエンドAPIへの接続が確立される', async function () {
  // APIヘルスチェック
  const response = await fetch(`${BACKEND_URL}/api/health`);
  expect(response.ok).toBe(true);
});

// Scenario: Clock-in操作のエンドツーエンドテスト
When('ユーザーがClock-inボタンをクリックする', async function () {
  // ページにアクセス
  await page.goto(FRONTEND_URL);
  
  // User IDとPasswordを入力
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  
  // Clock-inボタンをクリック（"出勤"ボタン）
  await page.click('text=出勤');
  
  // メッセージが表示されるまで待機
  await page.waitForSelector('.message.success', { timeout: 5000 });
});

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
  
  // TEST_USER_IDのclock-inレコードが存在することを確認
  const clockInRecord = result.Items?.find(
    item => item.userId?.S === TEST_USER_ID && item.type?.S === 'clock-in'
  );
  expect(clockInRecord).toBeDefined();
  
  console.log(`✓ Found clock-in record for ${TEST_USER_ID} in DynamoDB`);
});

Then('成功メッセージが表示される', async function () {
  // ホームページに戻って成功メッセージを確認
  await page.goto(FRONTEND_URL);
  
  // 最後のテストとして、もう一度clock-inして成功メッセージを確認
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('text=出勤');
  
  // 成功メッセージを確認
  const successMessage = await page.waitForSelector('.message.success', { timeout: 5000 });
  const messageText = await successMessage.textContent();
  expect(messageText).toContain('Clock in successful');
  
  console.log(`✓ Success message displayed: ${messageText}`);
  
  // ブラウザのクリーンアップ
  if (browser) {
    await browser.close();
  }
});
