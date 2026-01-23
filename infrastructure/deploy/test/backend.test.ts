import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

/**
 * S3Key値を固定文字列に置換する関数
 * 
 * Lambda関数コードが変更されるたびにS3Keyハッシュが変わるため、
 * スナップショットテストでコード変更の差分が大量に発生します。
 * インフラ構造の変更を検出することが目的なので、S3Keyハッシュは
 * 固定値にマスクします。
 * 
 * この関数を削除しないでください。
 */
function maskS3Keys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // S3Keyのハッシュパターン（64文字のhex + .zip）を検出してマスク
    if (/^[a-f0-9]{64}\.zip$/.test(obj)) {
      return '<MASKED_S3_KEY>.zip';
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskS3Keys(item));
  }

  if (typeof obj === 'object') {
    const masked: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'S3Key' && typeof obj[key] === 'string') {
          // S3Keyプロパティを固定値に置換
          masked[key] = '<MASKED_S3_KEY>.zip';
        } else {
          masked[key] = maskS3Keys(obj[key]);
        }
      }
    }
    return masked;
  }

  return obj;
}

describe('AttendanceKitStack', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, 'AttendanceKit-Dev-Stack', {
      environment: 'dev',
      jwtSecret: 'test-jwt-secret',
      description: 'DynamoDB clock table for attendance-kit (dev environment)',
      tags: {
        Environment: 'dev',
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        CostCenter: 'Engineering',
      },
    });
    template = Template.fromStack(stack);
  });

  test('DynamoDB Table Created', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
    });
  });

  test('Table has correct Partition Key', () => {
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

  test('Table has correct Attribute Definitions', () => {
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

  test('Global Secondary Index Created', () => {
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

  test('Table has RETAIN deletion policy', () => {
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    });
  });

  test('Table name includes environment', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
    });
  });

  test('Stack outputs include TableName', () => {
    const outputs = template.findOutputs('TableName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('Stack outputs include TableArn', () => {
    const outputs = template.findOutputs('TableArn');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('Stack outputs include GSIName', () => {
    const outputs = template.findOutputs('GSIName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('Stack outputs include Environment', () => {
    const outputs = template.findOutputs('Environment');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('OIDC Provider is NOT created (managed by CloudFormation)', () => {
    template.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0);
  });

  test('GitHub Actions IAM Role is NOT created (managed by CloudFormation)', () => {
    // Lambda関数が実行ロールを作成するが、GitHub Actions用ロールは作成されない
    // GitHub固有のトラストポリシーを持つロールが存在しないことを確認
    const roles = template.findResources('AWS::IAM::Role');
    const roleKeys = Object.keys(roles);
    
    // Lambda実行ロールは存在するはず
    expect(roleKeys.length).toBeGreaterThan(0);
    
    // GitHub Actions OIDC プロバイダーロールが存在しないことを確認
    roleKeys.forEach(key => {
      const role = roles[key];
      const trustPolicy = role.Properties?.AssumeRolePolicyDocument;
      if (trustPolicy?.Statement) {
        trustPolicy.Statement.forEach((statement: any) => {
          // GitHub OIDC プロバイダーはトラストポリシーに含まれていないはず
          const federated = statement.Principal?.Federated;
          if (federated && typeof federated === 'string') {
            expect(federated).not.toMatch(/oidc-provider\/token\.actions\.githubusercontent\.com/);
          }
        });
      }
    });
  });

  test('Stack Matches Snapshot', () => {
    const templateJson = template.toJSON();
    const maskedTemplate = maskS3Keys(templateJson);
    expect(maskedTemplate).toMatchSnapshot();
  });
});

describe('AttendanceKitStack - Staging Environment', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, 'AttendanceKit-Staging-Stack', {
      environment: 'staging',
      jwtSecret: 'test-jwt-secret',
      description: 'DynamoDB clock table for attendance-kit (staging environment)',
      tags: {
        Environment: 'staging',
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        CostCenter: 'Engineering',
      },
    });
    template = Template.fromStack(stack);
  });

  test('Staging environment creates correct table name', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-staging-clock',
    });
  });

  test('Staging Stack Matches Snapshot', () => {
    const templateJson = template.toJSON();
    const maskedTemplate = maskS3Keys(templateJson);
    expect(maskedTemplate).toMatchSnapshot();
  });
});
