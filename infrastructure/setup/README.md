# 初回セットアップ

## 概要

このセットアップでは、以下の2つのIAM Roleを作成します：

1. **GitHubActionsDeployRole**: デプロイ用の権限を持つRole（PowerUserAccess）
2. **GitHubCopilotInvestigationRole**: 調査用の読み取り専用Role（ReadOnlyAccess）

## ステップ1: OIDCプロバイダーとIAMロール作成

1. AWSコンソールでCloudFormationを開く
2. `attendance-kit-setup.yaml`テンプレートで新しいスタックを作成
3. スタック名: `AttendanceKit-Setup-Stack`
4. OutputsタブからロールARNをコピー
   - `GitHubSecretValue`: デプロイ用Role ARN
   - `CopilotSecretValue`: 調査用Role ARN

## ステップ2: GitHub Secrets設定

GitHubリポジトリのSettings > Secrets and variables > Actionsを開く

### 必須シークレット

| シークレット名 | 説明 | 取得元 |
|--------------|------|--------|
| `AWS_ROLE_TO_ASSUME` | デプロイ用Role ARN | CloudFormationの`GitHubSecretValue` |
| `AWS_INVESTIGATION_ROLE_ARN` | 調査用Role ARN | CloudFormationの`CopilotSecretValue` |
| `COST_ALERT_EMAIL` | コストアラート送信先メールアドレス | 任意のメールアドレス |

### 調査用Roleについて

`AWS_INVESTIGATION_ROLE_ARN`は、GitHub Copilot AgentがAWS MCPを使用してAWSリソースを調査するためのRole ARNです。
ReadOnlyAccess権限を持ち、AWSリソースの情報を読み取るのみで、変更はできません。

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
