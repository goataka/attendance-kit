import { Test, TestingModule } from '@nestjs/testing';
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClockService],
    }).compile();

    service = module.get<ClockService>(ClockService);
    // Replace the docClient with our mock
    (service as any).docClient = mockDocClient;
  });

  it('サービスが定義されていること', () => {
    // Given: ClockServiceのインスタンス
    // When: サービスを確認
    // Then: サービスが定義されている
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('出勤打刻が正常に記録されること', async () => {
      // Given: ユーザーID、場所、デバイスIDが提供される
      const userId = 'test-user';
      const location = 'Tokyo Office';
      const deviceId = 'device-123';

      mockDocClient.send.mockResolvedValue({});

      // When: clockIn関数を呼び出す
      const result = await service.clockIn(userId, location, deviceId);

      // Then: 出勤打刻が記録され、正しいデータが返される
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
      // Given: ユーザーIDのみ提供される
      const userId = 'test-user';

      mockDocClient.send.mockResolvedValue({});

      // When: clockIn関数をオプションなしで呼び出す
      const result = await service.clockIn(userId);

      // Then: 出勤打刻が記録され、オプションフィールドは未定義
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe(ClockType.CLOCK_IN);
      expect(result.location).toBeUndefined();
      expect(result.deviceId).toBeUndefined();
    });
  });

  describe('clockOut', () => {
    it('退勤打刻が正常に記録されること', async () => {
      // Given: ユーザーID、場所、デバイスIDが提供される
      const userId = 'test-user';
      const location = 'Tokyo Office';
      const deviceId = 'device-123';

      mockDocClient.send.mockResolvedValue({});

      // When: clockOut関数を呼び出す
      const result = await service.clockOut(userId, location, deviceId);

      // Then: 退勤打刻が記録され、正しいデータが返される
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
      // Given: ユーザーIDと打刻記録データ
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

      // When: getRecords関数を呼び出す
      const result = await service.getRecords(userId);

      // Then: 打刻記録が正常に取得される
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(userId);
      expect(result[0].type).toBe(ClockType.CLOCK_IN);
      expect(result[1].type).toBe(ClockType.CLOCK_OUT);
      expect(mockDocClient.send).toHaveBeenCalledTimes(1);
    });

    it('記録が存在しない場合は空配列を返すこと', async () => {
      // Given: ユーザーIDと空の打刻記録
      const userId = 'test-user';

      mockDocClient.send.mockResolvedValue({ Items: [] });

      // When: getRecords関数を呼び出す
      const result = await service.getRecords(userId);

      // Then: 空の配列が返される
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
