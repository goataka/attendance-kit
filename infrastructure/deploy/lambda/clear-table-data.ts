import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface TriggerEvent {
  RequestType: 'Create' | 'Update' | 'Delete';
  ResourceProperties?: Record<string, unknown>;
}

/**
 * DynamoDBテーブルの全データを削除するLambda関数
 * CDK Triggerとして使用され、デプロイ時にテーブルをクリアする
 */
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

          const batchWriteCommand = new BatchWriteCommand({
            RequestItems: {
              [tableName]: deleteRequests,
            },
          });

          await docClient.send(batchWriteCommand);
          itemsDeleted += chunk.length;
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
