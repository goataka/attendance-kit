import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { FrontendConstruct } from './constructs/frontend-construct';
import { SiteConstruct } from './constructs/site-construct';
import { BackendConstruct } from './constructs/backend-construct';

export interface AttendanceKitStackProps extends cdk.StackProps {
  environment: string; // 'dev' | 'staging' | 'prod'
}

export class AttendanceKitStack extends cdk.Stack {
  public readonly clockTable: dynamodb.Table;
  public readonly frontend?: FrontendConstruct;
  public readonly site?: SiteConstruct;
  public readonly backend?: BackendConstruct;

  constructor(scope: Construct, id: string, props: AttendanceKitStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // NOTE: OIDC Provider and IAM Role are managed by CloudFormation
    // (infrastructure/setup/attendance-kit-setup.yaml)
    // This is because OIDC Provider cannot be created with the same URL multiple times,
    // preventing migration from CloudFormation to CDK.
    // Use repository sync to automatically update the CloudFormation stack.

    // DynamoDB Clock Table
    this.clockTable = new dynamodb.Table(this, 'ClockTable', {
      tableName: `attendance-kit-${environment}-clock`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // Cost optimization: No additional alarms or monitoring features
    });

    // Global Secondary Index: DateIndex
    this.clockTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Cost monitoring tags
    cdk.Tags.of(this.clockTable).add('Environment', environment);
    cdk.Tags.of(this.clockTable).add('Project', 'attendance-kit');
    cdk.Tags.of(this.clockTable).add('ManagedBy', 'CDK');
    cdk.Tags.of(this.clockTable).add('CostCenter', 'Engineering');

    // CloudFormation Outputs for DynamoDB
    new cdk.CfnOutput(this, 'TableName', {
      value: this.clockTable.tableName,
      description: `DynamoDB clock table name (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-ClockTableName`,
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.clockTable.tableArn,
      description: `DynamoDB clock table ARN (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-ClockTableArn`,
    });

    new cdk.CfnOutput(this, 'GSIName', {
      value: 'DateIndex',
      description: `Global Secondary Index name (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-GSIName`,
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: environment,
      description: 'Deployment environment',
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-Environment`,
    });

    // Application resources (optional deployment)
    const deployApp = this.node.tryGetContext('deployApp') !== 'false';
    
    if (deployApp) {
      // Frontend (React App)
      this.frontend = new FrontendConstruct(this, 'Frontend', {
        environment,
      });

      // Support Site (Astro + Starlight)
      this.site = new SiteConstruct(this, 'Site', {
        environment,
      });

      // Backend (NestJS on Lambda)
      this.backend = new BackendConstruct(this, 'Backend', {
        environment,
        clockTable: this.clockTable,
        frontendUrl: `https://${this.frontend.distribution.distributionDomainName}`,
      });
    }
  }
}
