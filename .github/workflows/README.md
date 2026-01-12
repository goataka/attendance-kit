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

## CDK関連ワークフロー

CDK関連のワークフロー（`premerge-cdk.yml`, `update-cdk-snapshots.yml`）の実装詳細とドキュメントは、インフラストラクチャディレクトリで管理されています。

**詳細**: [infrastructure/deploy/.github/workflows/README.md](../../infrastructure/deploy/.github/workflows/README.md)

### premerge-cdk.yml

CDK関連ファイルが変更されたPull Requestで、LocalStackを使用してCDKスタックの検証を行うワークフロー。

- **実装**: `infrastructure/deploy/.github/workflows/premerge-cdk.yml`
- **検証スクリプト**: `infrastructure/deploy/scripts/validate-cdk-localstack.sh`

### update-cdk-snapshots.yml

CDK関連ファイルが変更されたPull Requestで、スナップショットを自動更新するワークフロー。

- **実装**: `infrastructure/deploy/.github/workflows/update-cdk-snapshots.yml`

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

## 関連ドキュメント

- [デプロイ手順](../../infrastructure/DEPLOYMENT.md) - 各ワークフローの使い方
- [初回セットアップ](../../infrastructure/setup/README.md) - GitHub Secretsの設定方法
