# GitHub Actions ワークフロー

## ワークフローサマリー

このディレクトリには、プロジェクトの CI/CD ワークフローが含まれています。

### copilot-setup-steps.yml

GitHub Copilot Coding Agent の実行環境をセットアップするワークフロー。

- **トリガー**: 
  - ワークフローファイル自体の変更時
  - 手動実行（通常は不要）
- **目的**: spec-kit CLI のインストールと初期化
- **実行者**: GitHub Copilot Coding Agent（自動）

**詳細**: [copilot-setup-steps.md](./copilot-setup-steps.md)

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

**詳細**: [deploy-environment-stack.md](./deploy-environment-stack.md)

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

**詳細**: [deploy-account-stack.md](./deploy-account-stack.md)

### create-issue-on-failure.yml

GitHub Actionsワークフローの失敗を検知し、自動的にIssueを作成するワークフロー。

- **トリガー**: 
  - 監視対象のワークフローが失敗した時（自動）
- **機能**: 
  - 失敗したワークフローの詳細情報を含むIssueを作成
  - Copilotにアサイン（可能な場合）
  - 既存Issueがある場合はコメントを追加
- **自己除外**: このワークフロー自体は監視対象外
- **ラベル**: `bug`, `automated`, `workflow-failure`

**監視対象ワークフロー**:
- Copilot Setup Steps
- Deploy Account Stack to AWS
- Deploy Environment Stack to AWS

**詳細**: [create-issue-on-failure.md](./create-issue-on-failure.md)

## 関連ドキュメント

- [デプロイ手順](../../infrastructure/DEPLOYMENT.md) - 各ワークフローの使い方
- [初回セットアップ](../../infrastructure/setup/README.md) - GitHub Secretsの設定方法
