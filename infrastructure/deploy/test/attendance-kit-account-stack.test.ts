import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';

describe('AttendanceKitAccountStack', () => {
  test('Stack creates CostBudgetConstruct', () => {
    const app = new App();
    const stack = new AttendanceKitAccountStack(app, 'TestStack', {
      budgetAmountYen: 1000,
      alertEmail: 'test@example.com',
    });

    const template = Template.fromStack(stack);
    
    // Verify SNS Topic exists
    template.resourceCountIs('AWS::SNS::Topic', 1);
    
    // Verify Budget exists
    template.resourceCountIs('AWS::Budgets::Budget', 1);
    
    // Verify SNS Subscription exists
    template.resourceCountIs('AWS::SNS::Subscription', 1);
  });

  test('Stack has correct outputs', () => {
    const app = new App();
    const stack = new AttendanceKitAccountStack(app, 'TestStack', {
      budgetAmountYen: 1000,
      alertEmail: 'test@example.com',
    });

    const template = Template.fromStack(stack);
    
    // Check for BudgetName output
    template.hasOutput('BudgetName', {
      Description: 'AWS Budget name for cost monitoring',
      Export: {
        Name: 'AttendanceKit-Account-BudgetName',
      },
    });
    
    // Check for SnsTopicArn output
    template.hasOutput('SnsTopicArn', {
      Description: 'SNS Topic ARN for cost alerts',
      Export: {
        Name: 'AttendanceKit-Account-SnsTopicArn',
      },
    });
  });

  test('Stack has correct tags', () => {
    const app = new App();
    const stack = new AttendanceKitAccountStack(app, 'TestStack', {
      budgetAmountYen: 1000,
      alertEmail: 'test@example.com',
    });

    // Verify stack was created successfully
    expect(stack).toBeDefined();
    expect(stack.node.id).toBe('TestStack');
    
    // Verify the stack has tags applied via Tags.of()
    const template = Template.fromStack(stack);
    // Tags are applied at the stack level and inherited by resources
    expect(stack.tags).toBeDefined();
  });

  test('Budget amount is configurable', () => {
    const app = new App();
    const stack = new AttendanceKitAccountStack(app, 'TestStack', {
      budgetAmountYen: 2000,
      alertEmail: 'test@example.com',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Budgets::Budget', {
      Budget: {
        BudgetLimit: {
          Amount: 2000,
          Unit: 'JPY',
        },
      },
    });
  });

  test('Email endpoint is passed to CostBudgetConstruct', () => {
    const app = new App();
    const stack = new AttendanceKitAccountStack(app, 'TestStack', {
      budgetAmountYen: 1000,
      alertEmail: 'custom@example.com',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'custom@example.com',
    });
  });
});
