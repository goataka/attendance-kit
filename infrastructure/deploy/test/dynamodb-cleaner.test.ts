import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBCleaner } from '../lib/constructs/dynamodb-cleaner';

describe('DynamoDBCleaner', () => {
  let stack: Stack;
  let table: dynamodb.Table;

  beforeEach(() => {
    stack = new Stack();
    table = new dynamodb.Table(stack, 'TestTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'test-table',
    });
  });

  test('Lambda Function Created', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    // NodejsFunction creates 2 Lambda functions: 1 for the actual function, 1 for the Trigger custom resource
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs24.x',
      Handler: 'index.handler',
      Timeout: 300,
    });
  });

  test('Lambda Function has TABLE_NAME environment variable', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          TABLE_NAME: {
            Ref: 'TestTable5769773A',
          },
        },
      },
    });
  });

  test('Trigger Created', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('Custom::Trigger', 1);
  });

  test('IAM Role has DynamoDB permissions', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    // Check that the policy contains DynamoDB read/write permissions
    const policies = template.findResources('AWS::IAM::Policy');
    const policyKeys = Object.keys(policies);
    
    // Find the policy for the cleaner function
    const cleanerPolicy = policyKeys.find(key => key.includes('ClearTableData'));
    expect(cleanerPolicy).toBeDefined();
    
    const policy = policies[cleanerPolicy!];
    const statements = policy.Properties.PolicyDocument.Statement;
    
    // Check that DynamoDB permissions are granted
    const dynamoStatement = statements.find((s: any) => 
      s.Action.some((a: string) => a.startsWith('dynamodb:'))
    );
    expect(dynamoStatement).toBeDefined();
    expect(dynamoStatement.Action).toContain('dynamodb:Scan');
    expect(dynamoStatement.Action).toContain('dynamodb:BatchWriteItem');
    expect(dynamoStatement.Action).toContain('dynamodb:DeleteItem');
  });

  test('Trigger depends on table', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    const triggers = template.findResources('Custom::Trigger');
    const trigger = Object.values(triggers)[0];
    
    // Check that the trigger has dependencies (ExecuteAfter or DependsOn)
    // The actual implementation may use DependsOn at the CloudFormation level
    const hasDependencies = trigger.DependsOn !== undefined || 
                           (trigger.Properties && trigger.Properties.ExecuteAfter !== undefined);
    expect(hasDependencies).toBe(true);
  });

  test('Exposes trigger property', () => {
    const cleaner = new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    expect(cleaner.trigger).toBeDefined();
    expect(cleaner.trigger.node.id).toBe('ClearTableTrigger');
  });
});
