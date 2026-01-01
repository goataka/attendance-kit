# deploy-account-stack.yml

## 概要

アカウントレベルリソース（AWS Budget, SNS Topic）をAWS CDKでデプロイするワークフロー。AWSアカウント全体で1つのスタックをデプロイします。

## トリガー条件

### 自動デプロイ

以下のファイルが`main`ブランチにプッシュされた時に自動実行:
- `infrastructure/deploy/lib/attendance-kit-account-stack.ts`
- `infrastructure/deploy/lib/constructs/cost-budget.ts`
- `infrastructure/deploy/test/attendance-kit-account-stack.test.ts`
- `infrastructure/deploy/test/cost-budget.test.ts`
- `.github/workflows/deploy-account-stack.yml`

### 手動デプロイ

GitHub Actionsの画面から手動で実行できます。環境の選択は不要（アカウント単位のため）。

## デプロイ対象

- **スタック名**: `AttendanceKit-Account-Stack`
- **リソース**: 
  - AWS Budget（月次1000円予算、実利用額・予測額アラート）
  - SNS Topic（コストアラート通知用）
  - SNS Email Subscription

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

アカウントスタックをデプロイ:
```bash
COST_ALERT_EMAIL=${{ secrets.COST_ALERT_EMAIL }} \
npx cdk deploy AttendanceKit-Account-Stack --require-approval never
```

### 6. デプロイ結果の出力

CloudFormationスタックのOutputs（BudgetName, SnsTopicArn等）を表示します。

### 7. SNSサブスクリプション確認リマインダー

デプロイ後、メールで届くSNSサブスクリプション確認リンクをクリックする必要があることを通知します。

## 必要な設定

### GitHub Secrets（必須）

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
- `COST_ALERT_EMAIL`: コストアラート通知先のメールアドレス
  - **重要**: このシークレットが未設定の場合、デプロイが失敗します

## デプロイ後の作業

1. **SNSサブスクリプション確認**:
   - `COST_ALERT_EMAIL`に設定したメールアドレスに「AWS Notification - Subscription Confirmation」メールが届きます
   - メール内の「Confirm subscription」リンクをクリックして確認してください
   - 確認しないと、コストアラートメールが受信できません

2. **Budget設定の確認**:
   - AWS Budgetコンソールで「attendance-kit-account-monthly-budget」が作成されていることを確認
   - 予算額: 1000円/月
   - アラート: 実利用額100%、予測額100%

## セキュリティ

- **OIDC認証**: 永続的な認証情報は使用しない
- **IAM権限**: AWS Budgets サービスのみに SNS Publish 権限を付与
- **最小権限の原則**: 必要最小限の権限のみを付与
- **リポジトリ制限**: 特定のGitHubリポジトリのみがロールを引き受け可能

## コスト

- **AWS Budget**: 2個まで無料（1個使用）
- **SNS Email通知**: 1,000件/月まで無料
- **追加コスト**: なし（完全無料枠内）

## トラブルシューティング

### エラー: `COST_ALERT_EMAIL environment variable must be set`

**原因**: GitHub Secretsに`COST_ALERT_EMAIL`が設定されていない

**対処**: 
1. GitHubリポジトリのSettings > Secrets and variables > Actions を開く
2. `COST_ALERT_EMAIL`を追加し、通知先メールアドレスを設定
3. ワークフローを再実行

### SNS確認メールが届かない

**原因**: メールアドレスが間違っているか、スパムフォルダに入っている

**対処**:
1. スパムフォルダを確認
2. SNSコンソールでサブスクリプション状態を確認
3. 必要に応じてサブスクリプションを削除して再デプロイ

## 関連ドキュメント

- [デプロイ手順](../../infrastructure/DEPLOYMENT.md)
- [初回セットアップ](../../infrastructure/setup/README.md)
- [環境スタックデプロイ](./deploy-environment-stack.md)
- [コストアラート仕様](../../docs/architecture/cost-budget-alerts.md)
- [ビジネス要件](../../docs/business/cost-budget-requirements.md)
