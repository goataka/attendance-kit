import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CostBudgetConstruct } from './constructs/cost-budget';

export interface AttendanceKitAccountStackProps extends cdk.StackProps {
  budgetAmountYen: number;
  alertEmail: string;
}

export class AttendanceKitAccountStack extends cdk.Stack {
  public readonly costBudget: CostBudgetConstruct;

  constructor(scope: Construct, id: string, props: AttendanceKitAccountStackProps) {
    super(scope, id, props);

    const { budgetAmountYen, alertEmail } = props;

    // Create cost budget with alerts (account-level resource)
    this.costBudget = new CostBudgetConstruct(this, 'CostBudget', {
      budgetName: 'attendance-kit-account-monthly-budget',
      budgetAmountYen,
      emailEndpoint: alertEmail,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'BudgetName', {
      value: this.costBudget.budget.ref,
      description: 'AWS Budget name for cost monitoring',
      exportName: 'AttendanceKit-Account-BudgetName',
    });

    new cdk.CfnOutput(this, 'SnsTopicArn', {
      value: this.costBudget.snsTopic.topicArn,
      description: 'SNS Topic ARN for cost alerts',
      exportName: 'AttendanceKit-Account-SnsTopicArn',
    });

    // Cost monitoring tags
    cdk.Tags.of(this).add('Project', 'attendance-kit');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('CostCenter', 'Engineering');
    cdk.Tags.of(this).add('ResourceLevel', 'Account');
  }
}
