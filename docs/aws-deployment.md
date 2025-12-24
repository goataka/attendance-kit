# AWS Development Environment Deployment

このドキュメントでは、開発環境をAWSにデプロイするためのCI/CDワークフローについて説明します。

## 概要

開発環境のDockerコンテナをAmazon ECS (Elastic Container Service)にデプロイするGitHub Actionsワークフローを提供します。

## アーキテクチャ

```
GitHub Actions
    ↓
  [Build Docker Image]
    ↓
Amazon ECR (Container Registry)
    ↓
Amazon ECS (Fargate)
    ↓
  [Development Environment]
```

## 前提条件

### 1. AWS Resources

以下のAWSリソースを事前に作成する必要があります：

#### ECR Repository
```bash
aws ecr create-repository \
  --repository-name spec-kit-dev-environment \
  --region ap-northeast-1
```

#### ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name spec-kit-dev-cluster \
  --region ap-northeast-1
```

#### ECS Task Definition
タスク定義を作成します。以下はサンプルです：

```json
{
  "family": "spec-kit-dev-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "spec-kit-dev-container",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/spec-kit-dev-environment:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/spec-kit-dev",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/ecsTaskExecutionRole"
}
```

#### ECS Service
```bash
aws ecs create-service \
  --cluster spec-kit-dev-cluster \
  --service-name spec-kit-dev-service \
  --task-definition spec-kit-dev-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region ap-northeast-1
```

### 2. GitHub OIDC Configuration

GitHub ActionsからAWSへの認証にOIDC (OpenID Connect)を使用します。

#### IAM Identity Provider作成
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

#### IAM Role作成
以下のポリシーを持つIAMロールを作成します：

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:goataka/spec-kit-with-coding-agent:*"
        }
      }
    }
  ]
}
```

**Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/ecsTaskExecutionRole"
    }
  ]
}
```

### 3. GitHub Secrets設定

GitHubリポジトリに以下のSecretsを設定します：

Settings → Secrets and variables → Actions → New repository secret

- `AWS_ROLE_TO_ASSUME`: IAMロールのARN (例: `arn:aws:iam::123456789012:role/GitHubActionsRole`)

## ワークフローの使用方法

### 手動実行

1. GitHubリポジトリのActionsタブを開く
2. "Deploy Development Environment to AWS"ワークフローを選択
3. "Run workflow"をクリック
4. 環境を選択 (dev または staging)
5. "Run workflow"を実行

### 自動実行

以下の条件で自動的に実行されます：
- `main`ブランチに`.devcontainer/**`または`.github/workflows/deploy-dev-to-aws.yml`の変更がpushされた時

## ワークフロー詳細

### ステップ

1. **Checkout code**: ソースコードをチェックアウト
2. **Configure AWS credentials**: OIDCを使用してAWS認証情報を取得
3. **Login to Amazon ECR**: ECRにログイン
4. **Build Docker image**: DevContainerベースのDockerイメージをビルド
5. **Push to ECR**: イメージをECRにプッシュ
6. **Update ECS task definition**: タスク定義を更新
7. **Deploy to ECS**: ECSサービスにデプロイ

### 環境変数

ワークフローファイル内で以下の環境変数を設定できます：

- `AWS_REGION`: AWSリージョン (デフォルト: ap-northeast-1)
- `ECR_REPOSITORY`: ECRリポジトリ名
- `ECS_SERVICE`: ECSサービス名
- `ECS_CLUSTER`: ECSクラスター名
- `ECS_TASK_DEFINITION`: タスク定義名
- `CONTAINER_NAME`: コンテナ名

## トラブルシューティング

### ECR Login Failed
- IAMロールのポリシーを確認
- OIDCプロバイダーが正しく設定されているか確認

### ECS Deployment Failed
- タスク定義が存在するか確認
- セキュリティグループとサブネットの設定を確認
- ECSタスク実行ロールの権限を確認

### Docker Build Failed
- `.devcontainer/Dockerfile`のビルドログを確認
- ベースイメージのpull制限に達していないか確認

## セキュリティ考慮事項

1. **OIDC使用**: AWS Access Keyを使用せず、OIDCベースの認証を推奨
2. **最小権限の原則**: IAMロールには必要最小限の権限のみを付与
3. **環境変数の保護**: GitHub Secretsを使用して機密情報を管理
4. **イメージスキャン**: ECRのイメージスキャン機能を有効化することを推奨

## コスト最適化

1. **Fargate Spot**: 開発環境にはFargate Spotの使用を検討
2. **自動停止**: 使用していない時間帯は自動的にタスク数を0にするスケジューリングを設定
3. **リソース最適化**: CPUとメモリの使用量を監視し、適切なサイズに調整

## 参考資料

- [GitHub Actions - AWS認証](https://github.com/aws-actions/configure-aws-credentials)
- [Amazon ECR - ドキュメント](https://docs.aws.amazon.com/ecr/)
- [Amazon ECS - ドキュメント](https://docs.aws.amazon.com/ecs/)
- [GitHub OIDC - AWS連携](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
