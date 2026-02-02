---
name: backend-developer
description: Backend開発時に必要な検証を実施するスキルです。Lint、ビルド、ユニットテスト、統合テスト、OpenAPI仕様生成を含みます。Backend（apps/backend）のコード変更時に使用してください。
---

# Backend開発スキル

このスキルは、Backend（NestJS）の開発時に必要な検証を自律的に実施します。

## 利用可能なツール

- **bash**: コマンド実行、依存関係インストール、検証コマンド実行
- **view**: ファイル内容の確認
- **edit**: ファイルの編集
- **grep**: コード検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- Backendコード（`apps/backend/`）を変更する場合
- Backend APIの新規実装や修正を行う場合
- NestJSのコントローラー、サービス、エンティティを変更する場合

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

### 3. Lint実行

```bash
npm run lint
```

**必須**: コード変更後、必ず実行してください。
- ESLintによるコードスタイルチェック
- TypeScriptの型チェック
- 未使用変数・インポートの検出

### 4. ビルド実行

```bash
npm run build
```

**必須**: コード変更後、必ず実行してください。
- TypeScriptのコンパイル
- Distディレクトリへの出力確認

### 5. ユニットテスト実行

```bash
npm run test:unit
```

**必須**: コード変更後、必ず実行してください。
- Jestによるユニットテスト
- スナップショットテストの更新（必要に応じて）

### 6. Backend統合テスト実行

**事前準備**: LocalStackを起動してください。

```bash
# LocalStackの起動確認
docker ps | grep localstack

# LocalStackが起動していない場合は起動
docker-compose up -d localstack
```

```bash
# Backend統合テストのみ実行
cd apps/backend
npm run test:integration
```

**必須**: API関連のコード変更時は実行してください。
- DynamoDBとの統合テスト（LocalStack使用）
- エンドポイントの動作確認

### 7. OpenAPI仕様の生成

```bash
npm run generate
```

**必須**: APIエンドポイントやDTOを変更した場合は実行してください。
- OpenAPI仕様（`apps/backend/api/openapi.json`）の自動生成
- Swagger UIで確認可能

## 実行順序

**推奨される実行順序**:

1. `npm run setup` - 依存関係インストール
2. `npm run lint` - コードスタイルチェック
3. `npm run build` - ビルド確認
4. `npm run test:unit` - ユニットテスト
5. `cd apps/backend && npm run test:integration` - 統合テスト（API変更時）
6. `npm run generate` - OpenAPI仕様生成（API変更時）

## エラー対応

### Lintエラーが発生した場合

```bash
# エラー詳細を確認
npm run lint

# 自動修正可能なものは修正
cd apps/backend
npm run lint
```

- 未使用変数・インポートを削除
- 型定義を追加
- コードスタイルを修正

### ビルドエラーが発生した場合

```bash
# エラー詳細を確認
npm run build

# 型エラーを確認
cd apps/backend
npm run build
```

- TypeScriptの型エラーを修正
- インポートパスを確認
- tsconfig.jsonの設定を確認

### テストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
npm test

# 特定のテストファイルのみ実行
cd apps/backend
npm test -- <test-file-name>
```

- テストロジックを確認
- モックの設定を確認
- スナップショットを更新（`npm run test:unit`で自動更新）

### 統合テストエラーが発生した場合

LocalStackが起動していることを確認:

```bash
# LocalStack起動確認
docker ps | grep localstack

# LocalStackが起動していない場合
docker-compose up -d localstack
```

## ベストプラクティス

### コード変更時の原則

1. **変更前に既存のテストを実行**: 既存の問題を把握
2. **小さな変更を頻繁にテスト**: エラーの早期発見
3. **すべての検証を通過させる**: Premergeワークフローと同じ基準
4. **自動生成ファイルをコミット**: OpenAPI仕様やスナップショット

### 検証のスキップ条件

以下の場合のみ一部の検証をスキップ可能:

- **ドキュメントのみの変更**: テスト不要
- **テストファイルのみの変更**: 統合テスト不要（ユニットテストは実行）
- **コメントのみの変更**: ビルド確認のみ

それ以外の場合は、必ずすべての検証を実行してください。

## 技術スタック

- **フレームワーク**: NestJS 10.x
- **言語**: TypeScript 5.1.x
- **ランタイム**: Node.js 24.x以上
- **データベース**: DynamoDB (AWS SDK v3)
- **認証**: JWT (Passport)
- **テスト**: Jest + Supertest
- **ビルドツール**: NestJS CLI

## Premergeワークフローとの対応

このスキルの検証項目は、GitHub ActionsのPremergeワークフローと対応しています:

| Premergeステップ | ローカル検証コマンド |
|-----------------|---------------------|
| `npm run setup` | `npm run setup` |
| `npm run lint` | `npm run lint` |
| `npm run build` | `npm run build` |
| `npm run test:unit` | `npm run test:unit` |
| `npm run generate` | `npm run generate` |
| Backend統合テスト | `cd apps/backend && npm run test:integration` |

## 参考資料

- [Backend README](../../../apps/backend/README.md)
- [Premerge Checks ワークフロー](../../workflows/premerge.md)
- [Copilotインストラクション](../../copilot-instructions.md)
- [コーディング規約](../../instructions/coding.instructions.md)
