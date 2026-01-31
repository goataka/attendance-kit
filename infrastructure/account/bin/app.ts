#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';

const app = new cdk.App();

const LOCALSTACK_ACCOUNT_ID = '000000000000';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || LOCALSTACK_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// Use dummy email for LocalStack/development, or real email from environment
const alertEmail = process.env.COST_ALERT_EMAIL || 'dummy@example.com';

new AttendanceKitAccountStack(app, 'AttendanceKit-Account-Stack', {
  env,
  budgetAmountUsd: 10,
  alertEmail,
  description: 'Account-level resources for attendance-kit (AWS Budget, SNS)',
  tags: {
    Project: 'attendance-kit',
    ManagedBy: 'CDK',
    CostCenter: 'Engineering',
    ResourceLevel: 'Account',
  },
});

app.synth();
