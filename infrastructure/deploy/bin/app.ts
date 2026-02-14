#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

const app = new cdk.App();

// Determine which stack to deploy from context
// Valid values:
//   - 'environment': Deploy only Environment Stack (requires environment context)
//   - 'dynamodb': Deploy only DynamoDB Stack (for local development)
const stackType =
  app.node.tryGetContext('stack') || process.env.STACK_TYPE || 'environment';

// Default account ID for local development
const DEFAULT_ACCOUNT_ID = '000000000000';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || DEFAULT_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

const environment =
  app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const jwtSecret = process.env.JWT_SECRET;
const deployOnlyDynamoDB = stackType === 'dynamodb';

new AttendanceKitStack(app, {
  env,
  environment,
  jwtSecret,
  deployOnlyDynamoDB,
});

app.synth();
