import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

describe('AttendanceKitStack', () => {
  let app: App;
  let template: Template;

  beforeEach(() => {
    app = new App();
    const stack = new AttendanceKitStack(app, 'TestStack', {
      environment: 'dev',
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
    template.resourceCountIs('AWS::IAM::Role', 0);
  });

  test('Stack matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});

describe('AttendanceKitStack - Staging Environment', () => {
  test('Staging environment creates correct table name', () => {
    const app = new App();
    const stack = new AttendanceKitStack(app, 'TestStackStaging', {
      environment: 'staging',
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'attendance-kit-staging-clock',
    });
  });

  test('Staging stack matches snapshot', () => {
    const app = new App();
    const stack = new AttendanceKitStack(app, 'TestStackStaging', {
      environment: 'staging',
    });
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });
});
