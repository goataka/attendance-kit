# 初期データ投入ツール

開発・テスト環境用のサンプルデータを投入するツールです。

## 概要

このツールは以下のデータを投入します:

- **ユーザーデータ**: 参考情報として表示（現状AuthServiceに直接定義）
- **打刻レコード**: DynamoDBに実際に投入

## データファイル

| ファイル | 説明 |
|---------|------|
| `data/users.json` | ユーザー情報（userId, name, email, department） |
| `data/clock-records.json` | 打刻レコードのサンプルデータ |

## 使い方

### LocalStack環境（開発・テスト）

```bash
# LocalStackを起動
docker compose up -d localstack

# DynamoDBテーブルをデプロイ
cd infrastructure/deploy
npm run deploy:local-db

# シードデータを投入
cd ../../apps/backend
npm run seed:local
```

### 強制上書き

既存データがある場合でも強制的に投入する:

```bash
npm run seed:local -- --force
```

## 環境変数

| 変数 | 説明 | デフォルト値 |
|------|------|-------------|
| `DYNAMODB_TABLE_NAME` | DynamoDBテーブル名 | `attendance-kit-dev-clock` |
| `DYNAMODB_ENDPOINT` | DynamoDBエンドポイント（LocalStack用） | なし |
| `AWS_REGION` | AWSリージョン | `ap-northeast-1` |

## データ形式

### users.json

```json
[
  {
    "userId": "user001",
    "name": "山田太郎",
    "email": "yamada@example.com",
    "department": "開発部"
  }
]
```

### clock-records.json

```json
[
  {
    "userId": "user001",
    "type": "clock-in",
    "location": "東京オフィス",
    "deviceId": "device-001",
    "daysAgo": 1,
    "hour": 9,
    "minute": 0
  }
]
```

- `daysAgo`: 現在から何日前のデータか
- `hour`, `minute`: 打刻時刻

## 注意事項

- **本番環境では実行しない**: このツールは開発・テスト環境専用です
- **冪等性**: 既存データがある場合はスキップされます（`--force`オプションで上書き可能）
- **ユーザー認証**: 現状、ユーザー認証はAuthServiceに直接定義されています（`validUsers`リスト）

## トラブルシューティング

### テーブルが見つからない

```
Error: ResourceNotFoundException
```

→ DynamoDBテーブルがデプロイされていることを確認してください:

```bash
cd infrastructure/deploy
npm run deploy:local-db
```

### LocalStackに接続できない

```
Error: connect ECONNREFUSED
```

→ LocalStackが起動していることを確認してください:

```bash
docker compose ps
docker compose up -d localstack
```
