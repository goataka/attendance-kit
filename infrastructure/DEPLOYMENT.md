# デプロイメント

## 自動デプロイ

1. `infrastructure/`配下のファイルを変更
2. PRを作成してレビュー
3. `main`ブランチにマージ
4. GitHub Actionsが自動的にデプロイを実行

## 手動デプロイ

### 環境スタックのデプロイ

1. GitHub Actionsタブを開く
2. "Deploy to AWS"ワークフローを選択
3. "Run workflow"をクリックして環境を選択

### アカウントスタックのデプロイ（コストアラート）

アカウント単位のリソース（AWS Budget, SNS）をデプロイする場合:

#### 前提条件

GitHub Secretsに以下を設定:
```
COST_ALERT_EMAIL=your-email@example.com
```

#### デプロイ手順

```bash
# リポジトリをクローン
git clone https://github.com/goataka/attendance-kit.git
cd attendance-kit/infrastructure/deploy

# 依存関係をインストール
npm install

# ビルド
npm run build

# テスト（オプション）
npm test

# デプロイ
COST_ALERT_EMAIL=your-email@example.com npm run cdk deploy AttendanceKit-Account-Stack
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
