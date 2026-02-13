import { expect } from '@playwright/test';
import { ScanCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * DynamoDBにレコードが存在することを検証する
 */
export async function verifyRecordInDynamoDB(
  dynamoClient: DynamoDBClient,
  tableName: string,
  userId: string,
): Promise<void> {
  const command = new ScanCommand({
    TableName: tableName,
    Limit: 10,
  });
  const result = await dynamoClient.send(command);

  const clockRecord = result.Items?.find((item) => item.userId?.S === userId);

  expect(clockRecord).toBeDefined();
}
