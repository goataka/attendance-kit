# E2Eテスト

フロントエンドとバックエンドの統合テストをGherkin形式で記述。

## 構成

- **Feature files**: `test/e2e/features/*.feature` - Gherkin形式のテストシナリオ
- **Step definitions**: `test/e2e/steps/*.ts` - Playwrightを使用したステップ実装
- **Configuration**: `test/e2e/cucumber.js` - Cucumberの設定

## 前提条件

以下が起動している必要があります:

1. **LocalStack**: DynamoDBテーブル
2. **Backend server**: `http://localhost:3000`
3. **Frontend server**: `http://localhost:5173`

## テスト実行方法

### 1. LocalStackの起動

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
```

### 2. DynamoDBテーブルのデプロイ

```bash
cd infrastructure/deploy
npm run deploy:local-db
```

### 3. バックエンドサーバーの起動

```bash
cd apps/backend
npm run dev
```

### 4. フロントエンドサーバーの起動

```bash
cd apps/frontend
npm run dev
```

### 5. E2Eテストの実行

```bash
# ルートディレクトリから
npm run test:e2e
```

## テストシナリオ

### Frontend and Backend Integration

- フロントエンドからバックエンドAPIへの接続確認
- Clock-in操作のエンドツーエンドテスト

## 環境変数

- `FRONTEND_URL`: フロントエンドのURL（デフォルト: `http://localhost:5173`）
- `BACKEND_URL`: バックエンドのURL（デフォルト: `http://localhost:3000`）

## 注意事項

- 現在は基本的な接続確認のみ実装
- 認証機能とClock-in機能の実装は今後追加予定
- LocalStack Community版では一部機能に制限あり
