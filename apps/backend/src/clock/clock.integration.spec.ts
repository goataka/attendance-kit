import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { ClockType } from './dto/clock.dto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 統合テスト用の環境変数をモジュール読み込み前に設定
process.env.USE_LOCALSTACK = 'true';
process.env.AWS_REGION = 'ap-northeast-1';
process.env.DYNAMODB_TABLE_NAME = 'attendance-kit-test-clock';
process.env.DYNAMODB_ENDPOINT = 'http://localhost:4566';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// .envファイルが存在する場合は読み込む
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (error) {
  // .envファイルが存在しない場合は環境変数のみを使用
}

// LocalStack使用時は USE_LOCALSTACK=true を設定
describe('ClockController（統合テスト）', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    // 環境変数が正しく設定されているか確認

    const useLocalStack = process.env.USE_LOCALSTACK === 'true';
    console.log(
      `Integration test mode: ${useLocalStack ? 'LocalStack' : 'Local'}`,
    );

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

  afterAll(async () => {
    await app.close();
  });

  describe('/api/clock/in (POST)', () => {
    it('出勤打刻が正常に記録されること', () => {
      // Given: 認証済みのユーザーと打刻データ
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
      // Given: 認証済みのユーザー
      // When: GET /api/clock/records を呼び出す
      // Then: 200ステータスと打刻記録の配列が返される
      return request(app.getHttpServer())
        .get('/api/clock/records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // 統合テストでは実際のデータが返る
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('userId');
            expect(res.body[0]).toHaveProperty('timestamp');
            expect(res.body[0]).toHaveProperty('type');
          }
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
