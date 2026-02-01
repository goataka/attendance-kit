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

    // スタックが正常に作成されることを確認
    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
    });
  });

  test('無効な環境名でエラーが発生する', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'invalid',
        deployOnlyDynamoDB: true,
      });
    }).toThrow('Invalid environment: invalid. Must be one of: dev, staging, test, local');
  });

  test('有効な環境名: dev', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'dev',
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-dev-clock',
    });
  });

  test('有効な環境名: staging', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'staging',
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-staging-clock',
    });
  });

  test('有効な環境名: test', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'test',
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-test-clock',
    });
  });

  test('有効な環境名: local', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'local',
      deployOnlyDynamoDB: true,
    });

    expect(stack).toBeDefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-local-clock',
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
        // jwtSecret が提供されていない
      });
    }).toThrow('JWT_SECRET environment variable is required for environment stack deployment');
  });

  test('DynamoDB-onlyモードではjwtSecretは不要', () => {
    const stack = new AttendanceKitStack(app, {
      environment: 'test',
      deployOnlyDynamoDB: true,
      // jwtSecret が提供されていない
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

  test('local環境でフルスタックデプロイは許可されない', () => {
    expect(() => {
      new AttendanceKitStack(app, {
        environment: 'local',
        jwtSecret: 'test-secret',
        deployOnlyDynamoDB: false,
      });
    }).toThrow("Full stack deployment is not allowed for 'local' environment");
  });
});
