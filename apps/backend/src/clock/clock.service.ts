import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ClockType, ClockRecordResponseDto } from './dto/clock.dto';
import { randomUUID } from 'crypto';

export interface ClockRecord {
  id: string;
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
  // GSIは使用しない: 実際のテーブルのプライマリキーがuserId+timestampのため
  // private readonly indexName = 'UserIdTimestampIndex';
  private readonly defaultTableName = 'attendance-kit-dev-clock';
  // ScanIndexForward=false sorts in descending order (most recent first)
  private readonly scanIndexForward = false;

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
    this.tableName = process.env.DYNAMODB_TABLE_NAME || this.defaultTableName;
  }

  /**
   * Extract date string (YYYY-MM-DD) from Date object
   */
  private extractDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Create and save a clock record to DynamoDB
   */
  private async createAndSaveRecord(
    userId: string,
    type: ClockType,
    location?: string,
    deviceId?: string,
  ): Promise<ClockRecordResponseDto> {
    const now = new Date();
    const record: ClockRecord = {
      id: randomUUID(),
      userId,
      timestamp: now.toISOString(),
      date: this.extractDate(now),
      type,
      ...(location && { location }),
      ...(deviceId && { deviceId }),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: record,
    });

    await this.docClient.send(command);
    this.logger.log(`${type} recorded for user: ${userId}`);

    return record as ClockRecordResponseDto;
  }

  async clockIn(
    userId: string,
    location?: string,
    deviceId?: string,
  ): Promise<ClockRecordResponseDto> {
    return this.createAndSaveRecord(
      userId,
      ClockType.CLOCK_IN,
      location,
      deviceId,
    );
  }

  async clockOut(
    userId: string,
    location?: string,
    deviceId?: string,
  ): Promise<ClockRecordResponseDto> {
    return this.createAndSaveRecord(
      userId,
      ClockType.CLOCK_OUT,
      location,
      deviceId,
    );
  }

  async getRecords(userId: string): Promise<ClockRecordResponseDto[]> {
    // プライマリキー（userId + timestamp）で直接クエリ
    // GSIは使用しない（実際のテーブル構造に合わせる）
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: this.scanIndexForward,
    });

    const response = await this.docClient.send(command);
    this.logger.log(
      `Retrieved ${response.Items?.length || 0} records for user: ${userId}`,
    );

    return (response.Items || []) as ClockRecordResponseDto[];
  }
}
