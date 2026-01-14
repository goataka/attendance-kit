# run-integration-tests.sh

LocalStackを使用したCDK検証を実行するスクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー

## 実行内容

1. LocalStackコンテナの起動
2. LocalStackの起動待機とヘルスチェック
3. 環境変数の確認とデバッグ出力
4. CDK Bootstrap
5. CDK Synth
6. CDK Deploy
7. DynamoDB統合テスト実行
8. クリーンアップ（trap機能による確実なLocalStack停止）

## 使用方法

```bash
cd infrastructure/deploy
./scripts/validate-cdk-localstack.sh
```

## 必要な環境変数

- `AWS_ACCESS_KEY_ID`: テスト用ダミー認証情報
- `AWS_SECRET_ACCESS_KEY`: テスト用ダミー認証情報
- `AWS_DEFAULT_REGION`: デプロイ先リージョン
