import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import * as path from 'path';
import { DynamoDBCleaner } from './constructs/dynamodb-cleaner';

export interface DynamoDBStackProps extends cdk.StackProps {
  environment: string;
}

/**
 * DynamoDB単独デプロイ用スタック
 * 統合テスト（LocalStack）で使用
 */
export class DynamoDBStack extends cdk.Stack {
  public readonly clockTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // 本番環境と同じ構造を使用（userId + timestamp as primary key）
    this.clockTable = new dynamodb.Table(this, 'ClockTable', {
      tableName: `attendance-kit-${environment}-clock`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      // テスト環境では削除可能に設定
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 本番環境と同じGSIを使用
    this.clockTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    cdk.Tags.of(this.clockTable).add('Environment', environment);
    cdk.Tags.of(this.clockTable).add('Project', 'attendance-kit');
    cdk.Tags.of(this.clockTable).add('Purpose', 'IntegrationTest');
    cdk.Tags.of(this.clockTable).add('ManagedBy', 'CDK');

    if (environment === 'dev' || environment === 'local') {
      this.setupDataClearAndSeed();
    }

    new cdk.CfnOutput(this, 'TableName', {
      value: this.clockTable.tableName,
      description: `DynamoDB clock table name (${environment})`,
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.clockTable.tableArn,
      description: `DynamoDB clock table ARN (${environment})`,
    });
  }

  /**
   * データクリア用のDynamoDBCleanerを設定
   */
  private setupDataClear(): DynamoDBCleaner {
    const cleaner = new DynamoDBCleaner(this, 'ClockTableCleaner', {
      table: this.clockTable,
    });

    return cleaner;
  }

  /**
   * データ投入用のSeederを設定
   */
  private setupDataSeeder(): DynamoDBSeeder {
    const seeder = new DynamoDBSeeder(this, 'ClockTableSeeder', {
      table: this.clockTable,
      seeds: Seeds.fromJsonFile(
        path.join(__dirname, '../seeds/clock-records.json'),
      ),
    });

    return seeder;
  }

  /**
   * データクリアとシードの設定
   * クリアが完了してからシードが実行されるように依存関係を設定
   */
  private setupDataClearAndSeed(): void {
    const cleaner = this.setupDataClear();
    const seeder = this.setupDataSeeder();

    seeder.node.addDependency(cleaner.trigger);
  }
}
