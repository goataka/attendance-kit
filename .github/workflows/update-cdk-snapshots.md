# Update CDK Snapshots ワークフロー

このワークフローの実装は `infrastructure/deploy/.github/workflows/` ディレクトリで管理されています。

## 実装場所

- **ワークフロー定義**: このファイル（`.github/workflows/update-cdk-snapshots.yml`）
- **詳細ドキュメント**: [`infrastructure/deploy/.github/workflows/update-cdk-snapshots.md`](../../infrastructure/deploy/.github/workflows/update-cdk-snapshots.md)
- **ワークフローREADME**: [`infrastructure/deploy/.github/workflows/README.md`](../../infrastructure/deploy/.github/workflows/README.md)

## 概要

CDK関連ファイルが変更されたPull Requestに対して、自動的にスナップショットを更新するワークフローです。

## 動作

1. CDK関連ファイルの変更を検知
2. スナップショットを自動更新
3. 変更があればコミット・プッシュ
4. PRにコメント投稿

詳細は上記の実装場所のドキュメントを参照してください。
