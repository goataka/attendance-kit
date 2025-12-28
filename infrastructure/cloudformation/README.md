# CloudFormation Templates

このディレクトリには、CDKで管理できないリソースのCloudFormationテンプレートが含まれています。

## oidc-provider.yaml

GitHub Actions用のOIDC ProviderとIAMロールを管理するテンプレートです。

### なぜCloudFormationで管理するのか？

OIDC Providerは同じURL（`https://token.actions.githubusercontent.com`）で複数作成できないため、
CloudFormationからCDKへの移行ができません。そのため、CloudFormationで継続的に管理します。

### リポジトリ同期

このテンプレートはリポジトリ同期機能を使用して自動更新されます。

**設定手順**:
1. CloudFormationスタック詳細画面で「スタックアクション」→「リポジトリ同期を有効化」
2. 以下を設定:
   - リポジトリ: `goataka/attendance-kit`
   - ブランチ: `main`
   - テンプレートパス: `infrastructure/cloudformation/oidc-provider.yaml`
3. 同期を有効化

これにより、このファイルをmainブランチにマージすると、自動的にCloudFormationスタックが更新されます。

### パラメータ

- **GitHubOrg**: GitHubの組織名またはユーザー名（デフォルト: `goataka`）
- **GitHubRepo**: GitHubリポジトリ名（デフォルト: `attendance-kit`）
- **Environment**: 環境名（`dev` または `staging`）

### 出力

- **OIDCProviderArn**: OIDC ProviderのARN
- **RoleArn**: IAM RoleのARN
- **RoleName**: IAM Roleの名前
- **GitHubSecretValue**: GitHub Secretsに設定する値（`AWS_ROLE_TO_ASSUME`）
- **SetupInstructions**: セットアップ手順

### 使用方法

1. **初回デプロイ**: AWSコンソールから手動でスタックを作成
2. **リポジトリ同期設定**: スタックアクションからリポジトリ同期を有効化
3. **以降の更新**: このファイルを変更してmainブランチにマージすると自動更新

### IAMポリシー

このテンプレートで作成されるIAMロールには以下のポリシーが含まれます：

- **PowerUserAccess**: AWS管理ポリシー（初期段階では簡易設定）
- **AdditionalIAMPermissions**: CDK操作に必要な追加のIAM権限
  - IAMロールの作成・削除・変更
  - OIDC Providerの作成・削除・取得
  - CDKロール（`cdk-*`）への権限
- **CDKAssumeRolePermission**: CDK実行ロールへのAssumeRole権限

### セキュリティ

- Trust Policyでリポジトリを制限: `repo:goataka/attendance-kit:*`
- リソースを特定のパターンにスコープ
- 環境ごとに異なるロール名を使用

### 注意事項

- このテンプレートは環境ごとに別々のスタックとして作成してください
- dev環境とstaging環境で異なるスタック名を使用してください
- OIDC Providerは全環境で共有されます（同じURLのため）
