# Lambda環境変数確認スクリプト

デプロイされたLambda関数の環境変数設定を確認するスクリプトです。

## 使用方法

### 前提条件

AWS CLIがインストールされ、適切な権限で認証されていること。

### 実行

```bash
# dev環境のLambda関数を確認
./check-lambda-env.sh dev

# staging環境のLambda関数を確認
./check-lambda-env.sh staging
```

### 出力例

```
Checking Lambda function: attendance-kit-dev-api

Function configuration:
{
    "FunctionName": "attendance-kit-dev-api",
    "Runtime": "nodejs20.x",
    "LastModified": "2026-01-25T13:29:08.000+0000"
}

Environment variables:
{
    "NODE_ENV": "dev",
    "DYNAMODB_TABLE_NAME": "attendance-kit-dev-clock",
    "JWT_SECRET": "your-secret-here"
}

Checking JWT_SECRET...
✓ JWT_SECRET is set (length: 44 characters)
```

### トラブルシューティング

#### JWT_SECRETが未設定の場合

```
❌ JWT_SECRET is not set
```

**対応**: GitHub SecretsでJWT_SECRETを設定し、再デプロイしてください。

#### JWT_SECRETが空白のみの場合

```
⚠️  WARNING: JWT_SECRET contains only whitespace
```

**対応**: GitHub SecretsのJWT_SECRETを有効な値に更新し、再デプロイしてください。

## 関連ドキュメント

- [デプロイワークフロー](../../.github/workflows/deploy-environment-stack.md)
