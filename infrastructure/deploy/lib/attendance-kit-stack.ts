import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseConstruct } from './constructs/database-construct';
import { FrontendConstruct } from './constructs/frontend-construct';
import { SiteConstruct } from './constructs/site-construct';
import { BackendConstruct } from './constructs/backend-construct';

export interface AttendanceKitStackProps extends cdk.StackProps {
  environment: string; // 'dev' | 'staging' | 'prod'
}

export class AttendanceKitStack extends cdk.Stack {
  public readonly database: DatabaseConstruct;
  public readonly frontend: FrontendConstruct;
  public readonly site: SiteConstruct;
  public readonly backend: BackendConstruct;

  constructor(scope: Construct, id: string, props: AttendanceKitStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // NOTE: OIDC Provider and IAM Role are managed by CloudFormation
    // (infrastructure/setup/attendance-kit-setup.yaml)
    // This is because OIDC Provider cannot be created with the same URL multiple times,
    // preventing migration from CloudFormation to CDK.
    // Use repository sync to automatically update the CloudFormation stack.

    // Database (DynamoDB)
    this.database = new DatabaseConstruct(this, 'Database', {
      environment,
    });

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
      clockTable: this.database.clockTable,
      frontendUrl: `https://${this.frontend.distribution.distributionDomainName}`,
    });

    // CloudFormation Output for Environment
    new cdk.CfnOutput(this, 'Environment', {
      value: environment,
      description: 'Deployment environment',
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-Environment`,
    });
  }
}
