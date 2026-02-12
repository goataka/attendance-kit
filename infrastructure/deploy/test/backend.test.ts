import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

// S3Key値を固定文字列に置換するスナップショットシリアライザー
//
// Lambda関数コードが変更されるたびにS3Keyハッシュが変わるため、
// スナップショットテストでコード変更の差分が大量に発生します。
// インフラ構造の変更を検出することが目的なので、S3Keyハッシュは
// 固定値にマスクします。
//
// このシリアライザーを削除しないでください。
expect.addSnapshotSerializer({
  test: (val) => {
    // S3Keyハッシュパターン（64文字のhex + .zip）を持つ文字列かどうかをチェック
    return typeof val === 'string' && /^[a-f0-9]{64}\.zip$/.test(val);
  },
  serialize: (val) => {
    // S3Keyハッシュを固定値に置換
    return '"<MASKED_S3_KEY>.zip"';
  },
});

describe('AttendanceKitStack', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, {
      environment: 'eva',
      jwtSecret: 'test-jwt-secret',
      description: 'DynamoDB clock table for attendance-kit (eva environment)',
      tags: {
        Environment: 'eva',
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        CostCenter: 'Engineering',
      },
    });
    template = Template.fromStack(stack);
  });

  test('DynamoDBテーブルが作成されること', () => {
    // Given: eva環境のフルスタック
    // When: CloudFormationテンプレートを確認
    // Then: テーブルが正しい設定で作成される
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-eva-clock',
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
    });
  });

  test('テーブルのパーティションキーが正しいこと', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        {
          AttributeName: 'userId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'timestamp',
          KeyType: 'RANGE',
        },
      ],
    });
  });

  test('テーブルの属性定義が正しいこと', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      AttributeDefinitions: [
        {
          AttributeName: 'userId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'timestamp',
          AttributeType: 'S',
        },
        {
          AttributeName: 'date',
          AttributeType: 'S',
        },
      ],
    });
  });

  test('グローバルセカンダリインデックスが作成されること', () => {
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

  test('テーブルの削除ポリシーがRETAINであること', () => {
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    });
  });

  test('テーブル名に環境名が含まれること', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-eva-clock',
    });
  });

  test('スタック出力にTableNameが含まれること', () => {
    const outputs = template.findOutputs('TableName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('スタック出力にTableArnが含まれること', () => {
    const outputs = template.findOutputs('TableArn');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('スタック出力にGSINameが含まれること', () => {
    const outputs = template.findOutputs('GSIName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('スタック出力にEnvironmentが含まれること', () => {
    const outputs = template.findOutputs('Environment');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('OIDCプロバイダーは作成されないこと（CloudFormationで管理）', () => {
    template.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0);
  });

  test('GitHub Actions IAMロールは作成されないこと（CloudFormationで管理）', () => {
    // Lambda関数が実行ロールを作成するが、GitHub Actions用ロールは作成されない
    // GitHub固有のトラストポリシーを持つロールが存在しないことを確認
    const roles = template.findResources('AWS::IAM::Role');
    const roleKeys = Object.keys(roles);

    // Lambda実行ロールは存在するはず
    expect(roleKeys.length).toBeGreaterThan(0);

    // GitHub Actions OIDC プロバイダーロールが存在しないことを確認
    roleKeys.forEach((key) => {
      const role = roles[key];
      const trustPolicy = role.Properties?.AssumeRolePolicyDocument;
      if (trustPolicy?.Statement) {
        trustPolicy.Statement.forEach((statement: any) => {
          // GitHub OIDC プロバイダーはトラストポリシーに含まれていないはず
          const federated = statement.Principal?.Federated;
          if (federated && typeof federated === 'string') {
            expect(federated).not.toMatch(
              /oidc-provider\/token\.actions\.githubusercontent\.com/,
            );
          }
        });
      }
    });
  });

  test('スタックがスナップショットと一致すること', () => {
    // Given: eva環境のフルスタック
    // When: CloudFormationテンプレートを取得
    // Then: スナップショットと一致する
    expect(template.toJSON()).toMatchSnapshot();
  });
});

describe('AttendanceKitStack - Eva環境', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, {
      environment: 'eva',
      jwtSecret: 'test-jwt-secret',
      description: 'DynamoDB clock table for attendance-kit (eva environment)',
      tags: {
        Environment: 'eva',
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        CostCenter: 'Engineering',
      },
    });
    template = Template.fromStack(stack);
  });

  test('Eva環境で正しいテーブル名が作成されること', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-eva-clock',
    });
  });

  test('Evaスタックがスナップショットと一致すること', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
