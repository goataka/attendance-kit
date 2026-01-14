# Pre-merge CDK Validation Workflow

このワークフローは、Pull RequestでCDK関連ファイルに変更があった場合に自動的に実行され、LocalStackを使用してCDKスタックの検証を行います。

## 目的

マージ前にCDKの変更が正しく動作することを検証し、本番環境へのデプロイ前に問題を早期発見します。

## トリガー条件

以下のファイルに変更があるPull Requestで自動実行されます：

- `infrastructure/deploy/lib/**/*.ts` - CDKスタック定義
- `infrastructure/deploy/bin/**/*.ts` - CDKアプリエントリーポイント
- `infrastructure/deploy/test/**/*.test.ts` - ユニットテスト
- `infrastructure/deploy/package*.json` - 依存関係
- `infrastructure/deploy/tsconfig.json` - TypeScript設定
- `infrastructure/deploy/docker-compose.yml` - LocalStack設定
- `.github/workflows/premerge-cdk.yml` - このワークフロー自体

## 検証ステップ

### 1. ビルドとテスト
- TypeScriptコードのビルド
- ユニットテストの実行

### 2. LocalStack検証
- LocalStackコンテナの起動
- CDK Synthでテンプレート生成
- LocalStackへのCDKスタックデプロイ

### 3. DynamoDB検証
- テーブル作成の確認
- 基本的なCRUD操作のテスト
  - `put-item`: データ挿入
  - `get-item`: データ取得
  - `scan`: テーブルスキャン

### 4. クリーンアップ
- LocalStackコンテナの停止と削除

## 成功時の動作

検証が成功すると、PRに以下のようなコメントが自動投稿されます：

```
## ✅ CDK Pre-merge Validation Passed

すべてのCDK検証が成功しました:

- ✅ TypeScriptビルド成功
- ✅ ユニットテスト通過
- ✅ CDK Synth成功
- ✅ LocalStackへのデプロイ成功
- ✅ DynamoDBテーブル作成確認
- ✅ DynamoDB操作テスト成功

このPRはマージ可能です。
```

## 失敗時の動作

検証が失敗すると、PRに以下のようなコメントが自動投稿されます：

```
## ❌ CDK Pre-merge Validation Failed

CDK検証中にエラーが発生しました。

詳細はワークフローログを確認してください:
[ワークフロー実行ログ](...)

問題を修正してから再度プッシュしてください。
```

## メリット

### 早期問題発見
- マージ前に構文エラーや設定ミスを検出
- 本番環境へのデプロイ失敗リスクを削減

### 自動化
- 手動検証が不要
- レビュアーの負担を軽減

### コスト削減
- 実際のAWS環境を使用しないため、コストゼロ
- LocalStackで完全な検証が可能

### 高速フィードバック
- 通常5-10分で完了
- 問題を迅速に修正可能

## ローカルでの実行

同じ検証をローカル環境で実行することも可能です：

```bash
cd infrastructure/deploy

# 依存関係インストール
npm ci

# ビルド
npm run build

# テスト
npm test

# LocalStack起動
npm run localstack:start

# CDK Synth
npm run localstack:synth

# デプロイ
npm run localstack:deploy

# 検証
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-northeast-1

# クリーンアップ
npm run localstack:stop
```

## トラブルシューティング

### LocalStackが起動しない

ワークフローログを確認し、Dockerコンテナの起動に失敗している場合：
- docker-compose.ymlの設定を確認
- ポート4566が利用可能か確認

### CDK Deployが失敗する

- CDKコードの構文エラーがないか確認
- `npm run build`がローカルで成功するか確認
- `npm test`がローカルで成功するか確認

### DynamoDB操作が失敗する

- テーブル名が正しいか確認（`attendance-kit-dev-clock`）
- LocalStackが正常に起動しているか確認
- エンドポイントURLが正しいか確認（`http://localhost:4566`）

## 関連ドキュメント

- [LocalStack使用方法](../../infrastructure/deploy/LOCALSTACK.md)
- [Deploy Environment Stack Workflow](./deploy-environment-stack.md)
- [Update CDK Snapshots Workflow](./update-cdk-snapshots.md)
