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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('should record clock-in successfully', async () => {
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

    it('should record clock-in without optional fields', async () => {
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
    it('should record clock-out successfully', async () => {
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
    it('should retrieve clock records successfully', async () => {
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

    it('should return empty array when no records exist', async () => {
      const userId = 'test-user';

      mockDocClient.send.mockResolvedValue({ Items: [] });

      const result = await service.getRecords(userId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
