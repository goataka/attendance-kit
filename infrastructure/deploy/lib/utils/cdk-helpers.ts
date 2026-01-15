import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Format environment name with capital first letter
 * Example: "dev" -> "Dev", "production" -> "Production"
 */
export function formatEnvironmentName(environment: string): string {
  return environment.charAt(0).toUpperCase() + environment.slice(1);
}

/**
 * Generate export name with AttendanceKit prefix
 * Example: formatExportName("dev", "ApiUrl") -> "AttendanceKit-Dev-ApiUrl"
 */
export function formatExportName(environment: string, suffix: string): string {
  return `AttendanceKit-${formatEnvironmentName(environment)}-${suffix}`;
}

/**
 * Add standard tags to a construct
 */
export function addStandardTags(
  construct: Construct,
  environment: string,
): void {
  cdk.Tags.of(construct).add('Environment', environment);
  cdk.Tags.of(construct).add('Project', 'attendance-kit');
  cdk.Tags.of(construct).add('ManagedBy', 'CDK');
}
