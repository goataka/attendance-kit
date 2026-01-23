import { Before, After, AfterAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CustomWorld } from './world';

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

/**
 * Verify that all required services are running
 */
async function verifyServices(): Promise<void> {
  // Verify DynamoDB
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME, Limit: 1 });
    await dynamoClient.send(command);
  } catch (error) {
    throw new Error(`LocalStack DynamoDB is not accessible: ${error}`);
  }

  // Verify Backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Backend server is not accessible: ${error}`);
  }
}

// Setup before each scenario
Before(async function (this: CustomWorld) {
  // Verify all services are running
  await verifyServices();

  // Create browser if not exists
  if (!this.browser) {
    this.browser = await chromium.launch({ headless: true });
  }
  
  // Create new context and page for each scenario
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Cleanup after each scenario
After(async function (this: CustomWorld) {
  if (this.page) {
    await this.page.close().catch(() => {});
  }
  if (this.context) {
    await this.context.close().catch(() => {});
  }
});

// Cleanup after all tests
AfterAll(async function (this: CustomWorld) {
  if (this.browser) {
    await this.browser.close().catch(() => {});
  }
});
