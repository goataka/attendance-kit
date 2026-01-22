import { Given } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  DynamoDBClient,
  ScanCommand,
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

// Export for use in other step files
export { browser, context, page, FRONTEND_URL, BACKEND_URL, dynamoClient, TABLE_NAME };

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
  // バックエンドのヘルスチェック
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✓ Backend server is healthy: ${JSON.stringify(data)}`);
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
