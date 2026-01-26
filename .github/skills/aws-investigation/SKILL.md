---
name: aws-investigation
description: AWS MCPを使用してAWSリソースを調査するスキルです。GitHub ActionsのOIDC認証を使ってAWSに接続し、リソース情報を取得します。AWS環境の調査を依頼された場合に使用してください。
---

# AWS調査スキル

このスキルは、AWS MCPを使用してAWSリソースを調査します。GitHub ActionsのOIDC認証を通じて読み取り専用でAWSに接続します。

## 利用可能なツール

このスキルでは以下のツールを使用します:

- **bash**: AWS CLIコマンドの実行、OIDC認証の設定
- **view**: CloudFormationテンプレートやIAM設定の確認
- **grep**: AWS関連の設定ファイルの検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- AWSリソースの調査を依頼された場合
- デプロイされたインフラの状態確認が必要な場合
- CloudFormationスタックの情報取得が必要な場合
- DynamoDBテーブルやその他のAWSリソースの情報確認が必要な場合

## 前提条件

### 必須

- GitHub Secretsに`AWS_INVESTIGATION_ROLE_ARN`が設定されていること
- CloudFormationで`GitHubCopilotInvestigationRole`が作成されていること
- GitHub ActionsがOIDC認証を使用できる環境であること

### 権限

調査用Roleは以下の権限を持ちます:

- **ポリシー**: `ReadOnlyAccess`（AWSマネージドポリシー）
- **目的**: AWSリソースの情報を読み取り専用で取得
- **制限**: リソースの作成・変更・削除は不可

## 実行手順

### 1. AWS認証情報の設定

#### 1.1 GitHub ActionsでOIDC認証を実行

**注意**: このステップはGitHub Actions環境内でのみ実行可能です。

```bash
# GitHub Actionsのワークフロー内で以下のステップを実行
# 
# - name: Configure AWS credentials for investigation
#   uses: aws-actions/configure-aws-credentials@v4
#   with:
#     role-to-assume: ${{ secrets.AWS_INVESTIGATION_ROLE_ARN }}
#     aws-region: ap-northeast-1
```

#### 1.2 認証確認

```bash
# AWS認証が成功したか確認
aws sts get-caller-identity

# 出力例:
# {
#     "UserId": "AROA...:botocore-session-1234567890",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/GitHubCopilotInvestigationRole/..."
# }
```

### 2. AWSリソースの調査

認証後、以下のようなAWS CLIコマンドを実行してリソースを調査します:

#### 2.1 CloudFormationスタックの確認

```bash
# スタック一覧を取得
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query 'StackSummaries[*].[StackName,StackStatus,CreationTime]' \
  --output table

# 特定のスタックの詳細を取得
aws cloudformation describe-stacks \
  --stack-name AttendanceKit-Dev-Stack \
  --query 'Stacks[0]' \
  --output json
```

#### 2.2 DynamoDBテーブルの確認

```bash
# テーブル一覧を取得
aws dynamodb list-tables --output json

# 特定のテーブルの詳細を取得
aws dynamodb describe-table \
  --table-name attendance-kit-dev-clock \
  --output json
```

#### 2.3 Lambda関数の確認

```bash
# Lambda関数一覧を取得
aws lambda list-functions \
  --query 'Functions[*].[FunctionName,Runtime,LastModified]' \
  --output table

# 特定の関数の詳細を取得
aws lambda get-function \
  --function-name attendance-kit-dev-backend \
  --output json
```

#### 2.4 API Gatewayの確認

```bash
# REST API一覧を取得
aws apigateway get-rest-apis \
  --query 'items[*].[name,id,createdDate]' \
  --output table

# 特定のAPIの詳細を取得
aws apigateway get-rest-api \
  --rest-api-id <api-id> \
  --output json
```

#### 2.5 S3バケットの確認

```bash
# バケット一覧を取得
aws s3 ls

# 特定のバケットの情報を取得
aws s3api get-bucket-location \
  --bucket attendance-kit-dev-frontend \
  --output json
```

### 3. 調査結果のまとめ

調査結果は以下の形式でまとめて報告します:

```markdown
## AWS調査結果

### 調査日時
YYYY-MM-DD HH:MM:SS UTC

### 認証情報
- Account ID: 123456789012
- Role: GitHubCopilotInvestigationRole
- Region: ap-northeast-1

### 調査対象リソース

#### CloudFormationスタック
- スタック名: AttendanceKit-Dev-Stack
- ステータス: CREATE_COMPLETE
- 作成日時: YYYY-MM-DD HH:MM:SS

#### DynamoDBテーブル
- テーブル名: attendance-kit-dev-clock
- ステータス: ACTIVE
- アイテム数: XXX
- サイズ: XXX MB

### 推奨事項
（必要に応じて）
```

## 使用例

### 例1: 開発環境のリソース状態確認

```bash
# CloudFormationスタックの確認
aws cloudformation describe-stacks \
  --stack-name AttendanceKit-Dev-Stack \
  --query 'Stacks[0].{Name:StackName,Status:StackStatus,Outputs:Outputs}' \
  --output json

# DynamoDBテーブルの確認
aws dynamodb describe-table \
  --table-name attendance-kit-dev-clock \
  --query 'Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount}' \
  --output json
```

### 例2: デプロイされたLambda関数の確認

```bash
# Lambda関数の一覧を取得
aws lambda list-functions \
  --query 'Functions[?starts_with(FunctionName, `attendance-kit-dev`)].[FunctionName,Runtime,LastModified]' \
  --output table

# 環境変数の確認（センシティブ情報は除外）
aws lambda get-function-configuration \
  --function-name attendance-kit-dev-backend \
  --query '{FunctionName:FunctionName,Runtime:Runtime,Timeout:Timeout,MemorySize:MemorySize}' \
  --output json
```

## トラブルシューティング

### AWS認証エラー

**症状**: `aws sts get-caller-identity`が失敗する

**原因**:
1. `AWS_INVESTIGATION_ROLE_ARN`がGitHub Secretsに設定されていない
2. CloudFormationで`GitHubCopilotInvestigationRole`が作成されていない
3. OIDC認証の設定が正しくない

**対処**:
1. GitHub SecretsでシークレットID `AWS_INVESTIGATION_ROLE_ARN`を確認
2. CloudFormationスタック `AttendanceKit-Setup-Stack`が正しくデプロイされているか確認
3. OIDC認証のステップが正しく実行されているか確認

### 権限エラー

**症状**: `AccessDenied`エラーが発生する

**原因**:
- 調査用RoleにReadOnlyAccess権限しかないため、書き込み操作を実行しようとしている

**対処**:
- このスキルは読み取り専用です。書き込み操作が必要な場合は別のワークフローを使用してください

## セキュリティ考慮事項

- このスキルはReadOnlyAccess権限のみを持つRoleを使用します
- リソースの作成・変更・削除は実行できません
- センシティブな情報（パスワード、APIキーなど）は出力しないように注意してください
- 調査結果を共有する際は、アカウントIDなどの機密情報を適切にマスクしてください

## 関連ドキュメント

- [初回セットアップ](../../../infrastructure/setup/README.md)
- [CloudFormationテンプレート](../../../infrastructure/setup/attendance-kit-setup.yaml)
- [Agent開発ガイドライン](../../agents/AGENTS.md)
