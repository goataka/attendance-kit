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

## 前提条件

以下が起動している必要があります:

1. LocalStack (DynamoDBテーブル)
2. Backend server (`http://localhost:3000`)
3. Frontend server (`http://localhost:5173`)

## テスト実行

```bash
# LocalStack起動
docker run -d --name localstack -p 4566:4566 localstack/localstack

# DynamoDBテーブルデプロイ
cd infrastructure/deploy && npm run deploy:local-db

# バックエンド起動
cd apps/backend && npm run dev

# フロントエンド起動
cd apps/frontend && npm run dev

# E2Eテスト実行
npm run test:e2e
```
