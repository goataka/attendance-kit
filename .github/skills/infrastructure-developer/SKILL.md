---
name: infrastructure-developer
description: Infrastructure開発時に必要な検証を実施するスキルです。ビルド、ユニットテスト、統合テスト、CDK synthを含みます。Infrastructure（infrastructure/deploy）のコード変更時に使用してください。
---

# Infrastructure開発スキル

このスキルは、Infrastructure（AWS CDK）の開発時に必要な検証を自律的に実施します。

## 利用可能なツール

- **bash**: コマンド実行、依存関係インストール、検証コマンド実行
- **view**: ファイル内容の確認
- **edit**: ファイルの編集
- **grep**: コード検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- Infrastructureコード（`infrastructure/deploy/`）を変更する場合
- CDKスタック、Construct、設定を変更する場合
- AWSリソース定義を追加・変更する場合

## 必須検証項目

### 1. プロジェクトルートへの移動

```bash
cd /home/runner/work/attendance-kit/attendance-kit
```

すべてのコマンドはプロジェクトルートから実行してください。

**注**: このパスはGitHub Actions環境用です。ローカル開発では、自身のプロジェクトルートディレクトリに置き換えてください。

### 2. 依存関係のインストール

```bash
npm run setup
```

変更前に依存関係が正しくインストールされていることを確認します。

### 3. ビルド実行

```bash
# Infrastructure個別でビルド
cd infrastructure/deploy
npm run build
```

**必須**: コード変更後、必ず実行してください。

- TypeScriptのコンパイル
- CDKコードの構文チェック
- libディレクトリへの出力確認

### 4. ユニットテスト実行

```bash
# Infrastructure個別でテスト
cd infrastructure/deploy
npm run test:unit
```

**必須**: コード変更後、必ず実行してください。

- Jestによるユニットテスト
- CDK Constructのスナップショットテスト
- スタック構成の検証

### 5. CDK Synth検証

```bash
# CloudFormationテンプレート生成
cd infrastructure/deploy
npx cdk synth --context stack=environment --context environment=dev
```

**必須**: CDKスタック変更時は実行してください。

- CloudFormationテンプレートの生成確認
- 構文エラーの検出
- リソース定義の検証

### 6. Infrastructure統合テスト実行

```bash
# Infrastructure統合テスト実行
cd infrastructure/deploy
npm run test:integration
```

**必須**: スタック構成変更時は実行してください。

- LocalStackを使用した統合テスト
- CDKデプロイのシミュレーション
- リソース作成の検証

**LocalStackのセットアップ**:
統合テストや手動でのローカルDB起動が必要な場合、以下のコマンドが利用可能です:

- `npm run start:local-db` (プロジェクトルートから) - LocalStackを起動してDynamoDBをデプロイ
- `npm run deploy:local-db` (infrastructure/deployから) - LocalStackのセットアップとブートストラップを含む完全なデプロイ

## 実行順序

**推奨される実行順序**:

1. `npm run setup` - 依存関係インストール
2. `cd infrastructure/deploy && npm run build` - ビルド確認
3. `cd infrastructure/deploy && npm run test:unit` - ユニットテスト
4. `cd infrastructure/deploy && npx cdk synth --context stack=environment --context environment=dev` - CDK Synth
5. `cd infrastructure/deploy && npm run test:integration` - 統合テスト（スタック変更時）

## エラー対応

### ビルドエラーが発生した場合

```bash
# エラー詳細を確認
cd infrastructure/deploy
npm run build
```

- TypeScriptの型エラーを修正
- CDK Constructの使用方法を確認
- インポートパスを確認
- tsconfig.jsonの設定を確認

### テストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
cd infrastructure/deploy
npm test

# 特定のテストファイルのみ実行
npm test -- <test-file-name>
```

- スナップショットを更新（`npm run test:unit`で自動更新）
- CDK Constructのプロパティを確認
- テストの期待値を確認

### CDK Synthエラーが発生した場合

```bash
# より詳細なログで実行
cd infrastructure/deploy
npx cdk synth --context stack=environment --context environment=dev --verbose
```

- Constructの初期化を確認
- Context値を確認
- CDKバージョンの互換性を確認
- リソース間の依存関係を確認

### 統合テストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
cd infrastructure/deploy
npm run test:integration

# 特定のテストファイルのみ実行
npm test -- <test-file-name>
```

- スナップショットを確認
- CDK Constructのプロパティを確認
- テストの期待値を確認
- LocalStackの状態を確認

**注**: 統合テストでLocalStackが必要な場合は、`npm run deploy:local-db`でセットアップされます。このコマンドには`cdklocal:setup`が含まれ、LocalStackを自動的に起動します。

## ベストプラクティス

### コード変更時の原則

1. **変更前に既存のテストを実行**: 既存の問題を把握
2. **小さな変更を頻繁にテスト**: エラーの早期発見
3. **CDK Synthで構文確認**: デプロイ前にテンプレートを検証
4. **スナップショットを更新**: リソース変更時は期待値を更新

### 検証のスキップ条件

以下の場合のみ一部の検証をスキップ可能:

- **ドキュメントのみの変更**: テスト不要
- **テストファイルのみの変更**: 統合テスト不要（ユニットテストは実行）
- **コメントのみの変更**: ビルド確認のみ

それ以外の場合は、必ずすべての検証を実行してください。

### CDK Context値

CDK Synthやテストを実行する際のContext値:

- **stack**: `environment` または `dynamodb` または `account`
- **environment**: `dev` または `staging` または `prod`

例:

```bash
# Environment Stack（DynamoDB、Backend API、Frontend）
npx cdk synth --context stack=environment --context environment=dev

# DynamoDB Stack単体
npx cdk synth --context stack=dynamodb --context environment=test

# Account Stack（OIDC Provider、IAM Role）
npx cdk synth --context stack=account
```

## 技術スタック

- **IaC**: AWS CDK 2.x
- **言語**: TypeScript 5.3.0
- **ランタイム**: Node.js 24.x以上
- **テスト**: Jest 29.5.0
- **ツール**: AWS CDK CLI, AWS CDK Local

## Premergeワークフローとの対応

このスキルの検証項目は、GitHub ActionsのPremergeワークフローと対応しています:

| Premergeステップ    | ローカル検証コマンド                                   |
| ------------------- | ------------------------------------------------------ |
| `npm run setup`     | `npm run setup`                                        |
| `npm run build`     | `cd infrastructure/deploy && npm run build`            |
| `npm run test:unit` | `cd infrastructure/deploy && npm run test:unit`        |
| CDK deploy test     | `cd infrastructure/deploy && npm run test:integration` |

## 参考資料

- [Infrastructure README](../../../infrastructure/README.md)
- [Deployment Guide](../../../infrastructure/DEPLOYMENT.md)
- [GitHub Actions ワークフロー](../../workflows/README.md)
- [Premerge Checks ワークフロー](../../workflows/premerge.yml)
- [Copilotインストラクション](../../copilot-instructions.md)
- [コーディング規約](../../instructions/coding.instructions.md)
