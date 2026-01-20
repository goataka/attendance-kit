# LocalStack

LocalStackは、AWSサービスをローカル環境でエミュレートするツールです。

## 前提条件

- Docker
- Docker Compose
- Node.js 24以上

## スクリプト

### wait-localstack.sh

LocalStackの起動完了を待機するスクリプトです。DynamoDBサービスが利用可能になるまでポーリングします。

**使用方法:**
```bash
npm run localstack:wait --workspace=attendance-kit-infrastructure
```

## Docker Compose

`docker-compose.yml`を使用してLocalStackコンテナを管理します。

### 起動・停止

```bash
# 起動
npm run localstack:start --workspace=attendance-kit-infrastructure

# 停止
npm run localstack:stop --workspace=attendance-kit-infrastructure

# ログ確認
npm run localstack:logs --workspace=attendance-kit-infrastructure
```

### CDKコマンド

```bash
# Bootstrap
npm run cdklocal:bootstrap --workspace=attendance-kit-infrastructure

# デプロイ
npm run cdklocal:deploy --workspace=attendance-kit-infrastructure

# テンプレート生成
npm run cdklocal:synth --workspace=attendance-kit-infrastructure

# スタック削除
npm run cdklocal:destroy --workspace=attendance-kit-infrastructure
```

## AWS CLIでの操作

LocalStack環境では`awslocal`コマンドを使用します：

```bash
awslocal dynamodb list-tables --region ap-northeast-1
```

## 関連リソース

- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Local (cdklocal)](https://github.com/localstack/aws-cdk-local)
