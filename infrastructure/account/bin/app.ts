#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttendanceKitAccountStack } from '../lib/attendance-kit-account-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

const alertEmail = process.env.COST_ALERT_EMAIL;
if (!alertEmail) {
  throw new Error('COST_ALERT_EMAIL environment variable is required');
}

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
