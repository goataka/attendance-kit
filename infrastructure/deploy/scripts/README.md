# Infrastructure Deploy Scripts

このディレクトリには、CDKインフラストラクチャのビルド、テスト、デプロイに関連するスクリプトが含まれています。

## スクリプト一覧

- [run-unit-tests.sh](./run-unit-tests.md) - 依存関係のインストール、ビルド、ユニットテスト実行
- [run-integration-tests.sh](./run-integration-tests.md) - LocalStackを使用したCDK検証
- [deploy-dynamodb-localstack.sh](#deploy-dynamodb-localstacksh) - DynamoDB StackのLocalStackへのデプロイ

### deploy-dynamodb-localstack.sh

LocalStackにDynamoDB Stackのみをデプロイする共通スクリプトです。

**使用方法:**
```bash
./infrastructure/deploy/scripts/deploy-dynamodb-localstack.sh <repo_root>
```

**引数:**
- `repo_root`: リポジトリのルートディレクトリパス

**処理内容:**
1. CDK Bootstrap実行
2. DynamoDB StackのSynth実行
3. DynamoDB StackのDeploy実行

## 共通スクリプト

以下のスクリプトは `scripts/` ディレクトリに配置されており、複数のワークフローから共有されます:

- `scripts/start-localstack.sh` - LocalStackの起動と準備完了待機
- `scripts/stop-localstack.sh` - LocalStackの停止

## 注意事項

- すべてのスクリプトは実行可能にする必要があります（`chmod +x scripts/*.sh`）
- スクリプトは `infrastructure/deploy` ディレクトリで実行されることを前提としています
- エラー発生時は即座に停止します（`set -euo pipefail`）
