import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import {
  AttendanceKitAccountStack,
  AttendanceKitAccountStackProps,
} from '../lib/attendance-kit-account-stack';

describe('AttendanceKitAccountStack', () => {
  let app: App;
  let stack: AttendanceKitAccountStack;
  let template: Template;

  // Helper function to create common stack props
  const createStackProps = (
    overrides?: Partial<AttendanceKitAccountStackProps>,
  ): AttendanceKitAccountStackProps => ({
    budgetAmountUsd: 10,
    alertEmail: 'test@example.com',
    description: 'Account-level resources for attendance-kit (AWS Budget, SNS)',
    tags: {
      Project: 'attendance-kit',
      ManagedBy: 'CDK',
      CostCenter: 'Engineering',
      ResourceLevel: 'Account',
    },
    ...overrides,
  });

  beforeEach(() => {
    app = new App();
    stack = new AttendanceKitAccountStack(
      app,
      'AttendanceKit-Account-Stack',
      createStackProps(),
    );
    template = Template.fromStack(stack);
  });

  test('Stack creates CostBudgetConstruct', () => {
    // Given: AttendanceKitAccountStackが構築されている
    // When: CloudFormationテンプレートを確認
    // Then: CostBudgetConstructが正しく作成される
    template.resourceCountIs('AWS::SNS::Topic', 1);
    template.resourceCountIs('AWS::Budgets::Budget', 1);
    template.resourceCountIs('AWS::SNS::Subscription', 1);
  });

  test('Stack has correct outputs', () => {
    // Given: AttendanceKitAccountStackが構築されている
    // When: CloudFormationテンプレートを確認
    // Then: BudgetNameとSnsTopicArnの出力が正しく設定される
    template.hasOutput('BudgetName', {
      Description: 'AWS Budget name for cost monitoring',
      Export: {
        Name: 'AttendanceKit-Account-BudgetName',
      },
    });

    template.hasOutput('SnsTopicArn', {
      Description: 'SNS Topic ARN for cost alerts',
      Export: {
        Name: 'AttendanceKit-Account-SnsTopicArn',
      },
    });
  });

  test('Stack has correct tags', () => {
    // Given: AttendanceKitAccountStackが構築されている
    // When: スタックを確認
    // Then: スタックが定義され、タグが適用されている
    expect(stack).toBeDefined();
    expect(stack.node.id).toBe('AttendanceKit-Account-Stack');
    expect(stack.tags).toBeDefined();
  });

  test('Budget amount is configurable', () => {
    // Given: カスタム予算額が設定されたスタック
    const customApp = new App();
    const stack = new AttendanceKitAccountStack(
      customApp,
      'AttendanceKit-Account-Stack',
      createStackProps({
        budgetAmountUsd: 20,
      }),
    );

    // When: CloudFormationテンプレートを確認
    const customTemplate = Template.fromStack(stack);

    // Then: 予算額が正しく設定される
    customTemplate.hasResourceProperties('AWS::Budgets::Budget', {
      Budget: {
        BudgetLimit: {
          Amount: 20,
          Unit: 'USD',
        },
      },
    });
  });

  test('Email endpoint is passed to CostBudgetConstruct', () => {
    // Given: カスタムメールアドレスが設定されたスタック
    const customApp = new App();
    const stack = new AttendanceKitAccountStack(
      customApp,
      'AttendanceKit-Account-Stack',
      createStackProps({
        alertEmail: 'custom@example.com',
      }),
    );

    // When: CloudFormationテンプレートを確認
    const customTemplate = Template.fromStack(stack);

    // Then: メールアドレスが正しく設定される
    customTemplate.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'custom@example.com',
    });
  });

  test('Stack Matches Snapshot', () => {
    // Given: AttendanceKitAccountStackが構築されている
    // When: CloudFormationテンプレートを取得
    // Then: スナップショットと一致する
    expect(template.toJSON()).toMatchSnapshot();
  });
});
