---
applyTo: "**/*.{ts,tsx}"
---
# TypeScript コーディングルール

## CDK Construct構造ルール

### コンストラクタの構造

**原則**: コンストラクタ直下は関数呼び出しを主とし、`new`による初期化は別関数に切り出す

**OK例**:
```typescript
constructor(scope: Construct, id: string, props: MyProps) {
  super(scope, id);
  
  this.resource1 = this.createResource1(props);
  this.resource2 = this.createResource2(props);
  this.setupIntegration();
  this.createOutputs();
  this.applyTags();
}

private createResource1(props: MyProps): ResourceType {
  return new ResourceType(this, 'Resource1', {
    // ... configuration
  });
}
```

**NG例**:
```typescript
constructor(scope: Construct, id: string, props: MyProps) {
  super(scope, id);
  
  // NG: コンストラクタ内で直接newを使用
  this.resource1 = new ResourceType(this, 'Resource1', {
    // ... long configuration
  });
  
  this.resource2 = new ResourceType(this, 'Resource2', {
    // ... long configuration
  });
}
```

### ユーティリティ関数の使用

共通処理は`lib/utils/`に配置し、再利用する:

- **環境名のフォーマット**: `formatEnvironmentName()`
- **エクスポート名の生成**: `formatExportName()`
- **タグの追加**: `addStandardTags()`

### 適用対象

このルールは以下のConstructに適用:
- `BackendApiConstruct` (完了)
- `DynamoDBConstruct` (TODO: Issue作成済み)
- その他、すべての新規Construct

### CloudFormation Outputs

**後続で必要なOutputのみ追加**:
- 使用されないOutputは追加しない
- 必要性が明確でないOutputは削除

**OK例**:
```typescript
// フロントエンドから参照されるAPI URL
new cdk.CfnOutput(this, 'ApiUrl', {
  value: api.url,
  exportName: formatExportName(environment, 'ApiUrl'),
});
```

**NG例**:
```typescript
// 後続で使用されないOutput
new cdk.CfnOutput(this, 'ApiId', {
  value: api.restApiId,  // 不要
});
```

### フィールド変数の使用

**ローカル変数と引数渡しを優先**:
- フィールド変数（this.xxx）を減らす
- メソッド間は引数で値を渡す

**OK例**:
```typescript
const lambda = this.createLambda(environment);
const api = this.createApi(environment);
this.setupIntegration(lambda, api);
```

**NG例**:
```typescript
this.lambda = this.createLambda(environment);
this.api = this.createApi(environment);
this.setupIntegration();  // this.lambdaとthis.apiを使用
```

## Node.js バージョン要件

### 最小バージョン

- **最小バージョン**: Node.js 24.x以上
- package.jsonの`engines`フィールドで指定:

```json
{
  "engines": {
    "node": ">=24.0.0",
    "npm": ">=10.0.0"
  }
}
```

### バージョン表記

- READMEでは「Node.js 24.x以上」と記載
- 具体的なマイナーバージョンは記載しない

## package.json ルール

### npm scripts でのworkspace参照

monorepo構成で他のworkspaceのスクリプトを呼び出す場合、`--prefix`ではなく`-w`（または`--workspace`）オプションを使用する。

**OK例**:
```json
{
  "scripts": {
    "start:local-db": "npm run deploy:local-db -w attendance-kit-infrastructure",
    "pretest:integration": "npm run deploy:local-db -w attendance-kit-infrastructure"
  }
}
```

**NG例**:
```json
{
  "scripts": {
    "start:local-db": "npm run deploy:local-db --prefix infrastructure/deploy",
    "pretest:integration": "npm run start:local-db --prefix ../.."
  }
}
```

**理由**:
- workspace名による参照は、ディレクトリ構造の変更に強い
- npm workspacesの標準的な使い方に従う
- package.jsonの`name`フィールドで明示的に参照される

