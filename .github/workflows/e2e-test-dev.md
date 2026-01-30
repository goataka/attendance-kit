# Dev環境E2Eテストワークフロー

Dev環境にデプロイされたアプリケーションに対してE2Eテストを実行します。

## 概要

このワークフローは、`Deploy Environment Stack to AWS` ワークフローが正常に完了した後、自動的にトリガーされます。デプロイされたCloudFrontとAPI Gatewayに対して、実際のユーザー操作をシミュレートしたE2Eテストを実行します。

## トリガー条件

- **自動実行**: `Deploy Environment Stack to AWS` ワークフローが成功した後
- **手動実行**: `workflow_dispatch` でGitHub UIから手動で実行可能

## 実行環境

- **Environment**: `dev`
- **AWS認証**: OIDC経由でAWS認証情報を取得
- **テストフレームワーク**: Cucumber + Playwright

## 処理フロー

### 1. セットアップ

| ステップ | 説明 |
|---------|------|
| Checkout | コードをチェックアウト |
| Setup Node.js | Node.js 24をセットアップ |
| Install dependencies | 依存関係をインストール |
| Install Playwright | Playwrightブラウザをインストール |

### 2. AWS接続とエンドポイント取得

CloudFormation Stackのoutputsから以下の情報を取得:

- `CloudFrontUrl`: フロントエンドのURL
- `ApiUrl`: バックエンドAPIのURL
- `TableName`: DynamoDBテーブル名

### 3. E2Eテスト実行

取得したエンドポイントに対してE2Eテストを実行:

| 環境変数 | 説明 |
|---------|------|
| `E2E_ENV` | `deployed` を設定（ローカル環境との区別） |
| `FRONTEND_URL` | CloudFront URL |
| `BACKEND_URL` | API Gateway URL |
| `DYNAMODB_TABLE_NAME` | テーブル名 |
| `AWS_REGION` | `ap-northeast-1` |

### 4. レポート生成とアップロード

- テスト結果をArtifactsにアップロード
- Cucumber HTMLレポートを生成
- コミットにテスト結果をコメント

## テスト内容

既存のE2Eテストシナリオを実行:

- 出勤打刻のエンドツーエンドテスト
- 退勤打刻のエンドツーエンドテスト
- 打刻一覧の確認

## エラー対処

テストが失敗した場合:

1. **Artifactsを確認**
   - `e2e-dev-test-reports` をダウンロード
   - `cucumber-report.html` で詳細を確認

2. **よくある原因**
   - デプロイ直後でサービスが完全に起動していない
   - CloudFrontキャッシュの影響
   - DynamoDBへのアクセス権限の問題

3. **再実行**
   - GitHub UIからworkflow_dispatchで手動再実行可能

## ローカル環境テストとの違い

| 項目 | ローカル環境 | Dev環境 |
|------|------------|---------|
| 環境変数 | `E2E_ENV` 未設定 | `E2E_ENV=deployed` |
| Frontend | `http://localhost:5173` | CloudFront URL |
| Backend | `http://localhost:3000` | API Gateway URL |
| DynamoDB | LocalStack経由 | AWS DynamoDB |
| 認証 | ダミー認証情報 | OIDC認証 |

## 関連ファイル

- テスト実装: `test/e2e/`
- 環境変数設定: `test/e2e/steps/services.helper.ts`
- Cucumber設定: `test/e2e/cucumber.js`
- Playwright設定: `playwright.config.e2e.ts`
