# deploy-environment-stack.yml

環境レベルリソース（DynamoDB等）をAWS CDKでデプロイし、Dev環境の場合はE2Eテストを実行するワークフロー

## トリガー

### 自動デプロイ

以下のファイルが`main`ブランチにマージされた時:
- `apps/backend/**`
- `apps/frontend/**`
- `!apps/website/**`（除外）
- `infrastructure/deploy/bin/**`
- `infrastructure/deploy/lib/attendance-kit-stack.ts`
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
- リソース: DynamoDB Clock Table、Backend API、Frontend (CloudFront + S3)

## E2Eテスト（Dev環境のみ）

Dev環境へのデプロイ後、自動的にE2Eテストが実行されます。

### 実行条件

- Dev環境へのデプロイが成功した場合のみ実行
- `inputs.environment == 'dev'` または `main`ブランチへのpush時（デフォルトでdev環境）

### テスト内容

- デプロイされたCloudFront URLとAPI Gatewayに対して実際のE2Eテストを実行
- 既存のCucumberテストシナリオを使用
- テストレポートはArtifactsにアップロードされます

### 環境変数

| 変数 | 説明 |
|------|------|
| `E2E_ENV` | `deployed` に設定（ローカル環境との区別） |
| `FRONTEND_URL` | CloudFormation OutputsからCloudFront URLを取得 |
| `BACKEND_URL` | CloudFormation OutputsからAPI URLを取得 |
| `DYNAMODB_TABLE_NAME` | DynamoDBテーブル名を環境名から計算 (`attendance-kit-{環境名}-clock`) |

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
- Copilotへの対応依頼

このIssueには`bug`と`deploy-error`ラベルが付与され、Copilotが自動的にアサインされます。
