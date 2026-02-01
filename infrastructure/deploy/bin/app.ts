#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

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
  const jwtSecret = process.env.JWT_SECRET;

  new AttendanceKitStack(app, {
    env,
    environment,
    jwtSecret,
    deployOnlyDynamoDB: false,
  });
}

// DynamoDB-only stack (for integration testing with LocalStack)
if (stackType === 'dynamodb') {
  const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

  new AttendanceKitStack(app, {
    env,
    environment,
    deployOnlyDynamoDB: true,
  });
}

app.synth();
