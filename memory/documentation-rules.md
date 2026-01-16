# ドキュメント作成ルール

最終更新: 2026-01-15

## 基本原則

### 1. 作業情報をREADMEに含めない

**NG例**:
- 実装完了日
- 実装の概要・経緯
- MVP達成状況
- 次のステップ
- コスト見積もり

**理由**: READMEは製品の使い方を説明する場所であり、開発プロセスの記録ではない。

### 2. DRY原則 (Don't Repeat Yourself)

- 同じ情報を複数箇所に書かない
- 詳細はスクリプトやコードファイルに記述し、ドキュメントからは参照する
- 引用を極力避け、リンクで参照する

**OK例**:
```markdown
詳細は[build-backend.sh](./scripts/build-backend.sh)を参照してください。
```

**NG例**:
```markdown
以下のコマンドを実行します:
\`\`\`bash
#!/bin/bash
cd /path/to/backend
npm install
npm run build
\`\`\`
```

### 3. 簡潔性

- コマンドは簡潔にリストで紹介
- 説明が必要な場合のみブロックで記述
- 冗長な説明を避ける

**OK例**:
```markdown
| コマンド | 説明 |
|---------|------|
| `npm run build` | ビルド |
| `npm test` | テスト実行 |
```

**NG例**:
```markdown
### ビルド

プロジェクトをビルドするには、以下のコマンドを実行します:

\`\`\`bash
npm run build
\`\`\`

このコマンドは、TypeScriptファイルをコンパイルし、dist/ディレクトリに出力します。
```

### 4. コードブロックの記法

- インラインコードは `` ` `` (バッククォート) のみ使用
- `` \` `` (バックスラッシュ+バッククォート) は使用しない

**OK**: `npm run build`

**NG**: \`npm run build\`

## READMEの推奨構造

### 最小限の構成

```markdown
# プロジェクト名

簡単な説明（1-2行）

## インストール

...

## 使い方

...

## 開発

...

## テスト

...

## 関連ドキュメント

- [API Documentation](./api/README.md)
- [Scripts](./scripts/README.md)
```

### 含めるべきもの

- インストール方法
- 基本的な使い方
- 開発環境のセットアップ
- テストの実行方法
- 関連ドキュメントへのリンク

### 含めないもの

- 実装完了日
- 開発の経緯
- MVP達成状況
- 次のステップ
- コスト見積もり
- 詳細なアーキテクチャ説明（別ドキュメントへ）
- 長いコマンドの引用（スクリプトへの参照で十分）

## 技術要件

### Node.js バージョン

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

## 関連ドキュメント

- [Agent開発ガイドライン](../.github/agents/AGENTS.md)
- [プロジェクト憲法](./constitution.md)

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

## コーディング規約

### 1. コメントは日本語で記述

**理由**: チーム内のコミュニケーションを円滑にし、コードの可読性を向上させる

**OK例**:
```typescript
// ユーザーIDからデータを取得
const data = await this.repository.findById(userId);
```

**NG例**:
```typescript
// Fetch data by user ID
const data = await this.repository.findById(userId);
```

### 2. Issue管理

**`infrastructure/deploy/ISSUES.md`に集約**:
- `docs/issues/`には作成しない
- 簡潔な箇条書きで記載
- 優先度と概要のみ記述

**OK例**:
```markdown
## TODO

### DynamoDB Table Construct のリファクタリング

- [ ] コンストラクタ内のリソース作成を別関数に切り出す
- [ ] ヘルパー関数を使用して重複を削減

**優先度**: Medium
```
