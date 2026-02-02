import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClockService } from './clock.service';
import { ClockType } from './dto/clock.dto';

// Mock DynamoDB client
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('ClockService', () => {
  let service: ClockService;
  let mockDocClient: any;

  beforeEach(async () => {
    mockDocClient = {
      send: jest.fn(),
    };

    // ConfigServiceのモック
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          AWS_REGION: 'ap-northeast-1',
          DYNAMODB_TABLE_NAME: 'attendance-kit-test-clock',
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClockService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ClockService>(ClockService);
    // Replace the docClient with our mock
    (service as any).docClient = mockDocClient;
  });

  it('サービスが定義されていること', () => {
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('出勤打刻が正常に記録されること', async () => {
      const userId = 'test-user';
      const location = 'Tokyo Office';
      const deviceId = 'device-123';

      mockDocClient.send.mockResolvedValue({});

      const result = await service.clockIn(userId, location, deviceId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe(ClockType.CLOCK_IN);
      expect(result.location).toBe(location);
      expect(result.deviceId).toBe(deviceId);
      expect(result.timestamp).toBeDefined();
      expect(result.date).toBeDefined();
      expect(mockDocClient.send).toHaveBeenCalledTimes(1);
    });

    it('オプションフィールドなしで出勤打刻が記録されること', async () => {
      const userId = 'test-user';

      mockDocClient.send.mockResolvedValue({});

      const result = await service.clockIn(userId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe(ClockType.CLOCK_IN);
      expect(result.location).toBeUndefined();
      expect(result.deviceId).toBeUndefined();
    });
  });

  describe('clockOut', () => {
    it('退勤打刻が正常に記録されること', async () => {
      const userId = 'test-user';
      const location = 'Tokyo Office';
      const deviceId = 'device-123';

      mockDocClient.send.mockResolvedValue({});

      const result = await service.clockOut(userId, location, deviceId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe(ClockType.CLOCK_OUT);
      expect(result.location).toBe(location);
      expect(result.deviceId).toBe(deviceId);
      expect(result.timestamp).toBeDefined();
      expect(result.date).toBeDefined();
      expect(mockDocClient.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecords', () => {
    it('打刻記録が正常に取得されること', async () => {
      const userId = 'test-user';
      const mockRecords = [
        {
          userId,
          timestamp: '2025-12-25T09:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_IN,
          location: 'Tokyo Office',
        },
        {
          userId,
          timestamp: '2025-12-25T18:00:00Z',
          date: '2025-12-25',
          type: ClockType.CLOCK_OUT,
          location: 'Tokyo Office',
        },
      ];

      mockDocClient.send.mockResolvedValue({ Items: mockRecords });

      const result = await service.getRecords(userId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(userId);
      expect(result[0].type).toBe(ClockType.CLOCK_IN);
      expect(result[1].type).toBe(ClockType.CLOCK_OUT);
      expect(mockDocClient.send).toHaveBeenCalledTimes(1);
    });

    it('記録が存在しない場合は空配列を返すこと', async () => {
      const userId = 'test-user';

      mockDocClient.send.mockResolvedValue({ Items: [] });

      const result = await service.getRecords(userId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
