# E2Eテスト

フロントエンドとバックエンドの統合テスト

## 構成

- Feature files: `test/e2e/features/*.feature` (Gherkin形式)
- Step definitions: `test/e2e/steps/*.ts` (Playwright)
- Configuration: `test/e2e/cucumber.js`

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
