#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SpecKitDevStack } from '../lib/spec-kit-dev-stack';

const app = new cdk.App();

new SpecKitDevStack(app, 'SpecKitDevStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  },
  description: 'Development environment infrastructure for spec-kit project',
});

app.synth();
