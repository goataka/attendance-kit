# CDK DynamoDB Seeder - 初期データ投入

## 概要

`@cloudcomponents/cdk-dynamodb-seeder`を使用して、DynamoDBテーブルへの初期データ投入をCDKスタックのデプロイ時に自動実行します。

## 仕組み

CDKスタックのデプロイ時に、以下のリソースが自動的に作成されます：

1. **Lambda関数**: データ投入を実行する関数
2. **IAM Role**: Lambda関数に必要な権限（DynamoDB BatchWriteItem、S3 GetObject）
3. **S3アセット**: シードデータのJSONファイルがS3にアップロード
4. **カスタムリソース**: スタックデプロイ時にLambda関数を実行

## データファイル

### `seeds/clock-records.json`

打刻レコードのサンプルデータ。DynamoDBのアイテム形式でそのまま記述します。

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user001",
    "timestamp": "2026-01-29T00:00:00.000Z",
    "date": "2026-01-29",
    "type": "clock-in",
    "location": "東京オフィス",
    "deviceId": "device-001"
  }
]
```

## 実装詳細

### DynamoDBStack

```typescript
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';

// テスト環境のみ初期データを投入
if (environment === 'test' || environment === 'local') {
  new DynamoDBSeeder(this, 'ClockTableSeeder', {
    table: this.clockTable,
    seeds: Seeds.fromJsonFile(
      path.join(__dirname, '../seeds/clock-records.json'),
    ),
  });
}
```

## 実行タイミング

- **自動実行**: CDKスタックのデプロイ時（`cdk deploy`）
- **対象環境**: `test`または`local`環境のみ
- **本番環境**: 本番環境では実行されません

## LocalStackでの動作

LocalStackを使用した統合テスト時にも動作します：

```bash
cd infrastructure/deploy
npm run deploy:local-db
```

これにより、テストデータが自動的に投入されます。

## データ更新方法

1. `seeds/clock-records.json`を編集
2. スタックを再デプロイ

```bash
cd infrastructure/deploy
npm run deploy:local-db
```

## 以前のアプローチとの比較

### 以前の実装（apps/backend/seeds/seed.ts）
- ✅ 独立して実行可能
- ✅ 冪等性チェック
- ❌ CDKとは別のツール
- ❌ 手動実行が必要

### 新しい実装（CDK Seeder）
- ✅ CDKデプロイと統合
- ✅ Infrastructure as Code
- ✅ 自動実行
- ❌ デプロイごとに実行（ただしテスト環境のみ）

## 制約事項

- シードデータのサイズ制限: S3経由で実行されるため、実質的な制限なし
- LocalStackでの制約: Lambda関数の実行環境に依存
- タイムアウト: デフォルト15分（設定可能）

## 参考

- [@cloudcomponents/cdk-dynamodb-seeder](https://www.npmjs.com/package/@cloudcomponents/cdk-dynamodb-seeder)
- [GitHub Repository](https://github.com/cloudcomponents/cdk-constructs)
