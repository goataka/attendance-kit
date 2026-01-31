#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';
import { DynamoDBStack } from '../lib/dynamodb-stack';

const app = new cdk.App();

// Determine which stack to deploy from context
// Valid values:
//   - 'environment': Deploy only Environment Stack (requires environment context)
//   - 'dynamodb': Deploy only DynamoDB Stack (for integration testing)
const stackType = app.node.tryGetContext('stack') || process.env.STACK_TYPE || 'environment';

const LOCALSTACK_ACCOUNT_ID = '000000000000';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || LOCALSTACK_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// Environment-level resources (deployed per environment: dev, staging)
if (['environment'].includes(stackType)) {
  const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
  
  // Validate environment
  const validEnvironments = ['dev', 'staging'];
  if (!validEnvironments.includes(environment)) {
    throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
  }

  // Validate JWT_SECRET is provided
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required for environment stack deployment');
  }

  const stackName = `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-Stack`;

  new AttendanceKitStack(app, stackName, {
    env,
    environment,
    jwtSecret,
    description: `DynamoDB clock table and Backend API for attendance-kit (${environment} environment)`,
    tags: {
      Environment: environment,
      Project: 'attendance-kit',
      ManagedBy: 'CDK',
      CostCenter: 'Engineering',
    },
  });
}

// DynamoDB-only stack (for integration testing with LocalStack)
if (stackType === 'dynamodb') {
  const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'test';
  
  new DynamoDBStack(app, `AttendanceKit-${environment}-DynamoDB`, {
    env,
    environment,
    description: `DynamoDB Clock Table for integration testing (${environment})`,
    tags: {
      Environment: environment,
      Project: 'attendance-kit',
      ManagedBy: 'CDK',
      Purpose: 'IntegrationTest',
    },
  });
}

app.synth();
