# CDK DynamoDB Seeder - 初期データ投入

## 概要

`@cloudcomponents/cdk-dynamodb-seeder`を使用して、DynamoDBテーブルへの初期データ投入をCDKスタックのデプロイ時に自動実行します。

デプロイ時には、既存データをクリアしてから新しいデータを投入することで、常にクリーンな状態を保証します。

## 仕組み

CDKスタックのデプロイ時に、以下のリソースが自動的に作成されます：

1. **データクリア用Lambda関数**: テーブルの既存データを削除
2. **Trigger**: デプロイ時にクリア関数を実行
3. **シーダーLambda関数**: データ投入を実行する関数
4. **IAM Role**: Lambda関数に必要な権限（DynamoDB BatchWriteItem、S3 GetObject）
5. **S3アセット**: シードデータのJSONファイルがS3にアップロード
6. **カスタムリソース**: スタックデプロイ時にLambda関数を実行

### 実行順序

1. テーブル作成
2. **データクリア**: Triggerがクリア用Lambda関数を実行し、既存データを削除
3. **データ投入**: Seederが新しいデータを投入

この順序により、デプロイごとに常に同じクリーンなデータ状態を保証します。

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
import { Trigger } from 'aws-cdk-lib/triggers';

// テスト環境のみ初期データを投入
if (environment === 'test' || environment === 'local') {
  // 1. データクリア用のLambda関数を作成
  const clearDataFunction = new NodejsFunction(this, 'ClearTableData', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'handler',
    entry: path.join(__dirname, '../lambda/clear-table-data.ts'),
    environment: {
      TABLE_NAME: this.clockTable.tableName,
    },
    timeout: cdk.Duration.minutes(5),
  });

  this.clockTable.grantReadWriteData(clearDataFunction);

  // 2. トリガー: デプロイ時にデータをクリア
  const clearTrigger = new Trigger(this, 'ClearTableTrigger', {
    handler: clearDataFunction,
    executeAfter: [this.clockTable],
  });

  // 3. シーダー: データクリア後にデータを投入
  const seeder = new DynamoDBSeeder(this, 'ClockTableSeeder', {
    table: this.clockTable,
    seeds: Seeds.fromJsonFile(
      path.join(__dirname, '../seeds/clock-records.json'),
    ),
  });

  // 4. 依存関係を設定してクリア後に投入
  seeder.node.addDependency(clearTrigger);
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

再デプロイ時には自動的に既存データがクリアされ、新しいデータが投入されます。

## データクリアの仕組み

### clear-table-data.ts

デプロイ時に実行されるLambda関数で、以下の処理を行います：

1. テーブルの全アイテムをスキャン
2. 最大25件ずつバッチ削除
3. ページネーション対応で全データを削除

```typescript
// テーブルの全データを削除
const scanCommand = new ScanCommand({
  TableName: tableName,
  ProjectionExpression: 'userId, #ts',
  ExpressionAttributeNames: { '#ts': 'timestamp' },
});

// バッチ削除（最大25件ずつ）
const batchWriteCommand = new BatchWriteCommand({
  RequestItems: {
    [tableName]: deleteRequests,
  },
});
```

### タイミング制御

CDKの依存関係により、以下の順序が保証されます：

1. テーブル作成完了
2. クリアTrigger実行（既存データ削除）
3. Seeder実行（新データ投入）

`seeder.node.addDependency(clearTrigger)`により、クリアが完了してからシードが実行されます。

## 以前のアプローチとの比較

### 以前の実装（apps/backend/seeds/seed.ts）
- ✅ 独立して実行可能
- ✅ 冪等性チェック
- ❌ CDKとは別のツール
- ❌ 手動実行が必要

### 新しい実装（CDK Seeder + Trigger）
- ✅ CDKデプロイと統合
- ✅ Infrastructure as Code
- ✅ 自動実行
- ✅ データクリア機能（常にクリーンな状態）
- ✅ 依存関係による実行順序保証
- ❌ デプロイごとに実行（ただしテスト環境のみ）

## 制約事項

- シードデータのサイズ制限: S3経由で実行されるため、実質的な制限なし
- LocalStackでの制約: Lambda関数の実行環境に依存
- タイムアウト: デフォルト15分（設定可能）

## 参考

- [@cloudcomponents/cdk-dynamodb-seeder](https://www.npmjs.com/package/@cloudcomponents/cdk-dynamodb-seeder)
- [GitHub Repository](https://github.com/cloudcomponents/cdk-constructs)
