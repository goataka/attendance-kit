import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface TriggerEvent {
  RequestType: 'Create' | 'Update' | 'Delete';
  ResourceProperties?: Record<string, unknown>;
}

export const handler = async (event: TriggerEvent): Promise<void> => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error('TABLE_NAME environment variable is required');
  }

  console.log(`Clearing all data from table: ${tableName}`);
  console.log(`Event type: ${event.RequestType}`);

  try {
    let itemsDeleted = 0;
    let lastEvaluatedKey: Record<string, any> | undefined;

    // テーブルの全アイテムをスキャンして削除
    do {
      // テーブルの全アイテムを取得
      const scanCommand = new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
        ProjectionExpression: 'userId, #ts',
        ExpressionAttributeNames: {
          '#ts': 'timestamp',
        },
      });

      const scanResult = await docClient.send(scanCommand);
      const items = scanResult.Items || [];

      if (items.length > 0) {
        // バッチ削除（最大25件ずつ）
        const chunks: any[][] = [];
        for (let i = 0; i < items.length; i += 25) {
          chunks.push(items.slice(i, i + 25));
        }

        for (const chunk of chunks) {
          const deleteRequests = chunk.map((item) => ({
            DeleteRequest: {
              Key: {
                userId: item.userId,
                timestamp: item.timestamp,
              },
            },
          }));

          let unprocessedItems: any[] = deleteRequests;
          let retryCount = 0;
          const maxRetries = 3;

          while (unprocessedItems.length > 0 && retryCount < maxRetries) {
            const batchWriteCommand = new BatchWriteCommand({
              RequestItems: {
                [tableName]: unprocessedItems,
              },
            });

            const result = await docClient.send(batchWriteCommand);
            
            // UnprocessedItemsをチェックしてリトライ
            const unprocessed = result.UnprocessedItems?.[tableName];
            if (unprocessed && unprocessed.length > 0) {
              unprocessedItems = unprocessed as any[];
              retryCount++;
              console.log(`Retrying ${unprocessed.length} unprocessed items (attempt ${retryCount}/${maxRetries})`);
              // 指数バックオフ
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
            } else {
              unprocessedItems = [];
            }
          }

          if (unprocessedItems.length > 0) {
            console.warn(`Failed to delete ${unprocessedItems.length} items after ${maxRetries} retries`);
          }

          itemsDeleted += chunk.length - unprocessedItems.length;
        }
      }

      lastEvaluatedKey = scanResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`Successfully deleted ${itemsDeleted} items from ${tableName}`);
  } catch (error) {
    console.error('Error clearing table data:', error);
    throw error;
  }
};
