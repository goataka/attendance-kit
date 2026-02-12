import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import { CostBudgetConstruct } from '../lib/constructs/cost-budget';

describe('CostBudgetConstruct（コスト予算）', () => {
  test('SNSトピックが作成されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    // Then: SNS Topicが正しく作成される
    template.resourceCountIs('AWS::SNS::Topic', 1);
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'AWS Cost Budget Alerts',
      TopicName: 'attendance-kit-cost-alerts',
    });
  });

  test('SNSメールサブスクリプションが作成されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    // Then: Email Subscriptionが正しく作成される
    template.resourceCountIs('AWS::SNS::Subscription', 1);
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'test@example.com',
    });
  });

  test('実コストと予測コストのアラート付きBudgetが作成されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    // Then: Budgetが正しい設定で作成される
    template.resourceCountIs('AWS::Budgets::Budget', 1);
    template.hasResourceProperties('AWS::Budgets::Budget', {
      Budget: {
        BudgetType: 'COST',
        TimeUnit: 'MONTHLY',
        BudgetLimit: {
          Amount: 10,
          Unit: 'USD',
        },
      },
    });
  });

  test('Budgetに実コストのSNS通知が設定されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    // Then: 実コスト通知が正しく設定される
    const budgets = template.findResources('AWS::Budgets::Budget');
    const budgetResource = Object.values(budgets)[0];

    expect(
      budgetResource.Properties.NotificationsWithSubscribers,
    ).toBeDefined();
    expect(budgetResource.Properties.NotificationsWithSubscribers.length).toBe(
      2,
    );

    // Check actual cost notification
    const actualNotification =
      budgetResource.Properties.NotificationsWithSubscribers.find(
        (n: any) => n.Notification.NotificationType === 'ACTUAL',
      );
    expect(actualNotification).toBeDefined();
    expect(actualNotification.Notification.Threshold).toBe(100);
    expect(actualNotification.Notification.ComparisonOperator).toBe(
      'GREATER_THAN',
    );
  });

  test('Budgetに予測コストのSNS通知が設定されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    const budgets = template.findResources('AWS::Budgets::Budget');
    const budgetResource = Object.values(budgets)[0];

    // Then: 予測コスト通知が正しく設定される
    const forecastedNotification =
      budgetResource.Properties.NotificationsWithSubscribers.find(
        (n: any) => n.Notification.NotificationType === 'FORECASTED',
      );
    expect(forecastedNotification).toBeDefined();
    expect(forecastedNotification.Notification.Threshold).toBe(100);
    expect(forecastedNotification.Notification.ComparisonOperator).toBe(
      'GREATER_THAN',
    );
  });

  test('SNSトピックにAWS Budgetsからの発行を許可するポリシーが設定されること', () => {
    // Given: CostBudgetConstructの設定
    const stack = new Stack();
    new CostBudgetConstruct(stack, 'TestBudget', {
      budgetName: 'test-budget',
      budgetAmountUsd: 10,
      emailEndpoint: 'test@example.com',
    });

    // When: CloudFormationテンプレートを生成
    const template = Template.fromStack(stack);

    // Then: SNS TopicポリシーがBudgetsサービスからの発行を許可する
    template.hasResourceProperties('AWS::SNS::TopicPolicy', {
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'budgets.amazonaws.com',
            },
            Action: 'SNS:Publish',
          },
        ],
      },
    });
  });
});
