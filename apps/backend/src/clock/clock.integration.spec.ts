import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { ClockType } from './dto/clock.dto';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

// 統合テスト用の環境変数をモジュール読み込み前に設定
process.env.AWS_REGION = 'ap-northeast-1';
process.env.DYNAMODB_TABLE_NAME = 'attendance-kit-test-clock';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// DynamoDBDocumentClientのモック作成
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('ClockController（統合テスト）', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test JWT token
    authToken = jwtService.sign({ userId: 'test-user', sub: 'test-user' });
  });

  beforeEach(() => {
    // 各テスト前にモックをリセット
    ddbMock.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/clock/in (POST)', () => {
    it('出勤打刻が正常に記録されること', () => {
      // Given: 認証済みのユーザーと打刻データ
      // DynamoDBのPutCommandが成功することをモック
      ddbMock.on(PutCommand).resolves({});

      // When: POST /api/clock/in を呼び出す
      // Then: 201ステータスと出勤打刻データが返される
      return request(app.getHttpServer())
        .post('/api/clock/in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: 'Tokyo Office',
          deviceId: 'device-123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.userId).toBe('test-user');
          expect(res.body.type).toBe(ClockType.CLOCK_IN);
          expect(res.body.location).toBe('Tokyo Office');
        });
    });

    it('認証なしでは401を返すこと', () => {
      // Given: 認証トークンなしのリクエスト
      // When: POST /api/clock/in を呼び出す
      // Then: 401ステータスが返される
      return request(app.getHttpServer())
        .post('/api/clock/in')
        .send({
          location: 'Tokyo Office',
        })
        .expect(401);
    });
  });

  describe('/api/clock/out (POST)', () => {
    it('退勤打刻が正常に記録されること', () => {
      // Given: 認証済みのユーザーと打刻データ
      // DynamoDBのPutCommandが成功することをモック
      ddbMock.on(PutCommand).resolves({});

      // When: POST /api/clock/out を呼び出す
      // Then: 201ステータスと退勤打刻データが返される
      return request(app.getHttpServer())
        .post('/api/clock/out')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: 'Tokyo Office',
          deviceId: 'device-123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.userId).toBe('test-user');
          expect(res.body.type).toBe(ClockType.CLOCK_OUT);
          expect(res.body.location).toBe('Tokyo Office');
        });
    });

    it('認証なしでは401を返すこと', () => {
      // Given: 認証トークンなしのリクエスト
      // When: POST /api/clock/out を呼び出す
      // Then: 401ステータスが返される
      return request(app.getHttpServer())
        .post('/api/clock/out')
        .send({
          location: 'Tokyo Office',
        })
        .expect(401);
    });
  });

  describe('/api/clock/records (GET)', () => {
    it('打刻記録が正常に取得されること', () => {
      // Given: 認証済みのユーザーとモックデータ（降順：最新が先頭）
      const mockRecords = [
        {
          id: 'test-id-2',
          userId: 'test-user',
          timestamp: '2025-12-25T18:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_OUT,
          location: 'Tokyo Office',
        },
        {
          id: 'test-id-1',
          userId: 'test-user',
          timestamp: '2025-12-25T09:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_IN,
          location: 'Tokyo Office',
        },
      ];
      ddbMock.on(QueryCommand).resolves({ Items: mockRecords });

      // When: GET /api/clock/records を呼び出す
      // Then: 200ステータスと打刻記録の配列が返される（降順）
      return request(app.getHttpServer())
        .get('/api/clock/records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('userId');
          expect(res.body[0]).toHaveProperty('timestamp');
          expect(res.body[0]).toHaveProperty('type');
          // 降順なので最新のCLOCK_OUTが先頭
          expect(res.body[0].type).toBe(ClockType.CLOCK_OUT);
          expect(res.body[1].type).toBe(ClockType.CLOCK_IN);
        });
    });

    it('認証なしでは401を返すこと', () => {
      // Given: 認証トークンなしのリクエスト
      // When: GET /api/clock/records を呼び出す
      // Then: 401ステータスが返される
      return request(app.getHttpServer()).get('/api/clock/records').expect(401);
    });
  });
});
