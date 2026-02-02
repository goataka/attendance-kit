# Account Stack

アカウントレベルのAWSリソースを管理するCDKプロジェクトです。

## 概要

このスタックは、AWSアカウント全体で使用されるリソースを管理します：

- AWS Budget: 月次コスト予算（デフォルト: 10 USD）
- SNS Topic: コストアラート通知用

## ビルド

```bash
npm run build
```

## テスト

```bash
npm test
```

## デプロイ

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `COST_ALERT_EMAIL` | アラート通知先メールアドレス | はい |

### ローカル

```bash
export COST_ALERT_EMAIL=your-email@example.com
npx cdk bootstrap  # 初回のみ
npx cdk deploy
```

### GitHub Actions

`infrastructure/account/`配下のファイルを`main`ブランチにマージすると自動デプロイされます。

## スタック構成

### CostBudgetConstruct

- SNS Topic: `attendance-kit-cost-alerts`
- Budget: `attendance-kit-account-monthly-budget`
  - 予算額: 10 USD/月
  - 実際のコストが100%超過時にアラート
  - 予測コストが100%超過時にアラート

## CloudFormation Outputs

| Output | 説明 |
|--------|------|
| `BudgetName` | AWS Budget名 |
| `SnsTopicArn` | SNS Topic ARN |

## 注意事項

デプロイ後、SNSサブスクリプション確認メールが届きます。リンクをクリックして確認してください。
