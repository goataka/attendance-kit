import { Given, Before, After, AfterAll, setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  DynamoDBClient,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';

// Constants
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
export const TABLE_NAME = 'attendance-kit-test-clock';

// LocalStack DynamoDB client (shared across all scenarios)
export const dynamoClient = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

// Custom World to hold browser instances per scenario
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

// Set custom World
setWorldConstructor(CustomWorld);

// Setup and Teardown
Given('LocalStackのDynamoDBが起動している', async function (this: CustomWorld) {
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

Given('バックエンドサーバーがローカルで起動している', async function (this: CustomWorld) {
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

Given('フロントエンドサーバーがローカルで起動している', async function (this: CustomWorld) {
  // ブラウザの初期化（シナリオごと）
  if (!this.browser) {
    this.browser = await chromium.launch({ headless: true });
  }

  // フロントエンドの接続確認
  const testPage = await this.browser.newPage();
  try {
    await testPage.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✓ Frontend server is accessible');
  } catch (error) {
    throw new Error(`Frontend server is not accessible: ${error}`);
  } finally {
    await testPage.close();
  }
});

// Setup before each scenario
Before(async function (this: CustomWorld) {
  // Create browser if not exists
  if (!this.browser) {
    this.browser = await chromium.launch({ headless: true });
  }
  // Create new context and page for each scenario
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  console.log('✓ Browser context and page created for scenario');
});

// Cleanup after each scenario
After(async function (this: CustomWorld) {
  if (this.page) {
    await this.page.close().catch(() => {});
  }
  if (this.context) {
    await this.context.close().catch(() => {});
  }
  console.log('✓ Browser context and page closed after scenario');
});

// Cleanup after all tests
AfterAll(async function (this: CustomWorld) {
  if (this.browser) {
    await this.browser.close().catch(() => {});
    console.log('✓ Browser closed after all tests');
  }
});
