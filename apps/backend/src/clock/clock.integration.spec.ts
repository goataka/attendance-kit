import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { ClockService } from './clock.service';
import { JwtService } from '@nestjs/jwt';
import { ClockType } from './dto/clock.dto';

// 統合テスト用の環境変数設定
// LocalStack使用時は USE_LOCALSTACK=true を設定
describe('ClockController (Integration)', () => {
  let app: INestApplication;
  let clockService: ClockService;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    // 統合テスト用環境変数の確認
    const useLocalStack = process.env.USE_LOCALSTACK === 'true';
    console.log(`Integration test mode: ${useLocalStack ? 'LocalStack' : 'Mock'}`);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClockService)
      .useValue({
        clockIn: jest.fn(),
        clockOut: jest.fn(),
        getRecords: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    clockService = moduleFixture.get<ClockService>(ClockService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test JWT token
    authToken = jwtService.sign({ userId: 'test-user', sub: 'test-user' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/clock/in (POST)', () => {
    it('should record clock-in successfully', () => {
      const mockResponse = {
        userId: 'test-user',
        timestamp: '2025-12-25T09:00:00Z',
        date: '2025-12-25',
        type: ClockType.CLOCK_IN,
        location: 'Tokyo Office',
        deviceId: 'device-123',
      };

      jest.spyOn(clockService, 'clockIn').mockResolvedValue(mockResponse);

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
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/clock/in')
        .send({
          location: 'Tokyo Office',
        })
        .expect(401);
    });
  });

  describe('/api/clock/out (POST)', () => {
    it('should record clock-out successfully', () => {
      const mockResponse = {
        userId: 'test-user',
        timestamp: '2025-12-25T18:00:00Z',
        date: '2025-12-25',
        type: ClockType.CLOCK_OUT,
        location: 'Tokyo Office',
        deviceId: 'device-123',
      };

      jest.spyOn(clockService, 'clockOut').mockResolvedValue(mockResponse);

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
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/clock/out')
        .send({
          location: 'Tokyo Office',
        })
        .expect(401);
    });
  });

  describe('/api/clock/records (GET)', () => {
    it('should retrieve clock records successfully', () => {
      const mockRecords = [
        {
          userId: 'test-user',
          timestamp: '2025-12-25T09:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_IN,
          location: 'Tokyo Office',
        },
        {
          userId: 'test-user',
          timestamp: '2025-12-25T18:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_OUT,
          location: 'Tokyo Office',
        },
      ];

      jest.spyOn(clockService, 'getRecords').mockResolvedValue(mockRecords);

      return request(app.getHttpServer())
        .get('/api/clock/records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].type).toBe(ClockType.CLOCK_IN);
          expect(res.body[1].type).toBe(ClockType.CLOCK_OUT);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer()).get('/api/clock/records').expect(401);
    });

    it('should return empty array when no records exist', () => {
      jest.spyOn(clockService, 'getRecords').mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/api/clock/records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });
});
