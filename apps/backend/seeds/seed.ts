#!/usr/bin/env ts-node
/**
 * データベース初期データ投入スクリプト
 *
 * 開発・テスト環境用のサンプルデータを投入します。
 * - ユーザーデータ（参考情報のみ、現状AuthServiceでハードコード）
 * - 打刻レコードデータ（DynamoDBに投入）
 *
 * 使い方:
 *   npm run seed              # デフォルト環境（dev）
 *   npm run seed:local        # LocalStack環境
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface UserData {
  userId: string;
  name: string;
  email: string;
  department: string;
}

interface ClockRecordSeedData {
  userId: string;
  type: 'clock-in' | 'clock-out';
  location?: string;
  deviceId?: string;
  daysAgo: number;
  hour: number;
  minute: number;
}

interface ClockRecord {
  id: string;
  userId: string;
  timestamp: string;
  date: string;
  type: 'clock-in' | 'clock-out';
  location?: string;
  deviceId?: string;
}

class SeedRunner {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly defaultTableName = 'attendance-kit-dev-clock';

  constructor() {
    // LocalStack統合テスト用のエンドポイント設定
    const clientConfig: any = {
      region: process.env.AWS_REGION || 'ap-northeast-1',
    };

    // LocalStackエンドポイントが設定されている場合はそれを使用
    if (process.env.DYNAMODB_ENDPOINT) {
      clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
      console.log(`Using DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT}`);
    }

    const client = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_TABLE_NAME || this.defaultTableName;
    console.log(`Using DynamoDB table: ${this.tableName}`);
  }

  /**
   * JSONファイルからデータを読み込む
   */
  private loadJsonFile<T>(filename: string): T[] {
    const filePath = path.join(__dirname, 'data', filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 日付文字列（YYYY-MM-DD）を抽出
   */
  private extractDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * シードデータから実際の打刻レコードを生成
   */
  private createClockRecord(seedData: ClockRecordSeedData): ClockRecord {
    const now = new Date();
    const recordDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - seedData.daysAgo,
      seedData.hour,
      seedData.minute,
      0,
      0,
    );

    return {
      id: randomUUID(),
      userId: seedData.userId,
      timestamp: recordDate.toISOString(),
      date: this.extractDate(recordDate),
      type: seedData.type,
      ...(seedData.location && { location: seedData.location }),
      ...(seedData.deviceId && { deviceId: seedData.deviceId }),
    };
  }

  /**
   * 既存レコードをチェック（冪等性の確保）
   */
  private async checkExistingRecords(userId: string): Promise<number> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Select: 'COUNT',
    });

    try {
      const response = await this.docClient.send(command);
      return response.Count || 0;
    } catch (error) {
      // テーブルが存在しない場合は0を返す
      return 0;
    }
  }

  /**
   * ユーザーデータを表示（現状は参考情報のみ）
   */
  async seedUsers(): Promise<void> {
    console.log('\n📋 ユーザーデータの確認...');
    const users = this.loadJsonFile<UserData>('users.json');

    console.log('以下のユーザーが定義されています:');
    users.forEach((user) => {
      console.log(`  - ${user.userId}: ${user.name} (${user.department})`);
    });

    console.log(
      '\n⚠️  注意: ユーザーデータは現在AuthServiceに直接定義されています。',
    );
    console.log(
      '   将来的にユーザー管理機能を実装する際に、このデータを使用できます。',
    );
  }

  /**
   * 打刻レコードデータを投入
   */
  async seedClockRecords(force: boolean = false): Promise<void> {
    console.log('\n📝 打刻レコードデータの投入...');
    const seedData =
      this.loadJsonFile<ClockRecordSeedData>('clock-records.json');

    // ユーザーごとにグループ化
    const userIds = Array.from(new Set(seedData.map((r) => r.userId)));

    for (const userId of userIds) {
      const existingCount = await this.checkExistingRecords(userId);

      if (existingCount > 0 && !force) {
        console.log(
          `  ⏭️  ${userId}: 既に${existingCount}件のレコードが存在します（スキップ）`,
        );
        continue;
      }

      const userRecords = seedData.filter((r) => r.userId === userId);
      console.log(
        `  📥 ${userId}: ${userRecords.length}件のレコードを投入中...`,
      );

      for (const seedRecord of userRecords) {
        const record = this.createClockRecord(seedRecord);
        const command = new PutCommand({
          TableName: this.tableName,
          Item: record,
        });

        await this.docClient.send(command);
        console.log(`    ✓ ${record.type} at ${record.timestamp}`);
      }
    }

    console.log('✅ 打刻レコードの投入が完了しました');
  }

  /**
   * すべての初期データを投入
   */
  async run(force: boolean = false): Promise<void> {
    console.log('🚀 初期データ投入を開始します...');
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);

    try {
      await this.seedUsers();
      await this.seedClockRecords(force);

      console.log('\n✨ すべての初期データ投入が完了しました！');
    } catch (error) {
      console.error('\n❌ エラーが発生しました:', error);
      process.exit(1);
    }
  }
}

// メイン実行
if (require.main === module) {
  const force = process.argv.includes('--force');

  if (force) {
    console.log(
      '⚠️  --force オプションが指定されました。既存データも上書きします。',
    );
  }

  const runner = new SeedRunner();
  runner.run(force).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SeedRunner };
