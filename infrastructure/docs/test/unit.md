# AWS CDK ユニットテスト

## 目的

インフラコードが組織の規約とベストプラクティスに準拠していることを保証

## テスト内容

### セキュリティ設定の検証
- S3バケットの暗号化設定
- DynamoDBテーブルのポイントインタイムリカバリ設定
- IAMロールの最小権限原則の適用

### 必須タグの付与確認
- Environment、Project、Ownerなどの必須タグ

### スタック分割の妥当性
- 論理的な責任範囲に基づくスタック分割
- 循環依存の回避

## 使用ツール

**Jest**
- AWS CDK Assertionsライブラリを使用
- スナップショットテストで構成変更を追跡

## 実行タイミング

- 開発中（ファイル保存時）
- プルリクエスト作成時（GitHub Actions）

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd infrastructure
npm run test:unit
```

## 実装例

```typescript
// infrastructure/test/unit/stack.test.ts
import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';

describe('Stack Security Tests', () => {
  test('S3 buckets should have encryption enabled', () => {
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256'
          }
        }]
      }
    });
  });

  test('DynamoDB tables should have point-in-time recovery enabled', () => {
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
  });

  test('All resources should have required tags', () => {
    const template = Template.fromStack(stack);
    const resources = template.findResources('*');
    
    Object.values(resources).forEach(resource => {
      expect(resource.Properties.Tags).toBeDefined();
      const tags = resource.Properties.Tags;
      expect(tags).toContainEqual({ Key: 'Environment', Value: expect.any(String) });
      expect(tags).toContainEqual({ Key: 'Project', Value: 'attendance-kit' });
    });
  });
});
```

## テストカバレッジ目標

80%以上
