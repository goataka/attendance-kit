# deploy-account-stack.yml

アカウントレベルリソース（AWS Budget, SNS）をAWS CDKでデプロイするワークフロー

## トリガー

### 自動デプロイ

以下のファイルが`main`ブランチにマージされた時:
- `infrastructure/deploy/lib/attendance-kit-account-stack.ts`
- `infrastructure/deploy/lib/constructs/cost-budget.ts`
- `infrastructure/deploy/test/attendance-kit-account-stack.test.ts`
- `infrastructure/deploy/test/cost-budget.test.ts`

### 手動デプロイ

GitHub Actionsから実行可能

## デプロイ対象

- スタック名: `AttendanceKit-Account-Stack`
- リソース: AWS Budget、SNS Topic、SNS Email Subscription

## 必要な設定

### GitHub Secrets

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
- `COST_ALERT_EMAIL`: コストアラート通知先メールアドレス（必須）

## デプロイ後の作業

SNSサブスクリプション確認メールが届くので、リンクをクリックして確認してください。

## トラブルシューティング

### エラー: `COST_ALERT_EMAIL environment variable must be set`

GitHub Secretsに`COST_ALERT_EMAIL`を設定してください。

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
