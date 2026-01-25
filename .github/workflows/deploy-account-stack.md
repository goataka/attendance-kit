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
