# 初期データ投入機能 - 実装プラン

## 概要

開発・テスト環境用の初期データを簡単に投入できる仕組みを提供します。

**最新アプローチ**: CDKスタックのデプロイ時に`@cloudcomponents/cdk-dynamodb-seeder`を使用して自動的にデータを投入します。

## 目的

- 開発環境でのデータ準備の効率化
- テスト実行時のサンプルデータ提供
- 新規開発者のオンボーディング支援
- Infrastructure as Codeとしてのデータ管理

## スコープ

### Phase 1（本実装）
- ユーザーデータの定義と参照
- 打刻レコードのサンプルデータ投入
- LocalStack環境対応
- **CDK統合**: デプロイ時の自動データ投入

### Phase 2（完了）
- **CDK Seeder統合**: `@cloudcomponents/cdk-dynamodb-seeder`を使用
- CDKデプロイと統合された自動データ投入
- Infrastructure as Code化

### 将来の拡張（Phase 3以降）
- ユーザー管理テーブルの実装
- より多様なサンプルデータパターン
- 本番環境用の初期マスタデータ投入機能

## アーキテクチャ

### 新しいアプローチ（CDK Seeder）

```
infrastructure/deploy/
├── lib/
│   └── dynamodb-stack.ts       # DynamoDBSeederを統合
├── seeds/
│   └── clock-records.json      # シードデータ
└── docs/
    └── dynamodb-seeder.md      # 詳細ドキュメント
```

### 旧アプローチ（保持）

```
apps/backend/seeds/
├── seed.ts                    # スタンドアロンスクリプト
├── data/
│   ├── users.json            # ユーザー定義
│   └── clock-records.json    # 打刻レコード
└── README.md                 # 使用方法
```

**注**: 旧アプローチは手動実行やCI/CDでの利用のために保持されています。

## データフロー

### CDK Seeder（推奨）

1. CDKスタックのデプロイ実行
2. Lambda関数とカスタムリソースが作成される
3. シードデータがS3にアップロード
4. Lambda関数がDynamoDB BatchWriteItemでデータ投入
5. 完了

### スタンドアロンスクリプト

1. JSONファイルから初期データを読み込み
2. 環境変数からDynamoDB接続情報を取得
3. 既存レコードをチェック（冪等性）
4. DynamoDBに投入

## 技術仕様

### CDK Seeder

```typescript
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';

if (environment === 'test' || environment === 'local') {
  new DynamoDBSeeder(this, 'ClockTableSeeder', {
    table: this.clockTable,
    seeds: Seeds.fromJsonFile(
      path.join(__dirname, '../seeds/clock-records.json'),
    ),
  });
}
```

### データ構造

#### users.json
```typescript
interface UserData {
  userId: string;
  name: string;
  email: string;
  department: string;
}
```

#### clock-records.json
```typescript
interface ClockRecordSeedData {
  userId: string;
  type: 'clock-in' | 'clock-out';
  location?: string;
  deviceId?: string;
  daysAgo: number;
  hour: number;
  minute: number;
}
```

### 環境変数

| 変数 | 説明 | デフォルト |
|------|------|----------|
| `DYNAMODB_TABLE_NAME` | テーブル名 | `attendance-kit-dev-clock` |
| `DYNAMODB_ENDPOINT` | エンドポイント | なし（AWS） |
| `AWS_REGION` | リージョン | `ap-northeast-1` |

## 実装詳細

### CDK Seeder（自動実行）

- **実行タイミング**: CDKスタックのデプロイ時
- **対象環境**: `test`または`local`環境のみ
- **機能**: Lambda関数とカスタムリソースによる自動投入
- **利点**: Infrastructure as Code、デプロイと同時に完了

### スタンドアロンスクリプト（手動実行）

#### 冪等性の確保

既存レコード数をチェックし、データが存在する場合はスキップします。`--force`オプションで強制的に上書き可能です。

#### エラーハンドリング

- DynamoDB接続エラー
- テーブル不存在エラー
- JSONパースエラー

すべて適切なエラーメッセージと共に終了コード1で終了します。

## 使用方法

### CDK Seeder（推奨）

```bash
# DynamoDBスタックをデプロイ（データも自動投入）
cd infrastructure/deploy
npm run deploy:local-db
```

データは自動的に投入されます。手動実行は不要です。

### スタンドアロンスクリプト（オプション）

```bash
# 基本的な実行
npm run seed:local

# 強制上書き
npm run seed:local -- --force
```

## テスト

### 単体テスト
- データファイルのバリデーション
- フィールドの存在確認
- データ整合性チェック

### 統合テスト
LocalStack環境でのE2Eテストは、今後の課題として検討します。

## 制約事項

- 現状、ユーザー認証情報はAuthServiceにハードコードされています
- ユーザー管理テーブルが実装されていないため、ユーザーデータは参考情報のみです
- 本番環境での実行は想定していません

## セキュリティ考慮事項

- シードデータにはテスト用の情報のみを含めます
- 本番環境で使用される認証情報は含めません
- 環境変数経由でデータベース接続情報を管理します

## 運用

### 定期メンテナンス
- サンプルユーザーの追加・更新
- 打刻パターンの多様化
- データ品質の維持

### バージョン管理
- データファイルはGit管理下に置きます
- 変更履歴をコミットログで追跡します

## 将来の改善

1. **ユーザー管理機能の実装**
   - 専用のユーザーテーブル作成
   - パスワードハッシュ化
   - ユーザー属性の拡張

2. **データパターンの拡張**
   - 月間データ生成
   - 複数オフィス対応
   - 特殊ケース（休日出勤、深夜勤務）

3. **CI/CD統合**
   - テスト環境への自動投入（CDK Seederで実現済み）
   - スモークテストの一部として実行

## 参考ドキュメント

- [CDK DynamoDB Seeder詳細](../../infrastructure/deploy/docs/dynamodb-seeder.md)
- [スタンドアロンスクリプト](../../apps/backend/seeds/README.md)
- [@cloudcomponents/cdk-dynamodb-seeder](https://www.npmjs.com/package/@cloudcomponents/cdk-dynamodb-seeder)
