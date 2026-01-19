# run-integration-tests.sh

LocalStackを使用したCDK統合テストを実行するスクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー

## 実行内容

1. LocalStackの起動（共通スクリプト `scripts/start-localstack.sh` を使用）
2. 依存関係のインストール (`npm ci`)
3. CDK toolsのグローバルインストール
4. DynamoDB Stackのデプロイ（共通スクリプト `deploy-dynamodb-localstack.sh` を使用）
5. クリーンアップ（trap機能による確実なLocalStack停止、共通スクリプト `scripts/stop-localstack.sh` を使用）

## 共通スクリプトの利用

このスクリプトは以下の共通スクリプトを呼び出します:

- `scripts/start-localstack.sh` - LocalStackの起動と準備完了待機
- `scripts/stop-localstack.sh` - LocalStackの停止（クリーンアップ）
- `infrastructure/deploy/scripts/deploy-dynamodb-localstack.sh` - DynamoDB Stackのデプロイ

これにより、他のワークフロー（`scripts/run-integration-tests.sh`など）と同じLocalStack管理ロジックを共有します。

## 実行方法

詳細は[スクリプトファイル](./run-integration-tests.sh)を参照してください。
