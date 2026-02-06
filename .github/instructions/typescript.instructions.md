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

## コメント規約

### TSDoc/JSDocの不使用

**原則**: TSDoc/JSDoc形式のコメント（`/**`で始まるコメント）は使用しない

**理由**:
- 関数名や変数名、型情報で意図を明確に表現する
- TypeScriptの型システムが十分な情報を提供する
- 保守コストを削減する

**対応方法**:
- 必要な補足説明は通常のコメント（`//`）で十分
- メソッド名を明確にして、コメントが不要な自己説明的なコードにする

**OK例**:
```typescript
// 環境変数が有効な値であることを確認
private static validateEnvironmentStatic(environment: string): void {
  // ...
}
```

**NG例**:
```typescript
/**
 * 環境変数のバリデーション（static）
 */
private static validateEnvironmentStatic(environment: string): void {
  // ...
}
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

**適用範囲**: workspace間の呼び出し（例: あるworkspaceから別のworkspaceのスクリプトを実行）

**OK例**:
```json
{
  "scripts": {
    "start:local-db": "npm run deploy:local-db -w @attendance-kit/deploy",
    "pretest:integration": "npm run start:local-db --prefix ../.."
  }
}
```

**NG例**:
```json
{
  "scripts": {
    "start:local-db": "npm run deploy:local-db --prefix infrastructure/deploy",
    "pretest:integration": "npm run deploy:local-db -w @attendance-kit/deploy"
  }
}
```

**理由**:
- workspace名による参照は、ディレクトリ構造の変更に強い
- npm workspacesの標準的な使い方に従う
- package.jsonの`name`フィールドで明示的に参照される

**ベストプラクティス**: workspaceから別のworkspaceを呼び出す場合、直接呼び出さずrootを経由する

```json
{
  "scripts": {
    "pretest:integration": "npm run start:local-db --prefix ../.."
  }
}
```

これにより、依存関係が一元管理され、変更時の影響範囲が明確になる。

**例外**: workspaceからrootパッケージのスクリプトを呼び出す場合は`--prefix`を使用可能（rootはworkspaceとして定義されていないため）

```json
{
  "scripts": {
    "setup": "npm run setup --prefix ../.."
  }
}
```

## テストルール

### Parameterized Test（パラメータ化テスト）

複数のテストケースで同じロジックを検証する場合、Parameterized Testを利用する。

**原則**: 類似した複数のテストケースは`test.each`、`describe.each`、`it.each`を使用して一つにまとめる

**OK例**:
```typescript
describe('resolveBackendUrl', () => {
  test.each([
    {
      ケース: '環境変数のURLが提供された場合はそれを使用すること',
      envUrl: 'https://api.example.com',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '環境変数のURLから/apiサフィックスを削除すること',
      envUrl: 'https://api.example.com/api',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '環境変数のURLから/api/サフィックスを削除すること',
      envUrl: 'https://api.example.com/api/',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '開発環境ではlocalhostにフォールバックすること',
      envUrl: undefined,
      isDev: true,
      windowOrigin: 'https://app.example.com',
      期待値: 'http://localhost:3000',
    },
  ])('$ケース', ({ envUrl, isDev, windowOrigin, 期待値 }) => {
    const url = resolveBackendUrl(envUrl, isDev, windowOrigin);
    expect(url).toBe(期待値);
  });
});
```

**NG例**:
```typescript
describe('resolveBackendUrl', () => {
  it('環境変数のURLが提供された場合はそれを使用すること', () => {
    const url = resolveBackendUrl('https://api.example.com', false, undefined);
    expect(url).toBe('https://api.example.com');
  });

  it('環境変数のURLから/apiサフィックスを削除すること', () => {
    const url = resolveBackendUrl('https://api.example.com/api', false, undefined);
    expect(url).toBe('https://api.example.com');
  });

  it('環境変数のURLから/api/サフィックスを削除すること', () => {
    const url = resolveBackendUrl('https://api.example.com/api/', false, undefined);
    expect(url).toBe('https://api.example.com');
  });
  
  // ... 同様のパターンが続く
});
```

**テストケースの記載**:
- テストケースのラベル（フィールド名）は日本語で記載する
- 例: `ケース`、`入力値`、`期待値`、`説明`など
- テスト名のテンプレート（`$ケース`）で日本語フィールドを参照する

**理由**:
- テストコードの重複を削減し、保守性を向上させる
- テストケースの追加が容易になる
- テスト構造が明確になり、テストの意図が理解しやすくなる
- 日本語のラベルを使用することで、チーム内でのテスト内容の理解が容易になる

