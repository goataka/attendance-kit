# Spec-Kit Infrastructure

AWS CDKを使用したDynamoDB Clock Tableのインフラストラクチャコードです。

## 📋 前提条件

- Node.js 20以上
- AWS CLI v2
- AWS CDKアカウント（初回のみCloudFormationでOIDCとIAMロールをセットアップ）
- GitHub Actions用のAWS IAMロール設定（OIDC経由）

## 🏗️ 構成

このインフラストラクチャには以下が含まれます：

- **DynamoDB Table**: `spec-kit-{environment}-clock`
  - Partition Key: `userId` (String)
  - Sort Key: `timestamp` (String, ISO 8601形式)
  - Global Secondary Index: `DateIndex` (date + timestamp)
  - 課金モード: Pay-Per-Request
  - Point-in-Time Recovery有効
  - AWS管理キー暗号化

- **OIDC Provider**: GitHub Actions用
- **IAM Role**: GitHub ActionsがAWSリソースにアクセスするためのロール

## 🚀 初回セットアップ手順

### ステップ1: CloudFormationでOIDCプロバイダーとIAMロールを作成（初回のみ）

初回のみ、CloudFormationを使用してOIDCプロバイダーとIAMロールを手動で作成します。

1. AWSコンソールでCloudFormationサービスを開く
2. 新しいスタックを作成
3. 以下のテンプレートを使用（または `docs/setup/bootstrap-oidc.yaml` を参照）

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'GitHub Actions OIDC Provider and IAM Role for initial bootstrap'

Parameters:
  GitHubOrg:
    Type: String
    Default: goataka
  GitHubRepo:
    Type: String
    Default: spec-kit-with-coding-agent
  RoleName:
    Type: String
    Default: GitHubActionsDeployRole-Initial

Resources:
  GitHubOIDCProvider:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://token.actions.githubusercontent.com
      ClientIdList:
        - sts.amazonaws.com
      ThumbprintList:
        - 6938fd4d98bab03faadb97b34396831e3780aea1
  
  GitHubActionsRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Ref RoleName
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Federated: !GetAtt GitHubOIDCProvider.Arn
            Action: sts:AssumeRoleWithWebIdentity
            Condition:
              StringEquals:
                token.actions.githubusercontent.com:aud: sts.amazonaws.com
              StringLike:
                token.actions.githubusercontent.com:sub: !Sub 'repo:${GitHubOrg}/${GitHubRepo}:*'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/PowerUserAccess
      Policies:
        - PolicyName: AdditionalIAMPermissions
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - iam:CreateRole
                  - iam:DeleteRole
                  - iam:AttachRolePolicy
                  - iam:DetachRolePolicy
                  - iam:PutRolePolicy
                  - iam:DeleteRolePolicy
                  - iam:GetRole
                  - iam:PassRole
                  - iam:TagRole
                  - iam:CreateOpenIDConnectProvider
                  - iam:DeleteOpenIDConnectProvider
                  - iam:GetOpenIDConnectProvider
                  - iam:TagOpenIDConnectProvider
                Resource:
                  - !Sub 'arn:aws:iam::${AWS::AccountId}:role/cdk-*'
                  - !Sub 'arn:aws:iam::${AWS::AccountId}:role/GitHubActionsDeployRole-*'
                  - !Sub 'arn:aws:iam::${AWS::AccountId}:oidc-provider/token.actions.githubusercontent.com'

Outputs:
  RoleArn:
    Description: ARN of the GitHub Actions IAM Role
    Value: !GetAtt GitHubActionsRole.Arn
