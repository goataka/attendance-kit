import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface CostBudgetProps {
  budgetName: string;
  budgetAmountYen: number;
  emailEndpoint: string;
}

export class CostBudgetConstruct extends Construct {
  public readonly snsTopic: sns.Topic;
  public readonly budget: budgets.CfnBudget;

  constructor(scope: Construct, id: string, props: CostBudgetProps) {
    super(scope, id);

    // Create SNS Topic for cost alerts
    this.snsTopic = this.createSnsTopic(props);

    // Grant AWS Budgets service permission to publish to SNS
    this.grantBudgetPublishPermission();

    // Create Budget with alerts
    this.budget = this.createBudget(props);
  }

  private createSnsTopic(props: CostBudgetProps): sns.Topic {
    const topic = new sns.Topic(this, 'CostAlertTopic', {
      topicName: 'attendance-kit-cost-alerts',
      displayName: 'AWS Cost Budget Alerts',
    });

    // Add email subscription
    // Future: Can be extended to support Mobile Push (AWS SNS Mobile Push)
    if (props.emailEndpoint) {
      topic.addSubscription(
        new subscriptions.EmailSubscription(props.emailEndpoint)
      );
    }

    return topic;
  }

  private grantBudgetPublishPermission(): void {
    this.snsTopic.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('budgets.amazonaws.com')],
        actions: ['SNS:Publish'],
        resources: [this.snsTopic.topicArn],
      })
    );
  }

  private createBudget(props: CostBudgetProps): budgets.CfnBudget {
    return new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: props.budgetName,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: props.budgetAmountYen,
          unit: 'JPY',
        },
      },
      notificationsWithSubscribers: [
        // Actual cost alert
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'SNS',
              address: this.snsTopic.topicArn,
            },
          ],
        },
        // Forecasted cost alert
        {
          notification: {
            notificationType: 'FORECASTED',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'SNS',
              address: this.snsTopic.topicArn,
            },
          ],
        },
      ],
    });
  }
}
