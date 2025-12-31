# デプロイメント

## 自動デプロイ

### 環境スタック（Environment-Level）

環境レベルリソース（DynamoDBテーブル等）は、関連ファイルが変更されると自動的にデプロイされます。

**トリガーファイル**:
- `infrastructure/deploy/lib/attendance-kit-stack.ts`
- `infrastructure/deploy/test/attendance-kit-stack.test.ts`
- `infrastructure/deploy/bin/app.ts`
- `infrastructure/deploy/package*.json`

**デプロイフロー**:
1. 上記ファイルを変更
2. PRを作成してレビュー
3. `main`ブランチにマージ
4. GitHub Actions (`deploy-environment-stack.yml`) が自動的に dev 環境にデプロイ

### アカウントスタック（Account-Level）

アカウントレベルリソース（AWS Budget, SNS）は、関連ファイルが変更されると自動的にデプロイされます。

**トリガーファイル**:
- `infrastructure/deploy/lib/attendance-kit-account-stack.ts`
- `infrastructure/deploy/lib/constructs/cost-budget.ts`
- `infrastructure/deploy/test/attendance-kit-account-stack.test.ts`
- `infrastructure/deploy/test/cost-budget.test.ts`

**デプロイフロー**:
1. 上記ファイルを変更
2. PRを作成してレビュー
3. `main`ブランチにマージ
4. GitHub Actions (`deploy-account-stack.yml`) が自動的にデプロイ

**前提条件**: GitHub Secretsに `COST_ALERT_EMAIL` が設定されている必要があります。

## 手動デプロイ

### 環境スタックのデプロイ

GitHub Actions経由:
1. GitHub Actionsタブを開く
2. "Deploy Environment Stack to AWS"ワークフローを選択
3. "Run workflow"をクリックして環境（dev/staging）を選択

ローカル環境から:
```bash
cd infrastructure/deploy
npm install
npm run build
npm test
ENVIRONMENT=dev npx cdk deploy AttendanceKit-Dev-Stack
```

### アカウントスタックのデプロイ（コストアラート）

GitHub Actions経由:
1. GitHub Actionsタブを開く
2. "Deploy Account Stack to AWS"ワークフローを選択
3. "Run workflow"をクリック

**注意**: GitHub Secretsに `COST_ALERT_EMAIL` が設定されている必要があります。

ローカル環境から:
```bash
cd infrastructure/deploy
npm install
npm run build
npm test
COST_ALERT_EMAIL=your-email@example.com npx cdk deploy AttendanceKit-Account-Stack
```

#### デプロイ後の確認

1. **SNS確認メール**:
   - 登録メールアドレスに「AWS Notification - Subscription Confirmation」が届く
   - メール内の「Confirm subscription」リンクをクリック

2. **AWS Budgetコンソール**:
   - https://console.aws.amazon.com/billing/home#/budgets
   - 「attendance-kit-account-monthly-budget」が作成されていることを確認

3. **SNSコンソール**:
   - https://console.aws.amazon.com/sns/v3/home
   - トピック「attendance-kit-cost-alerts」が作成されていることを確認
   - サブスクリプションが「Confirmed」状態であることを確認

## スタック構成

### アカウントレベルスタック

**スタック名**: `AttendanceKit-Account-Stack`

**リソース**:
- AWS Budget (attendance-kit-account-monthly-budget)
- SNS Topic (attendance-kit-cost-alerts)
- SNS Subscription (Email)
- SNS Topic Policy

**デプロイ頻度**: 初回のみ（更新時のみ再デプロイ）

### 環境レベルスタック

**スタック名**: `AttendanceKit-Dev-Stack`, `AttendanceKit-Staging-Stack`

**リソース**:
- DynamoDB Clock Table

**デプロイ頻度**: 環境ごとに必要時

## トラブルシューティング

### SNSサブスクリプション確認メールが届かない

**原因**:
- メールアドレスが間違っている
- スパムフォルダに入っている

**対処**:
1. SNSコンソールでサブスクリプション状態を確認
2. 必要に応じてサブスクリプションを削除して再作成
3. スパムフォルダを確認

### デプロイエラー: `COST_ALERT_EMAIL environment variable must be set`

**原因**: 環境変数が設定されていない

**対処**:
```bash
COST_ALERT_EMAIL=your-email@example.com npm run cdk deploy AttendanceKit-Account-Stack
```

### Budget作成エラー

**原因**: 既に同名のBudgetが存在する

**対処**:
1. AWS Budgetコンソールで既存のBudgetを確認
2. 既存のBudgetを削除するか、別の名前を使用
3. 再デプロイ

## 削除

### アカウントスタックの削除

```bash
npm run cdk destroy AttendanceKit-Account-Stack
```

**注意**: 
- AWS BudgetとSNS Topicが削除されます
- アラート通知が停止します
- 削除前に関係者に確認してください
