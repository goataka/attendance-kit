/**
 * DynamoDBテーブル名を環境名から動的に解決するユーティリティ
 * 
 * 命名規則: attendance-kit-{environment}-{resourceType}
 */

/**
 * DynamoDBテーブルのリソースタイプ
 */
export type DynamoDBResourceType = 'clock';

/**
 * 環境名とリソースタイプからテーブル名を生成する
 * 
 * @param environment - 環境名 (dev, staging, test, local等)
 * @param resourceType - リソースタイプ (clock等)
 * @returns テーブル名 (例: attendance-kit-dev-clock)
 */
export function buildTableName(
  environment: string,
  resourceType: DynamoDBResourceType,
): string {
  return `attendance-kit-${environment}-${resourceType}`;
}

/**
 * 環境変数NODE_ENVからテーブル名を解決する
 * NODE_ENVが未設定の場合はデフォルト値を使用
 * 
 * @param resourceType - リソースタイプ (clock等)
 * @param defaultEnvironment - NODE_ENVが未設定の場合のデフォルト環境名 (デフォルト: 'dev')
 * @returns テーブル名
 */
export function resolveTableName(
  resourceType: DynamoDBResourceType,
  defaultEnvironment: string = 'dev',
): string {
  const environment = process.env.NODE_ENV || defaultEnvironment;
  return buildTableName(environment, resourceType);
}
