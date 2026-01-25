import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

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
 * Generic service verification wrapper
 */
async function verifyService(
  name: string,
  verifyFn: () => Promise<void>,
): Promise<void> {
  try {
    await verifyFn();
  } catch (error) {
    throw new Error(`${name} verification failed: ${error}`);
  }
}

/**
 * Verify that DynamoDB is accessible
 */
async function verifyDynamoDB(): Promise<void> {
  await verifyService('DynamoDB', async () => {
    const command = new ScanCommand({ TableName: TABLE_NAME, Limit: 1 });
    await dynamoClient.send(command);
  });
}

/**
 * Verify that Backend server is accessible
 */
async function verifyBackend(): Promise<void> {
  await verifyService('Backend', async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
  });
}

/**
 * Verify that Frontend server is accessible
 */
async function verifyFrontend(): Promise<void> {
  await verifyService('Frontend', async () => {
    const response = await fetch(FRONTEND_URL, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
  });
}

/**
 * Verify that all required services are running
 */
export async function verifyServicesRunning(): Promise<void> {
  await verifyDynamoDB();
  await verifyBackend();
  await verifyFrontend();
}
