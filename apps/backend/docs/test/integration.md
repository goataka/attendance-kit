# NestJS 統合テスト

## 目的

データベース操作とAPIエンドポイントの統合的な動作を検証

## テスト内容

### DynamoDBへのCRUD操作
- Create、Read、Update、Delete操作の成功確認
- トランザクション処理の検証

### GSI/LSIを利用した検索挙動
- セカンダリインデックスを使用したクエリ
- 複雑な検索条件の動作確認

### AWS SDK v3の型定義整合性
- DynamoDBクライアントの型安全性
- レスポンス形式の検証

## 使用ツール

**Jest + Supertest**
- SupertestでHTTPリクエストをシミュレート
- LocalStackのDynamoDBを使用

## 実行タイミング

- プルリクエスト作成時
- 定期的な統合テスト実行

## 接続先

LocalStack（DynamoDB）

## 実行方法

```bash
cd apps/backend
npm run test:e2e
```

## 実装例

```typescript
// apps/backend/test/integration/attendance.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

describe('Attendance API (e2e)', () => {
  let app: INestApplication;
  let dynamoClient: DynamoDBClient;

  beforeAll(async () => {
    // LocalStack DynamoDBクライアント設定
    dynamoClient = new DynamoDBClient({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    // テスト用テーブル作成
    await createTestTable(dynamoClient);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/attendance (POST)', () => {
    it('should create attendance record', () => {
      return request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-01T09:00:00Z',
          clockOut: '2024-01-01T18:00:00Z',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe('user-123');
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          // clockIn missing
        })
        .expect(400);
    });
  });

  describe('/attendance/:id (GET)', () => {
    it('should retrieve attendance record', async () => {
      // 先にデータを作成
      const createResponse = await request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-01T09:00:00Z',
          clockOut: '2024-01-01T18:00:00Z',
        });

      const attendanceId = createResponse.body.id;

      // データを取得
      return request(app.getHttpServer())
        .get(`/attendance/${attendanceId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(attendanceId);
          expect(res.body.userId).toBe('user-123');
        });
    });

    it('should return 404 for non-existent record', () => {
      return request(app.getHttpServer())
        .get('/attendance/non-existent-id')
        .expect(404);
    });
  });

  describe('/attendance (GET) with query parameters', () => {
    beforeAll(async () => {
      // テストデータを複数作成
      await request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-01T09:00:00Z',
          clockOut: '2024-01-01T18:00:00Z',
        });

      await request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-02T09:00:00Z',
          clockOut: '2024-01-02T18:00:00Z',
        });
    });

    it('should filter by userId', () => {
      return request(app.getHttpServer())
        .get('/attendance')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          res.body.forEach(record => {
            expect(record.userId).toBe('user-123');
          });
        });
    });

    it('should filter by date range', () => {
      return request(app.getHttpServer())
        .get('/attendance')
        .query({
          userId: 'user-123',
          startDate: '2024-01-01',
          endDate: '2024-01-01',
        })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
        });
    });
  });

  describe('/attendance/:id (PUT)', () => {
    it('should update attendance record', async () => {
      // 先にデータを作成
      const createResponse = await request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-01T09:00:00Z',
          clockOut: '2024-01-01T18:00:00Z',
        });

      const attendanceId = createResponse.body.id;

      // データを更新
      return request(app.getHttpServer())
        .put(`/attendance/${attendanceId}`)
        .send({
          clockOut: '2024-01-01T19:00:00Z',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(attendanceId);
          expect(res.body.clockOut).toBe('2024-01-01T19:00:00Z');
        });
    });
  });

  describe('/attendance/:id (DELETE)', () => {
    it('should delete attendance record', async () => {
      // 先にデータを作成
      const createResponse = await request(app.getHttpServer())
        .post('/attendance')
        .send({
          userId: 'user-123',
          clockIn: '2024-01-01T09:00:00Z',
          clockOut: '2024-01-01T18:00:00Z',
        });

      const attendanceId = createResponse.body.id;

      // データを削除
      await request(app.getHttpServer())
        .delete(`/attendance/${attendanceId}`)
        .expect(200);

      // 削除されたことを確認
      return request(app.getHttpServer())
        .get(`/attendance/${attendanceId}`)
        .expect(404);
    });
  });
});

async function createTestTable(client: DynamoDBClient) {
  const command = new CreateTableCommand({
    TableName: 'AttendanceTable',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'clockIn', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'clockIn', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  try {
    await client.send(command);
  } catch (error) {
    // テーブルが既に存在する場合は無視
    if (error.name !== 'ResourceInUseException') {
      throw error;
    }
  }
}
```

## LocalStack環境構築

```bash
# LocalStackコンテナの起動
docker run -d \
  --name localstack \
  -p 4566:4566 \
  -e SERVICES=dynamodb \
  localstack/localstack

# 起動確認
curl http://localhost:4566/_localstack/health
```

## テストカバレッジ目標

70%以上

## ベストプラクティス

### 1. テストデータのクリーンアップ

```typescript
afterEach(async () => {
  // テスト後にデータをクリーンアップ
  await clearTestData(dynamoClient);
});
```

### 2. エンドポイントの網羅的なテスト

- 正常系
- 異常系（バリデーションエラー）
- 認証・認可エラー
- 404エラー

### 3. レスポンスの詳細な検証

```typescript
.expect(res => {
  expect(res.body).toMatchObject({
    id: expect.any(String),
    userId: 'user-123',
    clockIn: expect.any(String),
  });
});
```
