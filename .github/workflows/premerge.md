# Premerge Checks ワークフロー

## 概要

Pull Requestに対して実行される統合テストとコード品質チェック

## トリガー

`main`ブランチへのPR作成・更新時

**実行条件**:
- mdファイルのみの変更の場合、テストジョブはスキップされる
- mdファイル以外が含まれる変更の場合、すべてのテストジョブが実行される

## ジョブ

| ジョブ | 説明 |
|-------|------|
| check-changes | 変更ファイルをチェックし、テスト実行の要否を判定 |
| unit-test | Lint、ビルド、ユニットテスト |
| backend-integration-test | バックエンド統合テスト |
| deploy-integration-test | CDKデプロイテスト |
| frontend-integration-test | フロントエンドE2Eテスト |
| e2e-test | エンドツーエンドテスト |
| premerge-summary | すべてのテストジョブの結果を集約（常に実行） |

**注意**: ブランチ保護ルールでは`premerge-summary`ジョブを必須チェックとして設定してください。このジョブは常に実行され、mdファイルのみの変更時も成功となるため、強制マージが不要になります。
