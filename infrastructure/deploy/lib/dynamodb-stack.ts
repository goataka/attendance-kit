import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import * as path from 'path';
import { Trigger } from 'aws-cdk-lib/triggers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

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

    // DynamoDB Clock Table
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

    // Global Secondary Index: DateIndex
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

    // タグ設定
    cdk.Tags.of(this.clockTable).add('Environment', environment);
    cdk.Tags.of(this.clockTable).add('Project', 'attendance-kit');
    cdk.Tags.of(this.clockTable).add('Purpose', 'IntegrationTest');
    cdk.Tags.of(this.clockTable).add('ManagedBy', 'CDK');

    // 初期データ投入（dev/local環境のみ）
    if (environment === 'dev' || environment === 'local') {
      this.setupDataClearAndSeed();
    }

    // Outputs
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
   * データクリア用のLambda関数とTriggerを設定
   */
  private setupDataClear(): Trigger {
    // データクリア用のLambda関数
    const clearDataFunction = new NodejsFunction(this, 'ClearTableData', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/clear-table-data.ts'),
      environment: {
        TABLE_NAME: this.clockTable.tableName,
      },
      timeout: cdk.Duration.minutes(5),
    });

    // Lambda関数にテーブルへの権限を付与
    this.clockTable.grantReadWriteData(clearDataFunction);

    // トリガー: デプロイ時にデータをクリア
    const clearTrigger = new Trigger(this, 'ClearTableTrigger', {
      handler: clearDataFunction,
      executeAfter: [this.clockTable],
    });

    return clearTrigger;
  }

  /**
   * データ投入用のSeederを設定
   */
  private setupDataSeeder(): DynamoDBSeeder {
    // シーダー: データを投入
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
    const clearTrigger = this.setupDataClear();
    const seeder = this.setupDataSeeder();

    // シーダーはクリアトリガーの後に実行されるように依存関係を設定
    seeder.node.addDependency(clearTrigger);
  }
}
