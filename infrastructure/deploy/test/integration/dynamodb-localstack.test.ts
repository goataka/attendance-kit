import { describe, it, expect, beforeAll } from 'vitest';
import {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';

// LocalStack DynamoDB client configuration
const client = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const TABLE_NAME = 'attendance-kit-dev-clock';

describe('DynamoDB LocalStack Integration Tests', () => {
  describe('Table Creation', () => {
    it('should list tables and find attendance-kit-dev-clock', async () => {
      const command = new ListTablesCommand({});
      const response = await client.send(command);
      
      expect(response.TableNames).toBeDefined();
      expect(response.TableNames).toContain(TABLE_NAME);
    });

    it('should describe table and verify structure', async () => {
      const command = new DescribeTableCommand({
        TableName: TABLE_NAME,
      });
      const response = await client.send(command);
      
      expect(response.Table).toBeDefined();
      expect(response.Table?.TableName).toBe(TABLE_NAME);
      expect(response.Table?.BillingModeSummary?.BillingMode).toBe('PAY_PER_REQUEST');
      
      // Verify key schema
      const keySchema = response.Table?.KeySchema || [];
      expect(keySchema).toHaveLength(2);
      expect(keySchema.find(k => k.AttributeName === 'userId' && k.KeyType === 'HASH')).toBeDefined();
      expect(keySchema.find(k => k.AttributeName === 'timestamp' && k.KeyType === 'RANGE')).toBeDefined();
      
      // Verify GSI
      const gsi = response.Table?.GlobalSecondaryIndexes || [];
      expect(gsi).toHaveLength(1);
      expect(gsi[0].IndexName).toBe('DateIndex');
    });
  });

  describe('CRUD Operations', () => {
    const testUserId = 'test-user';
    const testTimestamp = new Date().toISOString();
    const testDate = testTimestamp.split('T')[0];

    it('should put an item into the table', async () => {
      const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          userId: { S: testUserId },
          timestamp: { S: testTimestamp },
          date: { S: testDate },
          type: { S: 'clock-in' },
        },
      });
      
      const response = await client.send(command);
      expect(response.$metadata.httpStatusCode).toBe(200);
    });

    it('should get the item from the table', async () => {
      const command = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: { S: testUserId },
          timestamp: { S: testTimestamp },
        },
      });
      
      const response = await client.send(command);
      expect(response.Item).toBeDefined();
      expect(response.Item?.userId?.S).toBe(testUserId);
      expect(response.Item?.timestamp?.S).toBe(testTimestamp);
      expect(response.Item?.date?.S).toBe(testDate);
      expect(response.Item?.type?.S).toBe('clock-in');
    });

    it('should scan the table and find items', async () => {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });
      
      const response = await client.send(command);
      expect(response.Items).toBeDefined();
      expect(response.Count).toBeGreaterThan(0);
      
      // Find our test item
      const testItem = response.Items?.find(
        item => item.userId?.S === testUserId && item.timestamp?.S === testTimestamp
      );
      expect(testItem).toBeDefined();
    });
  });
});
