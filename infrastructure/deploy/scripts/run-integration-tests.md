# run-integration-tests.sh

LocalStackを使用したCDK統合テストを実行するスクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー

## 実行内容

1. 依存関係のインストール
2. CDK toolsのグローバルインストール
3. LocalStackの起動と待機（npm scriptsを使用）
4. DynamoDB Stackのデプロイ
5. クリーンアップ（trap機能によるLocalStack停止）

## LocalStack管理

詳細は[LocalStack README](../localstack/README.md)を参照してください。

## 実行方法

詳細は[スクリプトファイル](./run-integration-tests.sh)を参照してください。
