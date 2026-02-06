import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

describe('AttendanceKitStack - Environment Validation', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  test('environmentのデフォルト値がdevである', () => {
    const stack = new AttendanceKitStack(app, {
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
    });
  });

  test('無効な環境名でエラーが発生する', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'invalid' as any,
        deployOnlyDynamoDB: true,
      });
    }).toThrow('Invalid environment: invalid. Must be one of: dev, test, eva, stg, prod');
  });

  test.each([
    {
      環境名: 'dev',
      期待されるテーブル名: 'attendance-kit-dev-clock',
    },
    {
      環境名: 'test',
      期待されるテーブル名: 'attendance-kit-test-clock',
    },
    {
      環境名: 'eva',
      期待されるテーブル名: 'attendance-kit-eva-clock',
    },
    {
      環境名: 'stg',
      期待されるテーブル名: 'attendance-kit-stg-clock',
    },
    {
      環境名: 'prod',
      期待されるテーブル名: 'attendance-kit-prod-clock',
    },
  ])('有効な環境名: $環境名', ({ 環境名, 期待されるテーブル名 }) => {
    const stack = new AttendanceKitStack(app, {
      environment: 環境名 as any,
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 期待されるテーブル名,
    });
  });
});

describe('AttendanceKitStack - JWT Secret Validation', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  test('フルスタックデプロイ時にjwtSecretが必須', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'dev',
        deployOnlyDynamoDB: false,
      });
    }).toThrow('JWT_SECRET environment variable is required for environment stack deployment');
  });

  test('DynamoDB-onlyモードではjwtSecretは不要', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'test',
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    expect(stack.clockTable).toBeDefined();
    expect(stack.backendApi).toBeUndefined();
  });

  test('test環境でフルスタックデプロイは許可されない', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'test',
        jwtSecret: 'test-secret',
        deployOnlyDynamoDB: false,
      });
    }).toThrow("Full stack deployment is not allowed for 'test' environment");
  });

  test('dev環境でフルスタックデプロイは許可されない', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'dev',
        jwtSecret: 'test-secret',
        deployOnlyDynamoDB: false,
      });
    }).toThrow("Full stack deployment is not allowed for 'dev' environment");
  });
});

describe('AttendanceKitStack - DynamoDB Only Mode', () => {
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

  test('DynamoDB Table Created with test environment name', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-test-clock',
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('Table has DESTROY deletion policy for test environment', () => {
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('Table does not have point-in-time recovery in DynamoDB-only mode', () => {
    const tables = template.findResources('AWS::DynamoDB::Table');
    const tableKeys = Object.keys(tables);
    expect(tableKeys.length).toBe(1);
    
    const table = tables[tableKeys[0]];
    expect(table.Properties?.PointInTimeRecoverySpecification).toBeUndefined();
  });

  test('Global Secondary Index Created in DynamoDB-only mode', () => {
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

  test('Seeder Lambda is created for local environment in DynamoDB-only mode', () => {
    // ローカル環境 (test) はシーダーのみ作成される: 1 Lambda function
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('Backend API is NOT created in DynamoDB-only mode', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 0);
  });

  test('Frontend (CloudFront + S3) is NOT created in DynamoDB-only mode', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 0);
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });

  test('Stack outputs include TableName without export name', () => {
    const outputs = template.findOutputs('TableName');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
    
    const output = outputs[Object.keys(outputs)[0]];
    expect(output.Export).toBeUndefined();
  });

  test('Stack outputs include TableArn without export name', () => {
    const outputs = template.findOutputs('TableArn');
    expect(outputs).toBeDefined();
    expect(Object.keys(outputs).length).toBe(1);
    
    const output = outputs[Object.keys(outputs)[0]];
    expect(output.Export).toBeUndefined();
  });

  test('Stack outputs do NOT include GSIName in DynamoDB-only mode', () => {
    const outputs = template.findOutputs('GSIName');
    expect(Object.keys(outputs).length).toBe(0);
  });

  test('Stack outputs do NOT include Environment in DynamoDB-only mode', () => {
    const outputs = template.findOutputs('Environment');
    expect(Object.keys(outputs).length).toBe(0);
  });

  test('IntegrationTest tag is added in DynamoDB-only mode', () => {
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
