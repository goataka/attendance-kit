# run-integration-tests.sh

LocalStackを使用したCDK統合テストを実行するスクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー

## 実行内容

1. LocalStackコンテナの起動
2. LocalStackの起動待機とヘルスチェック
3. CDK Bootstrap/Synth/Deploy
4. DynamoDB統合テスト実行
5. クリーンアップ（trap機能による確実なLocalStack停止）

## 実行方法

詳細は[スクリプトファイル](./run-integration-tests.sh)を参照してください。
