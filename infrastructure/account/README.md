# Account Stack

アカウントレベルのAWSリソースを管理するCDKプロジェクトです。

## 概要

このスタックは、AWSアカウント全体で使用されるリソースを管理します：

- **AWS Budget**: 月次コスト予算（デフォルト: 10 USD）
- **SNS Topic**: コストアラート通知用

## 前提条件

- Node.js 24以上
- AWS CLI v2
- AWSアカウント

## インストール

```bash
npm install
```

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

- `COST_ALERT_EMAIL`: アラート通知先メールアドレス（必須）

### ローカルからのデプロイ

```bash
export AWS_PROFILE=your-profile
export COST_ALERT_EMAIL=your-email@example.com

# 初回のみ
npx cdk bootstrap

# デプロイ
npx cdk deploy
```

### GitHub Actionsからのデプロイ

`infrastructure/account/`配下のファイルを変更し`main`ブランチにマージすると、自動的にデプロイされます。

**前提**: GitHub Secretsに `COST_ALERT_EMAIL` が設定されていること

## スタック構成

### CostBudgetConstruct

- **SNS Topic**: `attendance-kit-cost-alerts`
  - Emailサブスクリプション
  - AWS Budgetsサービスからの発行許可

- **Budget**: `attendance-kit-account-monthly-budget`
  - 予算額: 10 USD/月
  - 実際のコストが100%を超えた場合にアラート
  - 予測コストが100%を超えた場合にアラート

## CloudFormation Outputs

- `BudgetName`: AWS Budget名
- `SnsTopicArn`: SNS Topic ARN

## 注意事項

### デプロイ後の対応

SNSサブスクリプション確認メールが届くので、リンクをクリックして確認してください。

### 予算額の変更

予算額を変更する場合は、`bin/app.ts`の`budgetAmountUsd`を編集してください。
