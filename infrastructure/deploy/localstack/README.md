# LocalStack Development Environment

LocalStackを使用したローカル開発環境のセットアップと使用方法について説明します。

## 前提条件

- Docker
- Docker Compose
- Node.js 24以上

## 基本的な使い方

利用可能なコマンドは[package.json](../package.json)の`scripts`セクションを参照してください。

主なコマンド:
- `localstack:start` - LocalStackの起動
- `localstack:stop` - LocalStackの停止
- `localstack:logs` - LocalStackのログ表示
- `cdklocal:bootstrap` - CDK Bootstrap
- `cdklocal:deploy` - スタックのデプロイ
- `cdklocal:synth` - CloudFormationテンプレート生成
- `cdklocal:destroy` - スタックの削除

## AWS CLIでの操作

LocalStack環境では`awslocal`コマンドを使用します：

```bash
awslocal dynamodb list-tables --region ap-northeast-1
```

## 関連リソース

- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Local (cdklocal)](https://github.com/localstack/aws-cdk-local)
