# Issue: Refactor DynamoDB Table Creation in AttendanceKitStack

## 概要

`AttendanceKitStack`のDynamoDBテーブル作成をリファクタリングし、CDK Construct構造ルールに準拠させる。

## 背景

`BackendApiConstruct`で適用したコンストラクタ構造のベストプラクティスを、`AttendanceKitStack`のDynamoDBテーブル作成にも適用する必要がある。

## 現状の問題

`AttendanceKitStack`のコンストラクタ内で、以下のような直接的なリソース作成が行われている:

```typescript
constructor(scope: Construct, id: string, props: AttendanceKitStackProps) {
  super(scope, id, props);
  
  // NG: コンストラクタ内で直接newを使用
  this.clockTable = new dynamodb.Table(this, 'ClockTable', {
    // ... long configuration
  });
  
  // NG: コンストラクタ内で直接addを使用
  this.clockTable.addGlobalSecondaryIndex({
    // ... configuration
  });
  
  // NG: コンストラクタ内で直接Tagsを追加
  cdk.Tags.of(this.clockTable).add('Environment', environment);
  // ...
}
```

また、以下の重複処理が存在:
- `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}`という処理の繰り返し
- タグの手動追加（`Environment`, `Project`, `ManagedBy`の3つ）

## 実装内容

### 1. ユーティリティ関数の利用

`lib/utils/cdk-helpers.ts`の関数を利用:
- `formatExportName()`: エクスポート名の生成
- `addStandardTags()`: 標準タグの追加

### 2. コンストラクタの構造化

コンストラクタを以下のように変更:

```typescript
constructor(scope: Construct, id: string, props: AttendanceKitStackProps) {
  super(scope, id, props);
  
  const { environment, jwtSecret } = props;
  
  this.clockTable = this.createClockTable(environment);
  this.backendApi = this.createBackendApi(environment, jwtSecret);
  this.createOutputs(environment);
}

private createClockTable(environment: string): dynamodb.Table {
  const table = new dynamodb.Table(this, 'ClockTable', {
    // ... configuration
  });
  
  table.addGlobalSecondaryIndex({
    // ... GSI configuration
  });
  
  addStandardTags(table, environment);
  cdk.Tags.of(table).add('CostCenter', 'Engineering');
  
  return table;
}

private createBackendApi(environment: string, jwtSecret?: string): BackendApiConstruct {
  return new BackendApiConstruct(this, 'BackendApi', {
    environment,
    clockTable: this.clockTable,
    jwtSecret: jwtSecret || 'default-secret-change-in-production',
  });
}

private createOutputs(environment: string): void {
  new cdk.CfnOutput(this, 'TableName', {
    value: this.clockTable.tableName,
    description: `DynamoDB clock table name (${environment})`,
    exportName: formatExportName(environment, 'ClockTableName'),
  });
  
  // ... other outputs
}
```

## 受入基準

- [ ] コンストラクタ内の`new`呼び出しを別関数に切り出し
- [ ] `formatExportName()`を使用して重複処理を削減
- [ ] `addStandardTags()`を使用してタグ追加を簡潔化
- [ ] 既存のテストが全てパス
- [ ] CDKデプロイが成功（差分なし）

## 関連

- ドキュメント: [memory/documentation-rules.md](../memory/documentation-rules.md#cdk-construct構造ルール)
- 参考実装: [infrastructure/deploy/lib/constructs/backend-api.ts](../infrastructure/deploy/lib/constructs/backend-api.ts)
- ユーティリティ: [infrastructure/deploy/lib/utils/cdk-helpers.ts](../infrastructure/deploy/lib/utils/cdk-helpers.ts)

## 優先度

Medium - コードの保守性向上のため、次の機能実装前に対応推奨
