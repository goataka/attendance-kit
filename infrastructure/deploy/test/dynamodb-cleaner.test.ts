import { Template, Match } from 'aws-cdk-lib/assertions';
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

  test('Lambda関数が作成される', () => {
    // Given: DynamoDBCleanerコンストラクトの設定
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    // When: CloudFormationテンプレートを確認
    const template = Template.fromStack(stack);

    // Then: Lambda関数が正しく作成される
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs24.x',
      Handler: 'index.handler',
      Timeout: 300,
    });
  });

  test('Lambda関数にTABLE_NAME環境変数が設定される', () => {
    // Given: DynamoDBCleanerコンストラクトの設定
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    // When: CloudFormationテンプレートを確認
    const template = Template.fromStack(stack);

    // Then: 環境変数が正しく設定される
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          TABLE_NAME: {
            Ref: 'TestTable5769773A',
          },
          DEPLOY_ID: Match.anyValue(),
        },
      },
    });
  });

  test('Triggerが作成される', () => {
    // Given: DynamoDBCleanerコンストラクトの設定
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    // When: CloudFormationテンプレートを確認
    const template = Template.fromStack(stack);

    // Then: Triggerが作成される
    template.resourceCountIs('Custom::Trigger', 1);
  });

  test('IAMロールにDynamoDB権限が付与される', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    // Check that the policy contains DynamoDB read/write permissions
    const policies = template.findResources('AWS::IAM::Policy');
    const policyKeys = Object.keys(policies);

    // Find the policy for the cleaner function
    const cleanerPolicy = policyKeys.find((key) =>
      key.includes('ClearTableData'),
    );
    expect(cleanerPolicy).toBeDefined();

    const policy = policies[cleanerPolicy!];
    const statements = policy.Properties.PolicyDocument.Statement;

    // Check that DynamoDB permissions are granted
    const dynamoStatement = statements.find((s: any) =>
      s.Action.some((a: string) => a.startsWith('dynamodb:')),
    );
    expect(dynamoStatement).toBeDefined();
    expect(dynamoStatement.Action).toContain('dynamodb:Scan');
    expect(dynamoStatement.Action).toContain('dynamodb:BatchWriteItem');
    expect(dynamoStatement.Action).toContain('dynamodb:DeleteItem');
  });

  test('Triggerが依存関係付きで作成される', () => {
    new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    const template = Template.fromStack(stack);
    const triggers = template.findResources('Custom::Trigger');
    const trigger = Object.values(triggers)[0];

    // Check that the trigger has dependencies (ExecuteAfter or DependsOn)
    // The actual implementation may use DependsOn at the CloudFormation level
    const hasDependencies =
      trigger.DependsOn !== undefined ||
      (trigger.Properties && trigger.Properties.ExecuteAfter !== undefined);
    expect(hasDependencies).toBe(true);
  });

  test('triggerプロパティが公開される', () => {
    // Given: DynamoDBCleanerコンストラクトの作成
    const cleaner = new DynamoDBCleaner(stack, 'TestCleaner', {
      table,
    });

    // When: triggerプロパティを確認
    // Then: triggerが正しく公開される
    expect(cleaner.trigger).toBeDefined();
    expect(cleaner.trigger.node.id).toBe('ClearTableTrigger');
  });
});
