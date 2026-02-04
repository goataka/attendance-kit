export type DynamoDBResourceType = 'clock';

export function buildTableName(
  environment: string,
  resourceType: DynamoDBResourceType,
): string {
  return `attendance-kit-${environment}-${resourceType}`;
}

export function resolveTableName(
  resourceType: DynamoDBResourceType,
  defaultEnvironment: string = 'dev',
): string {
  const environment = process.env.NODE_ENV || defaultEnvironment;
  return buildTableName(environment, resourceType);
}
