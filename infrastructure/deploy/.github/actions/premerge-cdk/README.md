# Pre-merge CDK Validation

Pull RequestでCDK関連ファイルに変更があった場合に自動実行され、LocalStackを使用してCDKスタックの検証を行うコンポジットアクションです。

## 目的

マージ前にCDKの変更が正しく動作することを検証し、本番環境へのデプロイ前に問題を早期発見します。

## 検証内容

1. ユニットテストの実行
2. LocalStackでのCDK検証
3. DynamoDB統合テストの実行

詳細な実行ステップは以下のスクリプトを参照してください：
- [run-unit-tests.sh](../../scripts/run-unit-tests.sh)
- [run-integration-tests.sh](../../scripts/run-integration-tests.sh)

## ローカルでの実行

利用可能なコマンドは[package.json](../../package.json)を参照してください。

## 関連ドキュメント

- [LocalStack環境](../../localstack/README.md)
- [スクリプト](../../scripts/README.md)
