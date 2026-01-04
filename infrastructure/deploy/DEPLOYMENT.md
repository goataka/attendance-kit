# CDK デプロイガイド

このドキュメントでは、AWS CDKを使用して勤怠管理システムをデプロイする方法を説明します。

## 前提条件

- AWS CLI がインストールされ、設定されていること
- AWS アカウントへの適切な権限があること
- Node.js 20.x 以上がインストールされていること
- AWS CDK がインストールされていること (`npm install -g aws-cdk`)

## アーキテクチャ概要

デプロイされるリソース:

### Account Stack (1回のみ)
- AWS Budget（月額10 USD）
- SNS トピック（コストアラート用）

### Infrastructure Stack (環境ごと)
- DynamoDB テーブル（打刻データ保存）
- Global Secondary Index（日付検索用）

### App Stack (環境ごと)
- **Frontend**: CloudFront + S3（Reactアプリ）
- **Backend**: API Gateway + Lambda（NestJS）
- **Site**: CloudFront + S3（Astro + Starlight）

## セットアップ

### 1. 依存関係のインストール

```bash
cd infrastructure/deploy
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. CDK Bootstrap（初回のみ）

```bash
# デフォルトアカウント・リージョンでbootstrap
cdk bootstrap

# 特定のアカウント・リージョンでbootstrap
cdk bootstrap aws://ACCOUNT-NUMBER/ap-northeast-1
```

## デプロイ

### Account Stack（初回のみ）

アカウントレベルのリソースをデプロイします。

```bash
# コストアラート用のメールアドレスを設定
export COST_ALERT_EMAIL="your-email@example.com"

# Account Stackのみデプロイ
cdk deploy AttendanceKit-Account-Stack
```

### Infrastructure Stack（DynamoDB）

```bash
# dev環境
cdk deploy AttendanceKit-Dev-Stack --context environment=dev

# staging環境
cdk deploy AttendanceKit-Staging-Stack --context environment=staging

# prod環境
cdk deploy AttendanceKit-Prod-Stack --context environment=prod
```

### App Stack（Frontend, Backend, Site）

アプリケーションをビルドしてからデプロイします。

#### ビルド

```bash
# ルートディレクトリに戻る
cd ../..

# すべてのアプリをビルド
npm run build

# または個別にビルド
npm run build:frontend
npm run build:backend
npm run build:site
```

#### デプロイ

```bash
# infrastructure/deployディレクトリに戻る
cd infrastructure/deploy

# dev環境
cdk deploy AttendanceKit-Dev-App-Stack --context environment=dev

# staging環境
cdk deploy AttendanceKit-Staging-App-Stack --context environment=staging

# prod環境
cdk deploy AttendanceKit-Prod-App-Stack --context environment=prod
```

### 一括デプロイ

すべてのスタックを一度にデプロイすることもできます。

```bash
# dev環境の全スタックをデプロイ
export COST_ALERT_EMAIL="your-email@example.com"
export ENVIRONMENT=dev
export STACK_TYPE=all

cdk deploy --all
```

## デプロイ後の設定

### Frontend環境変数

デプロイ後、CloudFormation の出力から以下の値を取得し、フロントエンドの環境変数に設定します。

```bash
# API URLを取得
aws cloudformation describe-stacks \
  --stack-name AttendanceKit-Dev-App-Stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

`.env.production` ファイルに設定:

```
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/api
```

再ビルドしてS3にアップロード:

```bash
npm run build:frontend

# S3バケット名を取得
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name AttendanceKit-Dev-App-Stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# S3にアップロード
aws s3 sync apps/frontend/dist s3://$BUCKET_NAME --delete
```

### CloudFrontキャッシュの無効化

```bash
# Distribution IDを取得
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='attendance-kit dev frontend'].Id" \
  --output text)

# キャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## スタック管理

### スタックの一覧表示

```bash
cdk list
```

### スタックの差分確認

```bash
cdk diff AttendanceKit-Dev-App-Stack --context environment=dev
```

### スタックの削除

```bash
# App Stackを削除
cdk destroy AttendanceKit-Dev-App-Stack --context environment=dev

# Infrastructure Stackを削除
cdk destroy AttendanceKit-Dev-Stack --context environment=dev

# Account Stackを削除（注意: 他の環境も使用している場合は削除しないでください）
cdk destroy AttendanceKit-Account-Stack
```

## デプロイオプション

### スタックタイプの指定

`--context stack=<type>` または `STACK_TYPE` 環境変数で指定できます。

- `account`: Account Stackのみデプロイ
- `infrastructure`: Infrastructure Stackのみデプロイ
- `app`: App Stackのみデプロイ
- `all`: すべてのスタックをデプロイ（デフォルト）

### 環境の指定

`--context environment=<env>` または `ENVIRONMENT` 環境変数で指定できます。

- `dev`: 開発環境（デフォルト）
- `staging`: ステージング環境
- `prod`: 本番環境

## トラブルシューティング

### エラー: COST_ALERT_EMAIL が設定されていない

Account Stackをデプロイする際は、必ず `COST_ALERT_EMAIL` 環境変数を設定してください。

```bash
export COST_ALERT_EMAIL="your-email@example.com"
```

### エラー: Lambda関数のビルドが見つからない

App Stackをデプロイする前に、バックエンドをビルドする必要があります。

```bash
cd ../..
npm run build:backend
cd infrastructure/deploy
```

### エラー: DynamoDBテーブルが見つからない

App Stackをデプロイする前に、Infrastructure Stackをデプロイする必要があります。

```bash
cdk deploy AttendanceKit-Dev-Stack --context environment=dev
```

または、既存のテーブル名を指定:

```bash
cdk deploy AttendanceKit-Dev-App-Stack \
  --context environment=dev \
  --context clockTableName=attendance-kit-dev-clock
```

### CloudFrontのデプロイに時間がかかる

CloudFrontのデプロイには15〜30分かかります。これは正常な動作です。

## CI/CD統合

GitHub ActionsなどのCI/CDパイプラインで自動デプロイする場合の例:

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build applications
        run: npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Deploy Infrastructure
        working-directory: infrastructure/deploy
        run: |
          npm ci
          npm run build
          cdk deploy AttendanceKit-Dev-Stack --require-approval never
      
      - name: Deploy Application
        working-directory: infrastructure/deploy
        run: |
          cdk deploy AttendanceKit-Dev-App-Stack --require-approval never
```

## コスト最適化

デプロイされるリソースのコスト見積もり:

- **DynamoDB**: On-Demandモード（使用量に応じた課金）
- **Lambda**: 無料枠あり（月間100万リクエスト、40万GB-秒）
- **API Gateway**: 無料枠あり（月間100万リクエスト）
- **CloudFront**: 無料枠あり（月間1TB転送、1000万リクエスト）
- **S3**: 使用量に応じた課金（通常は数ドル/月）

開発環境での想定コスト: **月額5〜10 USD**

## 参考資料

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
