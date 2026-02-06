# CI/CD デプロイメント戦略

## アーキテクチャ概要

### デプロイメントフロー

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant AWS as AWS
    participant CF as CloudFormation
    participant DB as DynamoDB

    Dev->>GH: Push to main
    GH->>GA: Trigger workflow
    GA->>GA: Test & Build
    GA->>AWS: OIDC Authentication
    AWS->>GA: Temporary credentials
    GA->>AWS: CDK Deploy
    AWS->>CF: Create/Update Stack
    CF->>DB: Create/Update Table
    CF->>GA: Stack outputs
```

## セキュリティアーキテクチャ

### OIDC認証

```mermaid
graph LR
    A[GitHub Actions] -->|OIDC| B[OIDC Provider]
    B -->|Trust Policy| C[IAM Role]
    C -->|Permissions| D[CloudFormation]
    C -->|Permissions| E[DynamoDB]
    C -->|Permissions| F[S3 CDK Assets]
```

### セキュリティ原則

- 最小権限の原則
- リポジトリ制限（特定リポジトリのみがロール引き受け可能）
- 一時認証情報（1時間で自動失効）
- データ暗号化（保存時・転送時）

## デプロイメント戦略

### 自動デプロイ

`apps/`または`infrastructure/`配下の対象ファイルが`main`ブランチにマージされた時に自動実行 (apps/websiteは対象外)

### 環境管理

各環境は独立したAWSリソースを持ちます:
- eva (AWS環境)
- stg (AWS環境、未実装)
- prod (AWS環境、未実装)

ローカル環境:
- dev (ローカル開発環境)
- test (ローカルテスト環境)
