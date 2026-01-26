# Copilot Setup Steps

## 概要

GitHub Copilot Agentのセットアップ手順を検証するワークフロー。
AWS調査機能を含む環境のセットアップを確認します。

## 目的

- Node.js 24環境のセットアップ確認
- AWS認証情報の設定確認（調査用Role）
- GitHub Copilot AgentがAWS MCPを使用するための環境検証

## トリガー

- 手動実行（`workflow_dispatch`）
- `.github/workflows/copilot-setup-steps.yml`への変更時（push/PR）

## 前提条件

### 必須

- Node.js 24

### オプション

- `AWS_INVESTIGATION_ROLE_ARN`: GitHub Copilot Agent用の調査用Role ARN
  - 設定されている場合、AWS認証と接続確認を実行
  - 設定されていない場合、警告メッセージを表示して続行

## ステップ

1. **Setup Node.js 24**: Node.js 24環境をセットアップ
2. **Verify Node.js version**: Node.jsとnpmのバージョンを確認
3. **Configure AWS credentials for investigation**: AWS調査用認証情報を設定
   - OIDCを使用して`AWS_INVESTIGATION_ROLE_ARN`のRoleを引き受け
   - `continue-on-error: true`で失敗しても続行
4. **Verify AWS access**: AWS接続を確認
   - リージョン情報を表示
   - 認証情報が設定されていない場合は警告を表示
   - **セキュリティ**: Account IDやRole ARNなどの機密情報は出力しません

## AWS調査用Roleについて

`AWS_INVESTIGATION_ROLE_ARN`は、GitHub Copilot AgentがAWS MCPを使用してAWSリソースを調査するために必要です。

### 権限

- **ポリシー**: `ReadOnlyAccess`（AWSマネージドポリシー）
- **目的**: AWSリソースの情報を読み取り専用で取得
- **制限**: リソースの作成・変更・削除は不可

### セットアップ方法

[infrastructure/setup/README.md](../../infrastructure/setup/README.md)を参照してください。

## セキュリティ考慮事項

- 認証情報の詳細（Account ID、Role ARNなど）は標準出力に出力しません
- AWS接続の成功/失敗のみを確認します
- リージョン情報のみを表示します

## 関連ドキュメント

- [初回セットアップ](../../infrastructure/setup/README.md)
- [AWS調査スキル](../skills/aws-investigation/SKILL.md)
- [Agent開発ガイドライン](../agents/AGENTS.md)
