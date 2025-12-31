# GitHub Actions ワークフロー

## ワークフローサマリー

このディレクトリには、プロジェクトの CI/CD ワークフローが含まれています。

### deploy-environment-stack.yml

環境レベルリソース（DynamoDBテーブル等）をデプロイするワークフロー。

- **トリガー**: 
  - 環境スタック関連ファイルが`main`ブランチにプッシュされた時（自動）
  - 手動実行（`workflow_dispatch`）
- **対象**: `AttendanceKit-Dev-Stack`, `AttendanceKit-Staging-Stack`
- **環境**: dev, staging（選択可能）
- **認証**: OIDC

**監視ファイル**:
- `infrastructure/deploy/lib/attendance-kit-stack.ts`
- `infrastructure/deploy/test/attendance-kit-stack.test.ts`
- `infrastructure/deploy/bin/app.ts`
- `infrastructure/deploy/package*.json`

### deploy-account-stack.yml

アカウントレベルリソース（AWS Budget, SNS）をデプロイするワークフロー。

- **トリガー**: 
  - アカウントスタック関連ファイルが`main`ブランチにプッシュされた時（自動）
  - 手動実行（`workflow_dispatch`）
- **対象**: `AttendanceKit-Account-Stack`
- **環境**: production（アカウント単位）
- **認証**: OIDC
- **必須シークレット**: `COST_ALERT_EMAIL`

**監視ファイル**:
- `infrastructure/deploy/lib/attendance-kit-account-stack.ts`
- `infrastructure/deploy/lib/constructs/cost-budget.ts`
- `infrastructure/deploy/test/attendance-kit-account-stack.test.ts`
- `infrastructure/deploy/test/cost-budget.test.ts`

詳細は各ワークフローのドキュメントを参照してください。