```

4. スタックを作成
5. OutputsタブからロールARNをコピー

### ステップ2: GitHub Secretsを設定

1. GitHubリポジトリの Settings > Secrets and variables > Actions を開く
2. New repository secret をクリック
3. `AWS_ROLE_TO_ASSUME` という名前で、ステップ1で取得したロールARNを設定

### ステップ3: CDKをデプロイ（GitHub Actions使用）

1. GitHub Actions タブを開く
2. "Deploy to AWS" ワークフローを選択
3. "Run workflow" をクリック
4. 環境として "dev" を選択して実行

このデプロイで、CDK管理のOIDCプロバイダーとIAMロールが作成されます。

### ステップ4: GitHub Secretsを更新

1. デプロイ完了後、AWS CloudFormationコンソールで `SpecKit-Dev-Stack` の Outputs を確認
2. `GitHubActionsRoleArn` の値をコピー
3. GitHub Secrets の `AWS_ROLE_TO_ASSUME` を新しいARNに更新

### ステップ5: 初回CloudFormationスタックを削除

1. AWS CloudFormationコンソールを開く
2. 初回に作成したスタックを選択
3. "削除" をクリック

これ以降は、CDK管理のOIDCとIAMロールが使用されます。

## 💻 ローカル開発

### 依存関係のインストール

```bash
cd infrastructure
npm install
```

### ビルド

```bash
npm run build
```

### テスト実行

```bash
npm test
```

### CDK Synth（CloudFormationテンプレート生成）

```bash
# dev環境用
npx cdk synth --context environment=dev

# staging環境用
npx cdk synth --context environment=staging
```

### ローカルからのデプロイ（非推奨）

通常はGitHub Actions経由でデプロイしますが、必要に応じてローカルからもデプロイ可能です：

```bash
# AWS認証情報を設定
export AWS_PROFILE=your-profile

# Bootstrap（初回のみ）
npx cdk bootstrap --context environment=dev

# デプロイ
npx cdk deploy --context environment=dev
```

## 🔄 通常運用時のデプロイフロー

1. `infrastructure/` 配下のファイルを変更
2. PRを作成してレビュー
3. `main` ブランチにマージ
4. GitHub Actionsが自動的にデプロイを実行

または、手動でデプロイを実行：

1. GitHub Actions タブを開く
2. "Deploy to AWS" ワークフローを選択
3. "Run workflow" をクリックして環境を選択

## 📦 CDK Synth（手動テンプレート生成）

CloudFormationテンプレートを確認したい場合：

1. GitHub Actions タブを開く
2. "CDK Synth" ワークフローを選択
3. "Run workflow" をクリックして環境を選択
4. 完了後、Artifacts からテンプレートをダウンロード

## 🧪 テスト

```bash
npm test
```

ユニットテストには以下が含まれます：
- DynamoDBテーブルが正しく作成される
- Partition KeyとSort Keyが正しく設定される
- Global Secondary Indexが存在する
- Point-in-Time Recoveryが有効
- RETAIN削除ポリシーが設定される
- OIDCプロバイダーとIAMロールが作成される

## 📊 スタック出力

デプロイ完了後、以下の出力が利用可能：

- `TableName`: DynamoDBテーブル名
- `TableArn`: DynamoDBテーブルARN
- `GSIName`: Global Secondary Index名
- `Environment`: デプロイ環境
- `GitHubActionsRoleArn`: GitHub Actions用IAMロールARN
- `OIDCProviderArn`: OIDCプロバイダーARN

## 🔍 トラブルシューティング

### CDK Bootstrapエラー

```bash
# Bootstrapが必要な場合は手動で実行
npx cdk bootstrap aws://ACCOUNT_ID/ap-northeast-1 --context environment=dev
```

### OIDC認証エラー

GitHub Secretsの `AWS_ROLE_TO_ASSUME` が正しく設定されているか確認してください。

### テーブルが既に存在するエラー

CloudFormationが差分更新を実行します。RETAIN削除ポリシーによりデータは保護されます。

## 🏷️ タグ

すべてのリソースには以下のタグが付与されます：

- `Environment`: dev / staging
- `Project`: spec-kit
- `ManagedBy`: CDK
- `CostCenter`: Engineering

## 📚 関連ドキュメント

- [仕様書](../specs/1-aws-clock-table-cicd/spec.md)
- [技術計画](../specs/1-aws-clock-table-cicd/plan.md)
- [実装タスク](../specs/1-aws-clock-table-cicd/tasks.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## 💰 コスト最適化

- DynamoDBはPay-Per-Request課金モードを使用（低トラフィック時にコスト効率的）
- CloudWatchアラームなどの有料監視機能は初期段階では実装していません
- 基本的なCloudWatchメトリクス（無料）のみを使用

## 🔐 セキュリティ

- OIDC認証により永続的な認証情報は不要
- IAMロールは特定のリソースパターンにスコープ
- DynamoDBテーブルはAWS管理キーで暗号化
- Point-in-Time Recovery有効
