#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitStack } from '../lib/attendance-kit-stack';

const app = new cdk.App();

const LOCALSTACK_ACCOUNT_ID = '000000000000';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || LOCALSTACK_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// 環境変数の取得
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT;
const jwtSecret = process.env.JWT_SECRET;
const deployOnlyDynamoDB = app.node.tryGetContext('deployOnlyDynamoDB') === 'true' || 
                           process.env.DEPLOY_ONLY_DYNAMODB === 'true';

new AttendanceKitStack(app, {
  env,
  environment,
  jwtSecret,
  deployOnlyDynamoDB,
  description: deployOnlyDynamoDB
    ? `DynamoDB Clock Table for integration testing (${environment || 'test'})`
    : `DynamoDB clock table and Backend API for attendance-kit (${environment || 'dev'} environment)`,
  tags: {
    Environment: environment || (deployOnlyDynamoDB ? 'test' : 'dev'),
    Project: 'attendance-kit',
    ManagedBy: 'CDK',
    ...(deployOnlyDynamoDB ? { Purpose: 'IntegrationTest' } : { CostCenter: 'Engineering' }),
  },
});

app.synth();
