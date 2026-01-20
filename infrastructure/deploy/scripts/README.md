# Infrastructure Deploy Scripts

このディレクトリには、CDKインフラストラクチャのビルド、テスト、デプロイに関連するスクリプトが含まれています。

## スクリプト一覧

- [run-unit-tests.sh](./run-unit-tests.md) - 依存関係のインストール、ビルド、ユニットテスト実行
- [run-integration-tests.sh](./run-integration-tests.md) - LocalStackを使用したCDK検証

## 注意事項

- すべてのスクリプトは実行可能にする必要があります
- エラー発生時は即座に停止します（`set -euo pipefail`）
