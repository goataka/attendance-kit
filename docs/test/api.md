# System APIテスト

## 目的

APIエンドポイントの疎通と権限設定の検証

## テスト内容

### エンドポイントの疎通（HTTP 200）

- 全APIエンドポイントのヘルスチェック
- レスポンスタイムの測定

### IAMロール/ポリシーの権限不足確認

- 認証が必要なエンドポイントのアクセス制御
- 権限エラー（403 Forbidden）の適切な処理

### CORS設定の妥当性

- クロスオリジンリクエストの許可
- 許可されたオリジンとメソッドの確認

## 使用ツール

**Playwright（Request Context）**

- APIリクエストの直接実行
- レスポンスの検証

## 実行タイミング

- デプロイ前（LocalStack環境）
- デプロイ後（AWS環境）

## 接続先

Local / AWS

## 実行方法

```bash
# APIテスト
npm run test:api

# 特定のテストファイル実行
npx playwright test tests/api/attendance.api.test.ts
```
