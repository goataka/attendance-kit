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

describe('DynamoDB LocalStack統合テスト', () => {
  describe('テーブル作成', () => {
    it('テーブル一覧にattendance-kit-dev-clockが含まれること', async () => {
      // Given: LocalStackが起動している
      // When: テーブル一覧を取得
      const command = new ListTablesCommand({});
      const response = await client.send(command);

      // Then: attendance-kit-dev-clockテーブルが存在する
      expect(response.TableNames).toBeDefined();
      expect(response.TableNames).toContain(TABLE_NAME);
    });

    it('テーブル構造が正しいこと', async () => {
      const command = new DescribeTableCommand({
        TableName: TABLE_NAME,
      });
      const response = await client.send(command);

      expect(response.Table).toBeDefined();
      expect(response.Table?.TableName).toBe(TABLE_NAME);
      expect(response.Table?.BillingModeSummary?.BillingMode).toBe(
        'PAY_PER_REQUEST',
      );

      // Verify key schema
      const keySchema = response.Table?.KeySchema || [];
      expect(keySchema).toHaveLength(1);
      expect(
        keySchema.find((k) => k.AttributeName === 'id' && k.KeyType === 'HASH'),
      ).toBeDefined();

      // Verify GSI
      const gsi = response.Table?.GlobalSecondaryIndexes || [];
      expect(gsi).toHaveLength(1);
      expect(gsi[0].IndexName).toBe('UserIdTimestampIndex');
    });
  });

  describe('CRUD操作', () => {
    const testId = 'test-id-123';
    const testUserId = 'test-user';
    const testTimestamp = new Date().toISOString();
    const testDate = testTimestamp.split('T')[0];

    it('テーブルにアイテムを追加できること', async () => {
      // Given: テーブルとテストデータ
      const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          id: { S: testId },
          userId: { S: testUserId },
          timestamp: { S: testTimestamp },
          date: { S: testDate },
          type: { S: 'clock-in' },
        },
      });

      // When: アイテムを追加
      const response = await client.send(command);

      // Then: 正常に追加される
      expect(response.$metadata.httpStatusCode).toBe(200);
    });

    it('テーブルからアイテムを取得できること', async () => {
      // Given: テーブルに保存されたアイテム
      const command = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          id: { S: testId },
        },
      });

      // When: アイテムを取得
      const response = await client.send(command);

      // Then: 正しいデータが取得される
      expect(response.Item).toBeDefined();
      expect(response.Item?.id?.S).toBe(testId);
      expect(response.Item?.userId?.S).toBe(testUserId);
      expect(response.Item?.timestamp?.S).toBe(testTimestamp);
      expect(response.Item?.date?.S).toBe(testDate);
      expect(response.Item?.type?.S).toBe('clock-in');
    });

    it('テーブルをスキャンしてアイテムを見つけられること', async () => {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });

      const response = await client.send(command);
      expect(response.Items).toBeDefined();
      expect(response.Count).toBeGreaterThan(0);

      // Find our test item
      const testItem = response.Items?.find((item) => item.id?.S === testId);
      expect(testItem).toBeDefined();
    });
  });
});
