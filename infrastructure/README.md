# Spec-Kit Infrastructure

AWS CDKを使用したDynamoDB Clock Tableのインフラストラクチャコードです。

## 📋 前提条件

- Node.js 22以上
- AWS CLI v2
- AWSアカウント
- CloudFormationでOIDCとIAMロールを設定する権限
- GitHub Actions用のAWS IAMロール設定（OIDC経由）

## 🏗️ 構成

このインフラストラクチャには以下が含まれます：

### CDK管理（deploy/ディレクトリ）
- **DynamoDB Table**: `attendance-kit-{environment}-clock`
  - Partition Key: `userId` (String)
  - Sort Key: `timestamp` (String, ISO 8601形式)
  - Global Secondary Index: `DateIndex` (date + timestamp)
  - 課金モード: Pay-Per-Request
  - Point-in-Time Recovery有効
  - AWS管理キー暗号化

### CloudFormation管理（setup/ディレクトリ）
- **OIDC Provider**: GitHub Actions用（`infrastructure/setup/attendance-kit-setup.yaml`）
- **IAM Role**: GitHub ActionsがAWSリソースにアクセスするためのロール

**注意**: OIDC Providerは同じURLで複数作成できないため、CloudFormationで継続的に管理します。
テンプレートファイルの変更後は、手動でCloudFormationスタックを更新してください。

## 🚀 初回セットアップ手順

詳細なセットアップ手順は [setup/README.md](setup/README.md) を参照してください。

**概要**:
1. CloudFormationでOIDCプロバイダーとIAMロールを作成（[setup/](setup/)ディレクトリ）
   - スタック名: `AttendanceKit-Setup-Stack`
2. GitHub SecretsにロールARNを設定
3. GitHub ActionsでCDKをデプロイ

## 💻 ローカル開発

### 依存関係のインストール

```bash
cd infrastructure/deploy
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

### CDK管理のリソース（DynamoDBテーブル）

1. `infrastructure/lib/` や `infrastructure/bin/` 配下のファイルを変更
2. PRを作成してレビュー
3. `main` ブランチにマージ
4. GitHub Actionsが自動的にデプロイを実行

### CloudFormation管理のリソース（OIDC、IAMロール）

CloudFormationテンプレートの更新手順は [setup/README.md](setup/README.md#テンプレートの更新) を参照してください。

または、手動でデプロイを実行：

1. GitHub Actions タブを開く
2. "Deploy to AWS" ワークフローを選択
3. "Run workflow" をクリックして環境を選択

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
- OIDCプロバイダーとIAMロールはCDKで作成されない（CloudFormation管理）

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
- `Project`: attendance-kit
- `ManagedBy`: CDK
- `CostCenter`: Engineering

## 💰 コスト最適化

- DynamoDBはPay-Per-Request課金モードを使用（低トラフィック時にコスト効率的）
- CloudWatchアラームなどの有料監視機能は初期段階では実装していません
- 基本的なCloudWatchメトリクス（無料）のみを使用

## 🔐 セキュリティ

- OIDC認証により永続的な認証情報は不要
- IAMロールは特定のリソースパターンにスコープ
- DynamoDBテーブルはAWS管理キーで暗号化
- Point-in-Time Recovery有効

## 関連ドキュメント

- [LocalStack開発環境](deploy/LOCALSTACK.md)
- [セットアップガイド](setup/README.md)
