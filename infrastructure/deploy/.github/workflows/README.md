# Infrastructure Deploy Workflows

このディレクトリには、CDKインフラストラクチャのデプロイとテストに関連するGitHub Actionsワークフローが含まれています。

## ワークフロー一覧

### [Pre-merge CDK Validation](./premerge-cdk.yml)
Pull RequestでCDK関連ファイルに変更があった場合に自動実行され、LocalStackを使用してCDKスタックの検証を行います。

- **トリガー**: CDK関連ファイルの変更
- **実行内容**:
  - TypeScriptビルド
  - ユニットテスト
  - LocalStackへのCDKデプロイ
  - DynamoDB統合テスト
- **詳細**: [premerge-cdk.md](./premerge-cdk.md)

### [Update CDK Snapshots](./update-cdk-snapshots.yml)
CDK関連ファイルが変更されたPull Requestに対して、自動的にスナップショットを更新します。

- **トリガー**: CDK関連ファイルの変更
- **実行内容**:
  - スナップショットの自動更新
  - 変更の自動コミット・プッシュ
- **詳細**: [update-cdk-snapshots.md](./update-cdk-snapshots.md)

## Scripts

### [validate-cdk-localstack.sh](../../scripts/validate-cdk-localstack.sh)
LocalStackを使用したCDK検証を実行するスクリプトです。Pre-merge CDK Validationワークフローから呼び出されます。

- LocalStackの起動確認
- CDK Bootstrap
- CDK Synth
- CDK Deploy
- 統合テスト実行

## ローカルでの実行

ワークフローをローカル環境で再現する方法:

```bash
cd infrastructure/deploy

# 依存関係インストール
npm ci

# ビルド
npm run build

# ユニットテスト
npm test -- --testPathIgnorePatterns=test/integration

# LocalStack起動
npm run localstack:start

# LocalStack検証スクリプト実行
./scripts/validate-cdk-localstack.sh

# クリーンアップ
npm run localstack:stop
```

## 関連ドキュメント

- [LocalStack使用方法](../../LOCALSTACK.md)
- [インフラストラクチャREADME](../../README.md)
- [ルートワークフローREADME](../../../../.github/workflows/README.md)
