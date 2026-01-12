# Pre-merge CDK Validation Workflow

このワークフローの実装は `infrastructure/deploy/.github/workflows/` ディレクトリで管理されています。

## 実装場所

- **ワークフロー定義**: このファイル（`.github/workflows/premerge-cdk.yml`）
- **検証スクリプト**: `infrastructure/deploy/scripts/validate-cdk-localstack.sh`
- **詳細ドキュメント**: [`infrastructure/deploy/.github/workflows/premerge-cdk.md`](../../infrastructure/deploy/.github/workflows/premerge-cdk.md)
- **ワークフローREADME**: [`infrastructure/deploy/.github/workflows/README.md`](../../infrastructure/deploy/.github/workflows/README.md)

## 概要

Pull RequestでCDK関連ファイルに変更があった場合に自動実行され、LocalStackを使用してCDKスタックの検証を行います。

## 検証内容

- TypeScriptビルド
- ユニットテスト
- LocalStackへのCDKデプロイ
- DynamoDB統合テスト

詳細は上記の実装場所のドキュメントを参照してください。
