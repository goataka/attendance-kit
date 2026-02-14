# E2Eテスト

フロントエンドとバックエンドの統合テスト

## 構成

- Feature files: `test/e2e/features/*.feature` (Gherkin形式)
- Step definitions: `test/e2e/steps/*.ts` (Playwright)
- Page objects: `test/e2e/page-objects/*.ts` (ページオブジェクトパターン)
- Helpers: `test/e2e/helpers/*.ts` (ヘルパー関数)
- Configuration: `test/e2e/cucumber.js`

## ページオブジェクトパターン

E2Eテストでは、ページオブジェクトパターンを使用してページ操作のロジックを抽象化しています。

### ページオブジェクトの配置

- **Cucumber E2E用**: `test/e2e/page-objects/`
- **Playwright E2E用**: 各コンポーネントの`page-objects/`ディレクトリ
  - `apps/frontend/src/ClockInOutPage/page-objects/`
  - `apps/frontend/src/ClocksListPage/page-objects/`

### 利用可能なページオブジェクト

#### ClockInOutPage

打刻画面のページオブジェクト

主な機能:

- `fillLoginCredentials(userId, password)`: ログイン情報の入力
- `clickClockIn()`: 出勤ボタンのクリック
- `clickClockOut()`: 退勤ボタンのクリック
- `expectSuccessMessage(text?)`: 成功メッセージの検証
- `expectErrorMessage(text?)`: エラーメッセージの検証
- `waitForAnimations()`: アニメーション完了を待機
- `loginAndClockIn(userId, password)`: ログインして出勤を打刻（統合アクション）
- `loginAndClockOut(userId, password)`: ログインして退勤を打刻（統合アクション）

#### ClocksListPage

打刻一覧画面のページオブジェクト

主な機能:

- `fillFilterUserId(userId)`: ユーザーIDフィルターの入力
- `selectFilterType(type)`: タイプフィルターの選択
- `clickSearch()`: 検索ボタンのクリック
- `clickReset()`: リセットボタンのクリック
- `expectTableToBeVisible()`: テーブル表示の検証
- `waitForAnimations()`: アニメーション完了を待機
- `filterByUserId(userId)`: ユーザーIDでフィルター（統合アクション）

### ヘルパー関数

データ検証などの共通処理は`test/e2e/helpers/`に配置しています。

- `verifyRecordInDynamoDB(client, table, userId)`: DynamoDBレコードの検証

## テスト実行環境

E2Eテストは実際のAWS環境にデプロイされたアプリケーションに対して実行されます:

- **PR環境**: PR作成時に自動的にデプロイされた環境（`pr-123`形式）
- **Eva環境**: mainブランチマージ後の開発環境

## 環境変数

E2Eテストは以下の環境変数を使用します:

- `E2E_ENV`: テスト環境タイプ（`deployed` または未設定）
- `FRONTEND_URL`: フロントエンドのURL（CloudFront URL）
- `BACKEND_URL`: バックエンドAPIのURL（API Gateway URL）
- `NODE_ENV`: 環境名（`pr-123`、`eva`など）
- `AWS_REGION`: AWSリージョン（デフォルト: `ap-northeast-1`）

## テスト実行

### CI環境でのテスト実行

E2Eテストは以下のワークフローで自動実行されます:

- **PR環境**: `.github/workflows/pr-deploy-and-e2e.yml`
  - PR作成/更新時に自動実行
  - PR専用環境にデプロイしてテスト実行
- **Eva環境**: `.github/workflows/deploy-environment-stack.yml`
  - mainマージ時に自動実行
  - Eva環境に対してテスト実行

### ローカル環境でのテスト実行

ローカルでのE2Eテストは、backend統合テストと同様にLocalStackを使用します:

```bash
# LocalStack起動とDynamoDBテーブルデプロイ
cd infrastructure/deploy && npm run deploy:local-db

# バックエンド起動
cd apps/backend && npm run dev

# フロントエンド起動
cd apps/frontend && npm run dev

# E2Eテスト実行
npm run test:e2e
```

**注意**: ローカル実行はバックエンド開発者の統合テストのみを想定しています。完全なE2EテストはCI環境で実施されます。
