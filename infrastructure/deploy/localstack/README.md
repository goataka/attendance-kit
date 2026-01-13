# LocalStack Development Environment

LocalStackを使用したローカル開発環境のセットアップと使用方法について説明します。

## 前提条件

- Docker
- Docker Compose
- Node.js 20以上

## セットアップ

```bash
cd infrastructure/deploy
npm install
npm run localstack:start
```

## CDKのデプロイ

```bash
npm run build
npm run localstack:deploy
```

## AWS CLIでの操作

LocalStack環境では`awslocal`を使用します：

```bash
# テーブル一覧を取得
awslocal dynamodb list-tables --region ap-northeast-1
```

通常のAWS CLIを使用する場合は、エンドポイントURLを明示的に指定してください：

```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1
```

## スタックの削除

```bash
npm run localstack:destroy
```

## LocalStackの停止

```bash
npm run localstack:stop
```

## トラブルシューティング

### LocalStackが起動しない

```bash
# Dockerが動作しているか確認
docker ps

# ポート4566が使用中でないか確認
lsof -i :4566

# LocalStackのログを確認
npm run localstack:logs
```

## 関連リソース

- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Local (cdklocal)](https://github.com/localstack/aws-cdk-local)
