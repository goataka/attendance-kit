# Premerge Checks ワークフロー

## 概要

Pull Requestに対して実行される統合テストとコード品質チェック

## トリガー

`main`ブランチへのPR作成・更新時

**監視対象**:
- `apps/**`
- `infrastructure/**`
- `package.json`
- `.github/workflows/premerge.yml`

## ジョブ

| ジョブ | 説明 |
|-------|------|
| unit-test | Lint、ビルド、ユニットテスト |
| backend-integration-test | バックエンド統合テスト |
| deploy-integration-test | CDKデプロイテスト |
| frontend-integration-test | フロントエンドE2Eテスト |
