# deploy-environment-stack.yml

## 概要

環境レベルリソース（DynamoDB Clock Table等）をAWS CDKでデプロイするワークフロー。dev環境とstaging環境それぞれに独立したスタックをデプロイします。

## トリガー条件

### 自動デプロイ

以下のファイルが`main`ブランチにプッシュされた時に自動実行:
- `infrastructure/deploy/lib/attendance-kit-stack.ts`
- `infrastructure/deploy/test/attendance-kit-stack.test.ts`
- `infrastructure/deploy/bin/app.ts`
- `infrastructure/deploy/package*.json`
- `infrastructure/deploy/tsconfig.json`
- `.github/workflows/deploy-environment-stack.yml`

### 手動デプロイ

GitHub Actionsの画面から手動で実行できます。環境（dev/staging）を選択可能です。

## デプロイ対象

- **スタック名**: `AttendanceKit-Dev-Stack` または `AttendanceKit-Staging-Stack`
- **リソース**: DynamoDB Clock Table（環境ごとに作成）

## ワークフローステップ

### 1. 環境セットアップ

- リポジトリのチェックアウト
- Node.js 22.xのセットアップ
- 依存関係のインストール（`npm ci`）

### 2. ビルドとテスト

- TypeScriptコードのビルド（`npm run build`）
- ユニットテストの実行（`npm test`）

### 3. AWS認証

OIDC認証を使用してAWSに接続します。`AWS_ROLE_TO_ASSUME`シークレットに設定されたIAMロールを引き受けます。

### 4. CDK Bootstrap

初回デプロイ時に`npx cdk bootstrap`を実行し、CDK管理用のS3バケットとIAMロールを作成します（冪等操作）。

### 5. CDK Deploy

指定された環境の環境スタックのみをデプロイ:
```bash
npx cdk deploy AttendanceKit-${ENVIRONMENT}-Stack --require-approval never
```

### 6. デプロイ結果の出力

CloudFormationスタックのOutputs（TableName, TableArn等）を表示します。

## 必要な設定

### GitHub Secrets

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
- `JWT_SECRET`: バックエンドAPIのJWT認証に使用するシークレットキー

### 環境変数

- `ENVIRONMENT`: デプロイ先環境（dev/staging）
  - 自動デプロイ: `dev`（デフォルト）
  - 手動デプロイ: 入力で選択

## セキュリティ

- **OIDC認証**: 永続的な認証情報は使用しない
- **IAM権限**: 必要最小限の権限のみを付与
- **リポジトリ制限**: 特定のGitHubリポジトリのみがロールを引き受け可能

## 関連ドキュメント

- [デプロイ手順](../../infrastructure/DEPLOYMENT.md)
- [初回セットアップ](../../infrastructure/setup/README.md)
- [アカウントスタックデプロイ](./deploy-account-stack.md)
