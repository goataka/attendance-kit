import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ClockType, ClockRecordResponseDto } from './dto/clock.dto';
import { randomUUID } from 'crypto';
import { resolveTableName } from '../shared/dynamodb-table-name';

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
  // DynamoDB Query API: ScanIndexForward=false で降順ソート（最新のレコードが先頭）
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

    // DYNAMODB_TABLE_NAME環境変数が設定されている場合はそれを使用（後方互換性のため）
    // 未設定の場合は環境名から動的に解決
    this.tableName =
      process.env.DYNAMODB_TABLE_NAME || resolveTableName('clock');
  }

  private extractDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

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
    // テスト環境と本番環境で同じテーブル構造を使用
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
