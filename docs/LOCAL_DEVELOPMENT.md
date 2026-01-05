# ローカル開発環境セットアップガイド

このドキュメントは、Attendance Kitのローカル開発環境のセットアップ手順を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください:

- Node.js 18.x 以上
- npm 9.x 以上
- Docker Desktop（LocalStack用）
- AWS CLI（テーブルセットアップ用）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/attendance-kit.git
cd attendance-kit
```

### 2. 依存関係のインストール

```bash
npm ci
```

### 3. LocalStackの起動

LocalStackを使用してDynamoDBをローカルで実行します。

```bash
# LocalStackコンテナを起動
docker-compose up -d

# ログを確認（オプション）
docker-compose logs -f localstack
```

LocalStackが起動したら、以下のURLでアクセス可能です:
- エンドポイント: http://localhost:4566

### 4. DynamoDBテーブルの作成

```bash
# セットアップスクリプトを実行
./scripts/setup-dynamodb-local.sh
```

このスクリプトは以下を実行します:
- `AttendanceRecords-Local`テーブルの作成
- パーティションキー: `userId` (String)
- ソートキー: `timestamp` (String)
- Global Secondary Index: `DateIndex` (date, timestamp)

### 5. 環境変数の設定

バックエンドアプリケーション用の環境変数を設定します。

#### Option A: .envファイルを作成（推奨）

`apps/backend/.env`ファイルを作成:

```bash
# DynamoDB設定
DYNAMODB_TABLE_NAME=AttendanceRecords-Local
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# アプリケーション設定
PORT=3000
```

#### Option B: シェルで直接設定

```bash
export DYNAMODB_TABLE_NAME=AttendanceRecords-Local
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_REGION=ap-northeast-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

### 6. 開発サーバーの起動

#### すべてのサービスを起動

```bash
npm run dev
```

以下のサービスが起動します:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Site: http://localhost:4321

#### 個別にサービスを起動

```bash
# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ
npm run dev:backend

# サポートサイトのみ
npm run dev:site
```

## 動作確認

### 1. バックエンドのヘルスチェック

```bash
curl http://localhost:3000/api/health
```

### 2. 出勤打刻のテスト

```bash
curl -X POST http://localhost:3000/api/clock-in \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test001",
    "userName": "テストユーザー"
  }'
```

### 3. 打刻履歴の取得

```bash
curl http://localhost:3000/api/records?userId=test001
```

### 4. DynamoDBのデータ確認

```bash
aws dynamodb scan \
  --table-name AttendanceRecords-Local \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1
```

## トラブルシューティング

### LocalStackが起動しない

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs localstack

# コンテナを再起動
docker-compose restart localstack
```

### DynamoDBテーブルが見つからない

```bash
# テーブル一覧を確認
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# テーブルを再作成
./scripts/setup-dynamodb-local.sh
```

### バックエンドがDynamoDBに接続できない

以下を確認してください:
1. LocalStackが起動している（`docker-compose ps`）
2. 環境変数が正しく設定されている
3. テーブルが作成されている

```bash
# 環境変数を確認
echo $DYNAMODB_TABLE_NAME
echo $AWS_ENDPOINT_URL

# テーブルの存在を確認
aws dynamodb describe-table \
  --table-name AttendanceRecords-Local \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1
```

### ポートが既に使用されている

別のプロセスがポートを使用している場合:

```bash
# ポートを使用しているプロセスを確認
lsof -i :3000  # Backend
lsof -i :4566  # LocalStack
lsof -i :5173  # Frontend

# プロセスを終了
kill -9 <PID>
```

## データのリセット

### LocalStackのデータをクリア

```bash
# LocalStackを停止
docker-compose down

# ボリュームデータを削除
rm -rf localstack-data

# LocalStackを再起動
docker-compose up -d

# テーブルを再作成
./scripts/setup-dynamodb-local.sh
```

## 開発時のTips

### ホットリロード

- フロントエンド: ファイル保存時に自動リロード
- バックエンド: ファイル保存時に自動再起動（NestJS watch mode）
- サイト: ファイル保存時に自動リロード

### デバッグ

#### フロントエンド

ブラウザのデベロッパーツールを使用:
1. Chrome DevTools: F12キー
2. React DevTools拡張機能の使用を推奨

#### バックエンド

VS Codeのデバッガーを使用:

`.vscode/launch.json`を作成:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "-w", "apps/backend"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "DYNAMODB_TABLE_NAME": "AttendanceRecords-Local",
        "AWS_ENDPOINT_URL": "http://localhost:4566"
      }
    }
  ]
}
```

### LocalStackの管理

#### GUIツール

LocalStack Web UIを使用（有料版）、または以下のツールを使用:

- [NoSQL Workbench for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html)
- [AWS CLI](https://aws.amazon.com/cli/)

#### CLIでのクエリ例

```bash
# 特定ユーザーの打刻履歴を取得
aws dynamodb query \
  --table-name AttendanceRecords-Local \
  --key-condition-expression "userId = :uid" \
  --expression-attribute-values '{":uid":{"S":"test001"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# 特定日の全打刻を取得（GSI使用）
aws dynamodb query \
  --table-name AttendanceRecords-Local \
  --index-name DateIndex \
  --key-condition-expression "#d = :date" \
  --expression-attribute-names '{"#d":"date"}' \
  --expression-attribute-values '{":date":{"S":"2024-01-01"}}' \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1
```

## 次のステップ

- [アーキテクチャドキュメント](./architecture/attendance-kit-architecture.md)を参照
- [リポジトリ構成](./REPOSITORY_STRUCTURE.md)を確認
- [デプロイガイド](../infrastructure/deploy/DEPLOYMENT.md)を読む
