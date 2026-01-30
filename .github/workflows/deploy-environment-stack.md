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

## エラー時の自動対応

デプロイが失敗した場合、以下の対応が自動的に実行されます：

### PRへのコメント

PRが存在する場合、失敗情報がコメントとして投稿されます（[comment-on-failure](../actions/comment-on-failure/README.md)アクション）

### Issueの自動作成

デプロイ失敗時に、以下の情報を含むIssueが自動的に作成されます：

- ワークフロー名とURL
- コミットSHA
- 発生日時
- Copilotへの対応依頼

このIssueには`bug`と`deploy-error`ラベルが付与され、Copilotが自動的にアサインされます。
