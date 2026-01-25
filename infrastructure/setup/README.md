# 初回セットアップ

## ステップ1: OIDCプロバイダーとIAMロール作成

1. AWSコンソールでCloudFormationを開く
2. `attendance-kit-setup.yaml`テンプレートで新しいスタックを作成
3. スタック名: `AttendanceKit-Setup-Stack`
4. OutputsタブからロールARNをコピー

## ステップ2: GitHub Secrets設定

GitHubリポジトリのSettings > Secrets and variables > Actionsを開く

### 必須シークレット

- `AWS_ROLE_TO_ASSUME`: OIDCで取得したロールARN
- `COST_ALERT_EMAIL`: コストアラート送信先メールアドレス

## ステップ3: 自動デプロイ

### 環境スタック（DynamoDB等）

GitHub Actionsタブで "Deploy Environment Stack to AWS" を実行

### アカウントスタック（コストアラート）

1. `COST_ALERT_EMAIL`が設定されていることを確認
2. GitHub Actionsタブで "Deploy Account Stack to AWS" を実行

## ステップ4: SNSサブスクリプション確認

コストアラート機能をデプロイした場合、メールで届くサブスクリプション確認リンクをクリックしてください。

## テンプレート更新

`attendance-kit-setup.yaml`を変更した場合は、CloudFormationコンソールでスタックを手動更新してください。
