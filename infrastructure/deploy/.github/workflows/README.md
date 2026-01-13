# Infrastructure Deploy Workflows

このディレクトリには、CDKインフラストラクチャのデプロイとテストに関連するGitHub Actionsワークフローが含まれています。

## ワークフロー一覧

### [Pre-merge CDK Validation](./premerge-cdk.yml)
LocalStackを使用してCDKスタックの検証を行います。

### [Update CDK Snapshots](./update-cdk-snapshots.yml)
CDKスナップショットを自動更新します。

## 関連ドキュメント

- [スクリプトREADME](../../scripts/README.md)
- [LocalStack使用方法](../../LOCALSTACK.md)
- [インフラストラクチャREADME](../../README.md)
- [ルートワークフローREADME](../../../../.github/workflows/README.md)
