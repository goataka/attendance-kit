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

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
- `JWT_SECRET`: バックエンドAPIのJWT認証シークレットキー
