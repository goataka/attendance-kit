# deploy-environment-stack.yml

環境レベルリソース（DynamoDB等）をAWS CDKでデプロイするワークフロー

## トリガー

### 自動デプロイ

以下のファイルが`main`ブランチにマージされた時:
- `apps/backend/**`
- `apps/frontend/**`
- `!apps/website/**`（除外）
- `infrastructure/deploy/bin/**`
- `infrastructure/deploy/lib/attendance-kit-stack.ts`
- `infrastructure/deploy/lib/dynamodb-stack.ts`
- `infrastructure/deploy/lib/constructs/**`
- `infrastructure/deploy/lib/utils/**`
- `infrastructure/deploy/test/**`
- `infrastructure/deploy/package*.json`
- `infrastructure/deploy/tsconfig.json`
- `infrastructure/deploy/cdk.json`
- `package.json`
- `package-lock.json`

### 手動デプロイ

GitHub Actionsから環境（dev/staging）を選択して実行可能

## デプロイ対象

- スタック名: `AttendanceKit-Dev-Stack` または `AttendanceKit-Staging-Stack`
- リソース: DynamoDB Clock Table

## 必要な設定

### GitHub Secrets

以下のシークレットを設定する必要があります。**Environment secrets**として設定することで、環境ごとに異なる値を使用できます。

#### Repository Secrets または Environment Secrets

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
  - 形式: `arn:aws:iam::<account-id>:role/AttendanceKitGitHubDeployRole`
  - 設定場所: Settings > Secrets and variables > Actions > New repository secret

- `JWT_SECRET`: バックエンドAPIのJWT認証シークレットキー
  - **必須**: 空文字列でないランダムな文字列（推奨: 32文字以上）
  - 例: `openssl rand -base64 32` で生成した文字列
  - 設定場所: 
    - Repository secrets: Settings > Secrets and variables > Actions > New repository secret
    - Environment secrets（推奨）: Settings > Environments > dev > Add secret
  - **注意**: Environment secrets は Repository secrets より優先されます
  - **重要**: このシークレットが未設定または空の場合、Lambda関数の初期化が失敗し、API呼び出しで500エラーが発生します

### トラブルシューティング

#### 500 Internal Server Errorが発生する場合

1. GitHub Secretsで`JWT_SECRET`が設定されているか確認
   - Environment: `dev` または `staging`
   - Secret name: `JWT_SECRET`
   - Value: 空でないランダムな文字列

2. デプロイログでJWT_SECRETが正しく渡されているか確認
   - ワークフローログで `JWT_SECRET: ***` と表示されることを確認

3. CloudWatchログでエラーメッセージを確認
   - Log Group: `/aws/lambda/attendance-kit-dev-api`
   - エラー例: `JWT_SECRET environment variable is not set or is empty`
