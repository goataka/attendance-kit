# LocalStack Agent Skill

このagent skillはLocalStackを使ったローカル開発環境のセットアップと管理を行います。

## 機能

- LocalStackコンテナの起動と停止
- DynamoDBテーブルの自動作成
- ヘルスチェックと検証

## 使用方法

### LocalStackの起動

```bash
docker-compose up -d
```

### ヘルスチェック待機

```bash
timeout 30 bash -c 'until docker ps | grep localstack | grep -q healthy; do sleep 1; done' || \
timeout 30 bash -c 'until curl -s http://localhost:4566/_localstack/health | grep -q "running"; do sleep 1; done'
```

### DynamoDBテーブルの作成

```bash
npm run dynamodb:setup
```

### 検証

```bash
docker ps | grep localstack
aws dynamodb list-tables --endpoint-url http://localhost:4566 --region us-east-1 --no-sign-request
```

### クリーンアップ

```bash
docker-compose down
```

## 環境変数

- `AWS_ENDPOINT_URL`: LocalStackエンドポイント（デフォルト: http://localhost:4566）
- `AWS_REGION`: AWSリージョン（デフォルト: us-east-1）
- `AWS_ACCESS_KEY_ID`: ダミーキー（LocalStackではtest固定）
- `AWS_SECRET_ACCESS_KEY`: ダミーキー（LocalStackではtest固定）

## 注意事項

- LocalStackはDocker環境が必要です
- ビルド時間を短縮するため、必要な時だけ起動してください
- CI環境では自動的にクリーンアップされます
