# Infrastructure Deploy Scripts

このディレクトリには、CDKインフラストラクチャのビルド、テスト、デプロイに関連するスクリプトが含まれています。

## スクリプト一覧

### [run-tests.sh](./run-tests.sh)
依存関係のインストール、TypeScriptビルド、ユニットテスト実行を行う共通スクリプトです。

**使用場所**:
- Pre-merge CDK Validation ワークフロー
- Update CDK Snapshots ワークフロー

**実行内容**:
1. `npm ci` - 依存関係のインストール
2. `npm run build` - TypeScriptのビルド
3. `npm test -- --testPathIgnorePatterns=test/integration` - ユニットテスト実行（統合テストを除外）

**使用方法**:
```bash
cd infrastructure/deploy
./scripts/run-tests.sh
```

### [validate-cdk-localstack.sh](./validate-cdk-localstack.sh)
LocalStackを使用したCDK検証を実行するスクリプトです。

**使用場所**:
- Pre-merge CDK Validation ワークフロー

**実行内容**:
1. LocalStackコンテナの起動
2. LocalStackの起動待機とヘルスチェック
3. 環境変数の確認とデバッグ出力
4. CDK Bootstrap
5. CDK Synth
6. CDK Deploy
7. DynamoDB統合テスト実行
8. クリーンアップ（trap機能による確実なLocalStack停止）

**使用方法**:
```bash
cd infrastructure/deploy
./scripts/validate-cdk-localstack.sh
```

**必要な環境変数**:
- `AWS_ACCESS_KEY_ID`: テスト用ダミー認証情報
- `AWS_SECRET_ACCESS_KEY`: テスト用ダミー認証情報
- `AWS_DEFAULT_REGION`: デプロイ先リージョン

## 注意事項

- すべてのスクリプトは実行可能にする必要があります（`chmod +x scripts/*.sh`）
- スクリプトは `infrastructure/deploy` ディレクトリで実行されることを前提としています
- エラー発生時は即座に停止します（`set -euo pipefail`）
