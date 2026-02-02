import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export function formatEnvironmentName(environment: string): string {
  return environment.charAt(0).toUpperCase() + environment.slice(1);
}

export function formatExportName(environment: string, suffix: string): string {
  return `AttendanceKit-${formatEnvironmentName(environment)}-${suffix}`;
}

export function addStandardTags(
  construct: Construct,
  environment: string,
): void {
  cdk.Tags.of(construct).add('Environment', environment);
  cdk.Tags.of(construct).add('Project', 'attendance-kit');
  cdk.Tags.of(construct).add('ManagedBy', 'CDK');
}
