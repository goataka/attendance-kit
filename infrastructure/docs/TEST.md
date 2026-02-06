# AWS CDK テスト戦略

AWS CDKで構築するインフラストラクチャのテストは、コード品質とデプロイ前の検証を目的とします。

## テスト種類

### ユニットテスト

インフラコードが組織の規約とベストプラクティスに準拠していることを保証します。

**詳細**: [test/unit.md](test/unit.md)

### 統合テスト

CDKコードが実際のAWS環境（LocalStack）で正しく動作することを検証します。

**詳細**: [test/integration.md](test/integration.md)

## テスト実行方法

```bash
# ユニットテスト
cd infrastructure
npm run test:unit

# 統合テスト（LocalStack使用）
npm run test:integration

# 全テスト実行
npm test
```

## テストカバレッジ目標

| テスト種類     | カバレッジ目標 |
| -------------- | -------------- |
| ユニットテスト | 80%以上        |
| 統合テスト     | -              |

## 使用ツール

- **Jest**: テストフレームワーク
- **AWS CDK Assertions**: CDK専用アサーションライブラリ
- **cdklocal**: LocalStack環境でのCDK実行
- **LocalStack**: ローカルAWS環境エミュレーター

## 参考資料

- [AWS CDK Testing Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/testing.html)
- [Jest公式ドキュメント](https://jestjs.io/)
- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
