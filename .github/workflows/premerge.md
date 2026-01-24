# Premerge Checks ワークフロー

## 概要

Pull Requestに対して自動的に実行される統合テストとチェックのワークフロー。コードの品質と動作を保証します。

## トリガー

- **イベント**: `pull_request`（`main`ブランチへのPR）
- **監視対象パス**:
  - `apps/**`
  - `infrastructure/**`
  - `package.json`
  - `.github/workflows/premerge.yml`

## 並行実行制御

同じPRで新しいコミットがプッシュされた場合、実行中のワークフローは自動的にキャンセルされ、新しいワークフローが開始されます。

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

これにより、以下の利点があります：
- 不要なワークフロー実行をキャンセルし、リソースを節約
- 最新のコミットに対するフィードバックを迅速に取得
- GitHubのワークフロー実行キューを効率的に管理

## ジョブ構成

### 1. unit-test

基本的なコード品質チェックとユニットテスト。

- Lint実行
- ビルド確認
- ユニットテスト実行
- 自動生成ファイル（スナップショット、OpenAPI仕様）の更新とコミット

### 2. backend-integration-test

バックエンドの統合テスト。`unit-test`完了後に実行。

- LocalStackを使用したAWS環境のシミュレーション
- DynamoDBテーブルのデプロイ
- バックエンドAPIの統合テスト実行

### 3. deploy-integration-test

CDKデプロイの統合テスト。`unit-test`完了後に実行。

- LocalStackへの全スタックデプロイ
- インフラストラクチャコードの検証

### 4. frontend-integration-test

フロントエンドの統合テスト。`unit-test`完了後に実行。

- Playwrightを使用したE2Eテスト
- ブラウザ自動化テスト

## 権限

- `contents: write` - 自動生成ファイルのコミットに必要
- `pull-requests: write` - PRコメントに必要

## エラーハンドリング

各ジョブは失敗時に自動的にPRにコメントを投稿し、失敗の詳細を通知します。
