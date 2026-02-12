// スナップショットテストについて:
// - CDKスタックの変更時、CloudFormationテンプレートが変わりスナップショットテストが失敗する
// - `infrastructure/deploy/package.json`の`test:unit`スクリプトに`--updateSnapshot`フラグを含めることで自動更新
// - CI/CDパイプラインの`.github/actions/commit-and-comment`がスナップショットを自動コミット
// - この仕組みにより、開発効率とコードレビューの透明性を両立

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

describe('AttendanceKitStack - 環境名の検証', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  test('environmentのデフォルト値がdevである', () => {
    // Given: environmentを指定せずにスタックを作成
    const stack = new AttendanceKitStack(app, {
      deployOnlyDynamoDB: true,
    });

    // When: CloudFormationテンプレートを生成
    // Then: デフォルト環境名(dev)でテーブルが作成される
    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
    });
  });

  test.each([
    {
      environment: 'dev' as const,
      expectedTableName: 'attendance-kit-dev-clock',
    },
    {
      environment: 'eva' as const,
      expectedTableName: 'attendance-kit-eva-clock',
    },
  ])('有効な環境名: $environment', ({ environment, expectedTableName }) => {
    // Given: 有効な環境名
    const stack = new AttendanceKitStack(app, {
      environment,
      deployOnlyDynamoDB: true,
    });

    // When: CloudFormationテンプレートを生成
    // Then: 環境名を含むテーブル名が設定される
    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: expectedTableName,
    });
  });
});

describe('AttendanceKitStack - JWTシークレットの検証', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  test('フルスタックデプロイ時にjwtSecretが必須', () => {
    // Given: deployOnlyDynamoDBがfalseでjwtSecretが未指定
    // When: AttendanceKitStackを作成
    // Then: エラーがスローされる
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'dev',
        deployOnlyDynamoDB: false,
      });
    }).toThrow(
      'JWT_SECRET environment variable is required for environment stack deployment',
    );
  });

  test('DynamoDB-onlyモードではjwtSecretは不要', () => {
    // Given: deployOnlyDynamoDBがtrueでjwtSecret未指定
    const stack = new AttendanceKitStack(app, {
      environment: 'test',
      deployOnlyDynamoDB: true,
    });

    // When: スタックを確認
    // Then: スタックとDynamoDBテーブルが作成され、Backend APIは作成されない
    expect(stack).toBeDefined();
    expect(stack.clockTable).toBeDefined();
    expect(stack.backendApi).toBeUndefined();
  });
});

describe('AttendanceKitStack - DynamoDB Onlyモード', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, {
      environment: 'test',
      deployOnlyDynamoDB: true,
      description: 'DynamoDB Clock Table for integration testing (test)',
      tags: {
        Environment: 'test',
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        Purpose: 'IntegrationTest',
      },
    });
    template = Template.fromStack(stack);
  });

  test('test環境でDynamoDBテーブルが作成されること', () => {
    // Given: test環境のDynamoDB-onlyモードスタック
    // When: CloudFormationテンプレートを確認
    // Then: テーブルが正しい設定で作成される
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-test-clock',
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('test環境でテーブルの削除ポリシーがDESTROYであること', () => {
    // Given: test環境のDynamoDB-onlyモードスタック
    // When: CloudFormationテンプレートを確認
    // Then: 削除ポリシーがDeleteに設定される
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('DynamoDB-onlyモードではポイントインタイムリカバリが無効であること', () => {
    const tables = template.findResources('AWS::DynamoDB::Table');
    const tableKeys = Object.keys(tables);
    expect(tableKeys.length).toBe(1);

    const table = tables[tableKeys[0]];
    expect(table.Properties?.PointInTimeRecoverySpecification).toBeUndefined();
  });

  test('DynamoDB-onlyモードでグローバルセカンダリインデックスが作成されること', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'DateIndex',
          KeySchema: [
            {
              AttributeName: 'date',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'timestamp',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
    });
  });

  test('DynamoDB-onlyモードのローカル環境でSeeder Lambdaが作成されること', () => {
    // ローカル環境 (test) はシーダーのみ作成される: 1 Lambda function
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('DynamoDB-onlyモードではBackend APIが作成されないこと', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 0);
  });

  test('DynamoDB-onlyモードではFrontend（CloudFront + S3）が作成されないこと', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 0);
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });

  test('スタック出力にTableNameがエクスポート名なしで含まれること', () => {
    const outputs = template.findOutputs('TableName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);

    const output = outputs[Object.keys(outputs)[0]];
    expect(output.Export).toBeUndefined();
  });

  test('スタック出力にTableArnがエクスポート名なしで含まれること', () => {
    const outputs = template.findOutputs('TableArn');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);

    const output = outputs[Object.keys(outputs)[0]];
    expect(output.Export).toBeUndefined();
  });

  test('DynamoDB-onlyモードではスタック出力にGSINameが含まれないこと', () => {
    const outputs = template.findOutputs('GSIName');
    expect(Object.keys(outputs).length).toBe(0);
  });

  test('DynamoDB-onlyモードではスタック出力にEnvironmentが含まれないこと', () => {
    const outputs = template.findOutputs('Environment');
    expect(Object.keys(outputs).length).toBe(0);
  });

  test('DynamoDB-onlyモードでIntegrationTestタグが追加されること', () => {
    const tables = template.findResources('AWS::DynamoDB::Table');
    const tableKeys = Object.keys(tables);
    expect(tableKeys.length).toBe(1);

    const table = tables[tableKeys[0]];
    const tags = table.Properties?.Tags;
    expect(tags).toBeDefined();

    const purposeTag = tags?.find((tag: any) => tag.Key === 'Purpose');
    expect(purposeTag).toBeDefined();
    expect(purposeTag.Value).toBe('IntegrationTest');
  });
});
