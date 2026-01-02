#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';

const app = new cdk.App();

// Determine which stack to deploy from context
// This allows bootstrap and individual stack deployments to work independently
// Valid values:
//   - 'bootstrap': No stacks created (for CDK bootstrap operation only)
//   - 'account': Deploy only Account Stack (requires COST_ALERT_EMAIL)
//   - 'environment': Deploy only Environment Stack (requires environment context)
//   - 'all': Deploy both stacks (default, COST_ALERT_EMAIL is optional)
const stackType = app.node.tryGetContext('stack') || process.env.STACK_TYPE || 'all';

// AWS environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// Account-level resources (deployed once per AWS account)
if (['all', 'account'].includes(stackType)) {
  const alertEmail = process.env.COST_ALERT_EMAIL;
  if (alertEmail && alertEmail.trim()) {
    new AttendanceKitAccountStack(app, 'AttendanceKit-Account-Stack', {
      env,
      budgetAmountYen: 1000,
      alertEmail: alertEmail.trim(),
      description: 'Account-level resources for attendance-kit (AWS Budget, SNS)',
      tags: {
        Project: 'attendance-kit',
        ManagedBy: 'CDK',
        CostCenter: 'Engineering',
        ResourceLevel: 'Account',
      },
    });
  }
}

// Environment-level resources (deployed per environment: dev, staging)
if (['all', 'environment'].includes(stackType)) {
  const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
  
  // Validate environment
  const validEnvironments = ['dev', 'staging'];
  if (!validEnvironments.includes(environment)) {
    throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
  }

  const stackName = `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-Stack`;

  new AttendanceKitStack(app, stackName, {
    env,
    environment,
    description: `DynamoDB clock table for attendance-kit (${environment} environment)`,
    tags: {
      Environment: environment,
      Project: 'attendance-kit',
      ManagedBy: 'CDK',
      CostCenter: 'Engineering',
    },
  });
}

app.synth();
