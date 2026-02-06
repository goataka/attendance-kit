import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { BackendConstruct } from './constructs/backend';
import { FrontendConstruct } from './constructs/frontend';
import { formatExportName } from './utils/cdk-helpers';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import * as path from 'path';
import { DynamoDBCleaner } from './constructs/dynamodb-cleaner';

export type Environment = 'dev' | 'test' | 'eva' | 'stg' | 'prod';

export interface AttendanceKitStackProps extends cdk.StackProps {
  environment?: Environment; // デフォルト: 'dev'
  jwtSecret?: string; // JWT secret from GitHub Secrets (required for full stack, optional for DynamoDB-only)
  deployOnlyDynamoDB?: boolean; // If true, deploy only DynamoDB table (for integration testing)
}

export class AttendanceKitStack extends cdk.Stack {
  public readonly clockTable: dynamodb.Table;
  public readonly backendApi?: BackendConstruct;
  public readonly frontend?: FrontendConstruct;

  constructor(scope: Construct, props: AttendanceKitStackProps = {}) {
    // 環境変数のデフォルト値設定
    const environment = props.environment || 'dev';
    const { jwtSecret, deployOnlyDynamoDB = false } = props;

    // Stack IDの生成
    const stackId = AttendanceKitStack.generateStackId(environment);
    
    super(scope, stackId, props);

    // NOTE: OIDC Provider and IAM Role are managed by CloudFormation
    // (infrastructure/setup/attendance-kit-setup.yaml)
    // This is because OIDC Provider cannot be created with the same URL multiple times,
    // preventing migration from CloudFormation to CDK.
    // Use repository sync to automatically update the CloudFormation stack.

    // DynamoDB Clock Table
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
      // DynamoDBのみをデプロイする場合は、ポイントインタイムリカバリを無効化（テスト環境用）
      ...(deployOnlyDynamoDB ? {} : {
        pointInTimeRecoverySpecification: {
          pointInTimeRecoveryEnabled: true,
        },
      }),
      // DynamoDBのみをデプロイする場合は削除可能にする（テスト環境用）
      removalPolicy: deployOnlyDynamoDB ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      // Cost optimization: No additional alarms or monitoring features
    });

    // Global Secondary Index: DateIndex
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

    // Cost monitoring tags
    cdk.Tags.of(this.clockTable).add('Environment', environment);
    cdk.Tags.of(this.clockTable).add('Project', 'attendance-kit');
    cdk.Tags.of(this.clockTable).add('ManagedBy', 'CDK');
    if (deployOnlyDynamoDB) {
      cdk.Tags.of(this.clockTable).add('Purpose', 'IntegrationTest');
    } else {
      cdk.Tags.of(this.clockTable).add('CostCenter', 'Engineering');
    }

    // DynamoDBのみをデプロイする場合は、BackendとFrontendをスキップ
    if (!deployOnlyDynamoDB) {
      // フルスタックデプロイのバリデーション
      this.validateFullStackDeployment(environment, jwtSecret);

      // Backend API (Lambda + API Gateway)
      // validateFullStackDeploymentでjwtSecretの存在を確認済み
      this.backendApi = new BackendConstruct(this, 'BackendApi', {
        environment,
        clockTable: this.clockTable,
        jwtSecret: jwtSecret!,
      });

      // Frontend (CloudFront + S3)
      this.frontend = new FrontendConstruct(this, 'Frontend', {
        environment,
        api: this.backendApi.api,
      });
    } else {
      // DynamoDBのみをデプロイする場合
      // データクリア: eva と stg 環境のみ
      // シード: dev, test, eva, stg 環境（prodは本番環境のためシードなし）
      if (environment === 'eva' || environment === 'stg') {
        // AWS評価環境: データクリアとシード
        this.setupDataClearAndSeed();
      }
      if (AttendanceKitStack.isLocalEnvironment(environment)) {
        // ローカル環境 (dev, test): シードのみ
        this.setupDataSeeder();
      }
      // 注: prod環境はDynamoDB-onlyモードで使用することを想定していない
    }

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: this.clockTable.tableName,
      description: `DynamoDB clock table name (${environment})`,
      // DynamoDBのみをデプロイする場合は、exportNameを設定しない（テスト環境用）
      exportName: deployOnlyDynamoDB ? undefined : formatExportName(environment, 'ClockTableName'),
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.clockTable.tableArn,
      description: `DynamoDB clock table ARN (${environment})`,
      exportName: deployOnlyDynamoDB ? undefined : formatExportName(environment, 'ClockTableArn'),
    });

    if (!deployOnlyDynamoDB) {
      new cdk.CfnOutput(this, 'GSIName', {
        value: 'DateIndex',
        description: `Global Secondary Index name (${environment})`,
        exportName: formatExportName(environment, 'GSIName'),
      });

      new cdk.CfnOutput(this, 'Environment', {
        value: environment,
        description: 'Deployment environment',
        exportName: formatExportName(environment, 'Environment'),
      });
    }
  }


  private static isLocalEnvironment(environment: Environment): boolean {
    const localEnvironments: Environment[] = ['dev', 'test'];
    return localEnvironments.includes(environment);
  }

  private static isAwsEnvironment(environment: Environment): boolean {
    const awsEnvironments: Environment[] = ['eva', 'stg', 'prod'];
    return awsEnvironments.includes(environment);
  }

  private validateFullStackDeployment(environment: Environment, jwtSecret?: string): void {
    // JWT_SECRETが必須
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is required for environment stack deployment. ' +
        'Please set jwtSecret in stack props.'
      );
    }

    // AWS環境のみフルスタックデプロイを許可
    if (!AttendanceKitStack.isAwsEnvironment(environment)) {
      throw new Error(
        `Full stack deployment is not allowed for '${environment}' environment. ` +
        'Use deployOnlyDynamoDB: true for local environments.'
      );
    }
  }

  private static generateStackId(environment: Environment): string {
    const capitalizedEnv = environment.charAt(0).toUpperCase() + environment.slice(1);
    return `AttendanceKit-${capitalizedEnv}-Stack`;
  }

  private setupDataClear(): DynamoDBCleaner {
    const cleaner = new DynamoDBCleaner(this, 'ClockTableCleaner', {
      table: this.clockTable,
    });

    return cleaner;
  }

  private setupDataSeeder(): DynamoDBSeeder {
    const seeder = new DynamoDBSeeder(this, 'ClockTableSeeder', {
      table: this.clockTable,
      seeds: Seeds.fromJsonFile(
        path.join(__dirname, '../seeds/clock-records.json'),
      ),
    });

    return seeder;
  }

  // クリアが完了してからシードが実行されるように依存関係を設定
  private setupDataClearAndSeed(): void {
    const cleaner = this.setupDataClear();
    const seeder = this.setupDataSeeder();

    seeder.node.addDependency(cleaner.trigger);
  }
}
