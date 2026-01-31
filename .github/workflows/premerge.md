# Premerge Checks ワークフロー

## 概要

Pull Requestに対して実行される統合テストとコード品質チェック

## トリガー

`main`ブランチへのPR作成・更新時

**実行条件**:
- mdファイルのみの変更の場合、テストジョブはスキップされる
- mdファイル以外が含まれる変更の場合、すべてのテストジョブが実行される

## ジョブ

| ジョブ | 説明 | 最適化 |
|-------|------|--------|
| check-changes | `dorny/paths-filter`を使用して変更ファイルをチェックし、テスト実行の要否を判定 | - |
| unit-test | Lint、ビルド、ユニットテスト | ビルド成果物をアーティファクトとして保存 |
| backend-integration-test | バックエンド統合テスト | ビルド成果物を再利用 |
| deploy-integration-test | CDKデプロイテスト | ビルド成果物を再利用 |
| frontend-integration-test | フロントエンドE2Eテスト | Playwrightブラウザをキャッシュ |
| e2e-test | エンドツーエンドテスト | Playwrightブラウザをキャッシュ、ビルド成果物を再利用 |

## パフォーマンス最適化

### ビルドアーティファクトの共有

`unit-test`ジョブでビルドを1回実行し、成果物を保存。他のジョブはこれを再利用することで、ビルド時間を削減（約30秒削減）。

### Playwrightブラウザのキャッシュ

`frontend-integration-test`と`e2e-test`でPlaywrightブラウザをキャッシュ。2回目以降の実行時間を大幅に削減（約46秒削減）。

### ジョブ依存関係

LocalStackを使用するジョブは`unit-test`完了後に実行され、早期にビルドエラーを検出可能。
