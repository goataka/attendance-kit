#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';

const app = new cdk.App();

// Get environment parameter from context or environment variable
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

// Validate environment
const validEnvironments = ['dev', 'staging'];
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
}

// AWS environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// Account-level resources (deployed once per AWS account)
const alertEmail = process.env.COST_ALERT_EMAIL;
if (!alertEmail) {
  throw new Error('COST_ALERT_EMAIL environment variable must be set');
}

new AttendanceKitAccountStack(app, 'AttendanceKit-Account-Stack', {
  env,
  budgetAmountYen: 1000,
  alertEmail,
  description: 'Account-level resources for attendance-kit (AWS Budget, SNS)',
  tags: {
    Project: 'attendance-kit',
    ManagedBy: 'CDK',
    CostCenter: 'Engineering',
    ResourceLevel: 'Account',
  },
});

// Environment-level resources (deployed per environment: dev, staging)
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

app.synth();
