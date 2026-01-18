# NestJS テスト戦略

NestJSバックエンドは、ビジネスロジックとデータアクセス層のテストを重視します。

## テスト種類

### ユニットテスト

ビジネスロジックの正確性とエラーハンドリングを検証します。

**詳細**: [test/unit.md](test/unit.md)

### 統合テスト

データベース操作とAPIエンドポイントの統合的な動作を検証します。

**詳細**: [test/integration.md](test/integration.md)

## テスト実行方法

```bash
# ユニットテスト
cd apps/backend
npm run test:unit

# 統合テスト
npm run test:integration

# カバレッジ付き
npm run test:unit -- --coverage
```

## テストカバレッジ目標

| テスト種類 | カバレッジ目標 |
|-----------|--------------|
| ユニットテスト | 80%以上 |
| 統合テスト | 70%以上 |

## 使用ツール

- **Jest**: テストフレームワーク
- **Supertest**: HTTPリクエストテスト
- **NestJS Testing Module**: DIコンテナとモジュールのテスト
- **LocalStack**: ローカルDynamoDB環境

## 参考資料

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest公式ドキュメント](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
