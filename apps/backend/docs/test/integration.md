# NestJS 統合テスト

## 目的

データベース操作とAPIエンドポイントの統合的な動作を検証

## テスト内容

### DynamoDBへのCRUD操作
- Create、Read、Update、Delete操作の成功確認
- トランザクション処理の検証

### GSI/LSIを利用した検索挙動
- セカンダリインデックスを使用したクエリ
- 複雑な検索条件の動作確認

### AWS SDK v3の型定義整合性
- DynamoDBクライアントの型安全性
- レスポンス形式の検証

## 使用ツール

**Jest + Supertest**
- SupertestでHTTPリクエストをシミュレート
- LocalStackのDynamoDBを使用

## 実行タイミング

- プルリクエスト作成時
- 定期的な統合テスト実行

## 接続先

LocalStack（DynamoDB）

## 実行方法

```bash
cd apps/backend
npm run test:e2e
```

## テストカバレッジ目標

70%以上

