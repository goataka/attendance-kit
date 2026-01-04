#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';
import { AttendanceKitAppStack } from '../lib/attendance-kit-app-stack';

const app = new cdk.App();

// Determine which stack to deploy from context
// Valid values:
//   - 'account': Deploy only Account Stack (requires COST_ALERT_EMAIL)
//   - 'infrastructure': Deploy only Infrastructure Stack (DynamoDB)
//   - 'app': Deploy only App Stack (Frontend, Backend, Site)
//   - 'all': Deploy all stacks (default, COST_ALERT_EMAIL is required)
const stackType = app.node.tryGetContext('stack') || process.env.STACK_TYPE || 'all';

// AWS environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// Determine environment (dev, staging, prod)
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

// Validate environment
const validEnvironments = ['dev', 'staging', 'prod'];
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
}

// Account-level resources (deployed once per AWS account)
if (['all', 'account'].includes(stackType)) {
  const alertEmail = process.env.COST_ALERT_EMAIL;
  if (!alertEmail || !alertEmail.trim()) {
    throw new Error('COST_ALERT_EMAIL environment variable must be set for account stack deployment');
  }
  new AttendanceKitAccountStack(app, 'AttendanceKit-Account-Stack', {
    env,
    budgetAmountUsd: 10,
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

// Infrastructure resources (DynamoDB)
let clockTableName: string | undefined;
if (['all', 'infrastructure'].includes(stackType)) {
  const stackName = `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-Stack`;
  
  const infraStack = new AttendanceKitStack(app, stackName, {
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
  
  clockTableName = infraStack.clockTable.tableName;
}

// Application resources (Frontend, Backend, Site)
if (['all', 'app'].includes(stackType)) {
  // If not deploying infrastructure stack, get table name from context or environment
  if (!clockTableName) {
    clockTableName = app.node.tryGetContext('clockTableName') 
      || process.env.CLOCK_TABLE_NAME 
      || `attendance-kit-${environment}-clock`;
  }
  
  const appStackName = `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-App-Stack`;
  
  new AttendanceKitAppStack(app, appStackName, {
    env,
    environment,
    clockTableName,
    description: `Application resources for attendance-kit (${environment} environment)`,
    tags: {
      Environment: environment,
      Project: 'attendance-kit',
      ManagedBy: 'CDK',
      CostCenter: 'Engineering',
    },
  });
}

app.synth();
