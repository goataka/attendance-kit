import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ClockType, ClockRecordResponseDto } from './dto/clock.dto';

export interface ClockRecord {
  userId: string;
  timestamp: string;
  date: string;
  type: ClockType;
  location?: string;
  deviceId?: string;
}

@Injectable()
export class ClockService {
  private readonly logger = new Logger(ClockService.name);
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    // LocalStack統合テスト用のエンドポイント設定
    const clientConfig: any = {
      region: process.env.AWS_REGION || 'ap-northeast-1',
    };
    
    // LocalStackエンドポイントが設定されている場合はそれを使用
    if (process.env.DYNAMODB_ENDPOINT) {
      clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
    }
    
    const client = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName =
      process.env.DYNAMODB_TABLE_NAME || 'attendance-kit-dev-clock';
  }

  async clockIn(
    userId: string,
    location?: string,
    deviceId?: string,
  ): Promise<ClockRecordResponseDto> {
    const now = new Date();
    const timestamp = now.toISOString();
    const date = timestamp.split('T')[0]; // YYYY-MM-DD

    const record: ClockRecord = {
      userId,
      timestamp,
      date,
      type: ClockType.CLOCK_IN,
      ...(location && { location }),
      ...(deviceId && { deviceId }),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: record,
    });

    await this.docClient.send(command);
    this.logger.log(`Clock-in recorded for user: ${userId}`);

    return record as ClockRecordResponseDto;
  }

  async clockOut(
    userId: string,
    location?: string,
    deviceId?: string,
  ): Promise<ClockRecordResponseDto> {
    const now = new Date();
    const timestamp = now.toISOString();
    const date = timestamp.split('T')[0]; // YYYY-MM-DD

    const record: ClockRecord = {
      userId,
      timestamp,
      date,
      type: ClockType.CLOCK_OUT,
      ...(location && { location }),
      ...(deviceId && { deviceId }),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: record,
    });

    await this.docClient.send(command);
    this.logger.log(`Clock-out recorded for user: ${userId}`);

    return record as ClockRecordResponseDto;
  }

  async getRecords(userId: string): Promise<ClockRecordResponseDto[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Most recent first
    });

    const response = await this.docClient.send(command);
    this.logger.log(
      `Retrieved ${response.Items?.length || 0} records for user: ${userId}`,
    );

    return (response.Items || []) as ClockRecordResponseDto[];
  }
}
