# AWS CDK 統合テスト

## 目的

CDKコードが実際のAWS環境で正しく動作することを検証

## テスト内容

### cdklocalを使用したローカルでのリソース作成
- DynamoDB、S3、Lambda等のリソース作成成功を確認

### 循環参照や依存関係エラーの検知
- スタック間の依存関係が正しく解決されることを確認

### パラメータとシークレットの同期確認
- Systems ManagerパラメータストアやSecrets Managerとの連携

## 使用ツール

**Jest + cdklocal**
- LocalStackを利用したローカルAWS環境
- CDK Bootstrap、Synth、Deployの一連の流れを検証

## 実行タイミング

- プルリクエスト作成時（GitHub Actions）
- 定期的な統合テスト実行

## 接続先

LocalStack

## 実行方法

```bash
cd infrastructure
npm run test:integration
```

## 実装例

```typescript
// infrastructure/test/integration/stack.integration.test.ts
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

describe('CDK Stack Integration Test', () => {
  let cfnClient: CloudFormationClient;
  let dynamoClient: DynamoDBClient;

  beforeAll(() => {
    cfnClient = new CloudFormationClient({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1'
    });
    
    dynamoClient = new DynamoDBClient({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1'
    });
  });

  test('should deploy stack to LocalStack', async () => {
    const command = new DescribeStacksCommand({
      StackName: 'AttendanceKitStack'
    });
    
    const response = await cfnClient.send(command);
    expect(response.Stacks).toHaveLength(1);
    expect(response.Stacks[0].StackStatus).toBe('CREATE_COMPLETE');
  });

  test('should create DynamoDB tables', async () => {
    const command = new ListTablesCommand({});
    const response = await dynamoClient.send(command);
    
    expect(response.TableNames).toContain('AttendanceTable');
    expect(response.TableNames).toContain('UserTable');
  });

  test('should have no circular dependencies', async () => {
    const command = new DescribeStacksCommand({});
    const response = await cfnClient.send(command);
    
    const stacks = response.Stacks || [];
    stacks.forEach(stack => {
      expect(stack.StackStatus).not.toContain('FAILED');
      expect(stack.StackStatusReason).not.toContain('circular dependency');
    });
  });
});
```

## LocalStack環境構築

```bash
# LocalStackコンテナの起動
docker run -d \
  --name localstack \
  -p 4566:4566 \
  -e SERVICES=cloudformation,dynamodb,s3,lambda \
  localstack/localstack

# 起動確認
curl http://localhost:4566/_localstack/health

# CDK Bootstrap
cdklocal bootstrap

# CDK Deploy
cdklocal deploy --all
```

## トラブルシューティング

### LocalStackが起動しない

```bash
# Dockerコンテナの確認
docker ps -a

# LocalStackログの確認
docker logs localstack

# LocalStackの再起動
docker restart localstack
```

### デプロイがタイムアウトする

Jest設定でタイムアウト時間を延長：

```typescript
// jest.config.js
module.exports = {
  testTimeout: 60000, // 60秒
};
```
