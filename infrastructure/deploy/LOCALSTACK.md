# LocalStack Development Environment

このドキュメントでは、LocalStackを使用したローカル開発環境のセットアップと使用方法について説明します。

## 概要

LocalStackは、AWSクラウドサービスをローカル環境でエミュレートするツールです。これにより、実際のAWSアカウントを使用せずに、DynamoDBテーブルの作成やアプリケーションの開発・テストが可能になります。

## 前提条件

- Docker
- Docker Compose
- Node.js 20以上
- npm

## セットアップ

### 依存関係のインストール

```bash
cd infrastructure/deploy
npm install
```

### LocalStackの起動

```bash
npm run localstack:start
```

このコマンドは以下を実行します：
- LocalStackコンテナをバックグラウンドで起動
- DynamoDBサービスを有効化
- ポート4566でLocalStack Gatewayを公開

### LocalStackの状態確認

```bash
# ログを確認
npm run localstack:logs

# コンテナの状態を確認
docker compose ps
```

## CDKのデプロイ

### ビルド

```bash
npm run build
```

### CloudFormationテンプレート生成（Synth）

```bash
npm run localstack:synth
```

### LocalStackへのデプロイ

```bash
npm run localstack:deploy
```

このコマンドは以下を実行します：
- CDKスタックをLocalStackにデプロイ
- DynamoDBテーブル `attendance-kit-dev-clock` を作成
- Global Secondary Index `DateIndex` を作成

## LocalStack環境の操作

### AWS CLIでの操作

LocalStack環境に対してAWS CLIコマンドを実行する場合は、エンドポイントURLを指定します：

```bash
# テーブル一覧を取得
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# テーブルの詳細を取得
aws dynamodb describe-table \
  --table-name attendance-kit-dev-clock \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# テーブルにデータを追加
aws dynamodb put-item \
  --table-name attendance-kit-dev-clock \
  --item '{"userId": {"S": "user123"}, "timestamp": {"S": "2026-01-09T10:00:00Z"}, "date": {"S": "2026-01-09"}, "type": {"S": "clock-in"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# データを取得
aws dynamodb get-item \
  --table-name attendance-kit-dev-clock \
  --key '{"userId": {"S": "user123"}, "timestamp": {"S": "2026-01-09T10:00:00Z"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# テーブルをスキャン
aws dynamodb scan \
  --table-name attendance-kit-dev-clock \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1
```

### Node.js / TypeScriptでの接続

アプリケーションコードからLocalStackに接続する場合の例：

```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

// LocalStack環境の場合
const isLocalStack = process.env.USE_LOCALSTACK === 'true';

const client = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: isLocalStack ? 'http://localhost:4566' : undefined,
  credentials: isLocalStack ? {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  } : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);

// データの追加
await docClient.send(new PutCommand({
  TableName: 'attendance-kit-dev-clock',
  Item: {
    userId: 'user123',
    timestamp: '2026-01-09T10:00:00Z',
    date: '2026-01-09',
    type: 'clock-in',
  },
}));

// データの取得
const result = await docClient.send(new GetCommand({
  TableName: 'attendance-kit-dev-clock',
  Key: {
    userId: 'user123',
    timestamp: '2026-01-09T10:00:00Z',
  },
}));
```

## スタックの削除

```bash
npm run localstack:destroy
```

## LocalStackの停止

```bash
npm run localstack:stop
```

## データ永続化

LocalStackは `./localstack-data` ディレクトリにデータを永続化します。この仕組みにより：

- LocalStackコンテナを再起動してもデータが保持される
- デプロイしたリソース（DynamoDBテーブルなど）が維持される

データをクリアしたい場合は、以下のコマンドを実行します：

```bash
# LocalStackを停止
npm run localstack:stop

# データディレクトリを削除
rm -rf localstack-data

# LocalStackを再起動
npm run localstack:start
```

**注意**: このプロジェクトでは Docker Compose v2 (プラグイン形式) を使用しています。コマンドは `docker compose` (ハイフンなし) です。

## トラブルシューティング

### LocalStackが起動しない

```bash
# Dockerが動作しているか確認
docker ps

# ポート4566が使用中でないか確認
lsof -i :4566

# LocalStackのログを確認
docker compose logs localstack
```

### テーブルが作成されない

```bash
# ビルドが完了しているか確認
npm run build

# CloudFormationテンプレートを確認
npm run localstack:synth

# LocalStackのログを確認
npm run localstack:logs
```

### CDKデプロイエラー

```bash
# cdklocalが正しくインストールされているか確認
npx cdklocal --version

# LocalStackが起動しているか確認
docker-compose ps

# 既存のスタックを削除してから再デプロイ
npm run localstack:destroy
npm run localstack:deploy
```

**Docker Composeコマンドについて**:
- Docker Compose v2では `docker compose` (ハイフンなし) を使用します
- v1の `docker-compose` (ハイフンあり) からv2に移行している場合は、npmスクリプト経由で実行することを推奨します

## 環境変数

LocalStack環境で使用される主な環境変数：

| 環境変数 | 値 | 説明 |
|---------|-----|------|
| `AWS_ENDPOINT_URL` | `http://localhost:4566` | LocalStackエンドポイント |
| `AWS_REGION` | `ap-northeast-1` | AWSリージョン |
| `AWS_ACCESS_KEY_ID` | `test` | ダミーアクセスキー |
| `AWS_SECRET_ACCESS_KEY` | `test` | ダミーシークレットキー |

## 本番環境との違い

LocalStack環境と実際のAWS環境では、以下の点が異なります：

### LocalStack環境
- エンドポイント: `http://localhost:4566`
- 認証情報: ダミー値（`test`/`test`）
- コスト: 無料
- データ永続化: ローカルディレクトリ
- パフォーマンス: ローカル環境に依存

### AWS環境
- エンドポイント: AWS公式エンドポイント
- 認証情報: IAMロール/OIDC認証
- コスト: Pay-Per-Request課金
- データ永続化: AWSマネージドストレージ
- パフォーマンス: 99.99%可用性SLA

## 開発ワークフロー

1. **LocalStackを起動**
   ```bash
   npm run localstack:start
   ```

2. **コードをビルド**
   ```bash
   npm run build
   ```

3. **LocalStackにデプロイ**
   ```bash
   npm run localstack:deploy
   ```

4. **アプリケーションを開発・テスト**
   - AWS CLIまたはSDKを使用してDynamoDBにアクセス
   - エンドポイントURLに `http://localhost:4566` を指定

5. **変更を確認**
   ```bash
   npm run localstack:logs
   ```

6. **開発完了後、LocalStackを停止**
   ```bash
   npm run localstack:stop
   ```

## CI/CDとの統合

LocalStackはCI/CD環境でも使用できます。GitHub Actionsの例：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack:3.0
        ports:
          - 4566:4566
        env:
          SERVICES: dynamodb
          DEBUG: 1
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd infrastructure/deploy
          npm install
      - name: Deploy to LocalStack
        run: |
          cd infrastructure/deploy
          npm run build
          npm run localstack:deploy
      - name: Run tests
        run: npm test
```

## 関連リソース

- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Local (cdklocal)](https://github.com/localstack/aws-cdk-local)
- [DynamoDB Local開発ガイド](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
