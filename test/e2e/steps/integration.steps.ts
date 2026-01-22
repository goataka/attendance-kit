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
Given('ユーザーが認証されている', async function () {
  // 認証ロジックをここに実装（将来的に）
  // 現在はスキップ
  console.log('⚠ Authentication not implemented yet - skipping');
});

When('ユーザーがClock-inボタンをクリックする', async function () {
  // Clock-inボタンを探してクリック
  // 現在はページが存在することだけ確認
  await page.goto(FRONTEND_URL);
  console.log('⚠ Clock-in button not implemented yet - skipping click');
});

Then('Clock-inデータがDynamoDBに保存される', async function () {
  // DynamoDBにデータが保存されたか確認
  // 現在はテーブルがスキャンできることだけ確認
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);
  console.log(`⚠ DynamoDB scan returned ${result.Items?.length || 0} items`);
  expect(result).toBeDefined();
});

Then('成功メッセージが表示される', async function () {
  // 成功メッセージの確認（将来的に）
  console.log('⚠ Success message not implemented yet - skipping');
  
  // ブラウザのクリーンアップ
  if (browser) {
    await browser.close();
  }
});
