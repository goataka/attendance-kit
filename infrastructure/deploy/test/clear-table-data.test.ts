import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lambda/clear-table-data';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('clear-table-data Lambda function', () => {
  let mockSend: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset environment variables
    process.env.TABLE_NAME = 'test-table';

    // Setup mocks
    mockSend = jest.fn();
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: mockSend,
    });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('環境変数TABLE_NAMEが未設定の場合エラーをスローする', async () => {
    delete process.env.TABLE_NAME;

    const event = {
      RequestType: 'Create' as const,
    };

    await expect(handler(event)).rejects.toThrow('TABLE_NAME environment variable is required');
  });

  test('テーブルが空の場合、正常に完了する', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [],
      LastEvaluatedKey: undefined,
    });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(consoleLogSpy).toHaveBeenCalledWith('Clearing all data from table: test-table');
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 0 items from test-table');
  });

  test('アイテムを正常に削除する', async () => {
    const testItems = [
      { userId: 'user1', timestamp: '2024-01-01T00:00:00Z' },
      { userId: 'user2', timestamp: '2024-01-01T00:00:00Z' },
    ];

    mockSend
      .mockResolvedValueOnce({
        Items: testItems,
        LastEvaluatedKey: undefined,
      })
      .mockResolvedValueOnce({
        UnprocessedItems: {},
      });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(ScanCommand));
    expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(BatchWriteCommand));
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 2 items from test-table');
  });

  test('ページネーション対応：複数ページのアイテムを削除する', async () => {
    const page1Items = Array.from({ length: 10 }, (_, i) => ({
      userId: `user${i}`,
      timestamp: '2024-01-01T00:00:00Z',
    }));
    const page2Items = Array.from({ length: 5 }, (_, i) => ({
      userId: `user${i + 10}`,
      timestamp: '2024-01-01T00:00:00Z',
    }));

    mockSend
      .mockResolvedValueOnce({
        Items: page1Items,
        LastEvaluatedKey: { userId: 'user9', timestamp: '2024-01-01T00:00:00Z' },
      })
      .mockResolvedValueOnce({ UnprocessedItems: {} })
      .mockResolvedValueOnce({
        Items: page2Items,
        LastEvaluatedKey: undefined,
      })
      .mockResolvedValueOnce({ UnprocessedItems: {} });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(4);
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 15 items from test-table');
  });

  test('バッチ削除：26件以上のアイテムを複数バッチで削除する', async () => {
    const items = Array.from({ length: 26 }, (_, i) => ({
      userId: `user${i}`,
      timestamp: '2024-01-01T00:00:00Z',
    }));

    mockSend
      .mockResolvedValueOnce({
        Items: items,
        LastEvaluatedKey: undefined,
      })
      .mockResolvedValueOnce({ UnprocessedItems: {} })
      .mockResolvedValueOnce({ UnprocessedItems: {} });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    // Scan + 2回のBatchWrite（25件 + 1件）
    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 26 items from test-table');
  });

  test('UnprocessedItemsがある場合リトライする', async () => {
    const testItems = [
      { userId: 'user1', timestamp: '2024-01-01T00:00:00Z' },
      { userId: 'user2', timestamp: '2024-01-01T00:00:00Z' },
    ];

    const unprocessedItem = {
      DeleteRequest: {
        Key: {
          userId: 'user2',
          timestamp: '2024-01-01T00:00:00Z',
        },
      },
    };

    mockSend
      .mockResolvedValueOnce({
        Items: testItems,
        LastEvaluatedKey: undefined,
      })
      .mockResolvedValueOnce({
        UnprocessedItems: {
          'test-table': [unprocessedItem],
        },
      })
      .mockResolvedValueOnce({
        UnprocessedItems: {},
      });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Retrying 1 unprocessed items'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 2 items from test-table');
  });

  test('最大リトライ回数後もUnprocessedItemsが残る場合、警告を出力する', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const testItems = [
      { userId: 'user1', timestamp: '2024-01-01T00:00:00Z' },
    ];

    const unprocessedItem = {
      DeleteRequest: {
        Key: {
          userId: 'user1',
          timestamp: '2024-01-01T00:00:00Z',
        },
      },
    };

    // 常にUnprocessedItemsを返す（リトライが失敗し続ける）
    mockSend
      .mockResolvedValueOnce({
        Items: testItems,
        LastEvaluatedKey: undefined,
      })
      .mockResolvedValue({
        UnprocessedItems: {
          'test-table': [unprocessedItem],
        },
      });

    const event = {
      RequestType: 'Create' as const,
    };

    await handler(event);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to delete 1 items after 3 retries');
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted 0 items from test-table');
    
    consoleWarnSpy.mockRestore();
  });

  test('エラー発生時、エラーログを出力してエラーを再スローする', async () => {
    const testError = new Error('DynamoDB error');
    mockSend.mockRejectedValueOnce(testError);

    const event = {
      RequestType: 'Create' as const,
    };

    await expect(handler(event)).rejects.toThrow('DynamoDB error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error clearing table data:', testError);
  });
});
