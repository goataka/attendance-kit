# Infrastructure Deploy Scripts

このディレクトリには、CDKインフラストラクチャのビルド、テスト、デプロイに関連するスクリプトが含まれています。

## スクリプト一覧

- [run-unit-tests.sh](./run-unit-tests.md) - 依存関係のインストール、ビルド、ユニットテスト実行
- [run-integration-tests.sh](./run-integration-tests.md) - LocalStackを使用したCDK検証

## DynamoDBデプロイ

DynamoDB StackのLocalStackへのデプロイは `package.json` のスクリプトで実行:

```bash
npm run localstack:deploy --workspace=attendance-kit-infrastructure
```

このコマンドは以下を順次実行:
1. CDK Bootstrap (`localstack:bootstrap`)
2. DynamoDB Stack Synth (`localstack:synth`)
3. DynamoDB Stack Deploy (`deploy-database`)

## 注意事項

- すべてのスクリプトは実行可能にする必要があります
- エラー発生時は即座に停止します（`set -euo pipefail`）
