---
name: premerge-check
description: プレマージワークフローをローカルで実行してCI/CDチェックを行います。ローカル環境でCI/CDと同等の検証を実施したい場合に使用してください。
---

# プレマージチェックスキル

このスキルは、GitHub ActionsのPremergeワークフローをローカル環境で再現し、CI/CDと同等の検証を実施します。

## 利用可能なツール

- **bash**: コマンド実行、依存関係インストール、検証コマンド実行
- **view**: ファイル内容の確認
- **grep**: コード検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- PRを作成する前にローカルでCI/CDチェックを実行したい場合
- CI/CDで発生するエラーをローカルで再現・修正したい場合
- すべてのワークスペースの変更を包括的にテストしたい場合

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

- シークレット検出（secretlint）
- Markdownリント（markdownlint）
- シェルスクリプトチェック（shellcheck）
- GitHub Actionsリント（actionlint）
- ESLint（TypeScript/JavaScript）

### 4. フォーマットチェック

```bash
npm run format:check
```

**必須**: コードスタイルの確認を行ってください。

- Prettierによるコードフォーマットチェック

### 5. ビルド実行

```bash
npm run build
```

**必須**: コード変更後、必ず実行してください。

- Backend、Frontend、Infrastructureのビルド
- TypeScriptのコンパイル確認

### 6. ユニットテスト実行

```bash
npm run test:unit
```

**必須**: コード変更後、必ず実行してください。

- すべてのワークスペースのユニットテスト
- スナップショットの更新（必要に応じて）

### 7. Backend統合テスト実行

```bash
npm run test:integration --workspace=@attendance-kit/backend
```

**必須**: Backend変更時は実行してください。

- DynamoDBとの統合テスト（LocalStack使用）
- エンドポイントの動作確認

**注**: `pretest:integration`フックにより、テスト実行前にLocalStackが自動的に起動・セットアップされます。

### 8. Frontend E2Eテスト実行

```bash
npm run test:integration --workspace=@attendance-kit/frontend
```

**必須**: Frontend変更時は実行してください。

- Playwrightによるブラウザテスト
- 画面遷移の動作確認

### 9. Infrastructure統合テスト実行

```bash
npm run test:integration --workspace=@attendance-kit/deploy
```

**必須**: Infrastructure変更時は実行してください。

- LocalStackを使用した統合テスト
- CDKデプロイのシミュレーション

### 10. OpenAPI仕様の生成

```bash
npm run generate
```

**必須**: APIエンドポイントやDTOを変更した場合は実行してください。

- OpenAPI仕様（`apps/backend/api/openapi.json`）の自動生成

### 11. E2Eテスト実行（オプション）

```bash
npm run test:e2e:local
```

**推奨**: フロントエンドとバックエンドの統合動作を完全にテストする場合に実行してください。

- Cucumber + Playwrightによる統合テスト
- LocalStack、Backend、Frontendサーバーの起動が必要

**注**: E2Eテストは実行に時間がかかるため、必要な場合のみ実行してください。

## 実行順序

**推奨される実行順序**:

1. `npm run setup` - 依存関係インストール
2. `npm run lint` - Lintチェック
3. `npm run format:check` - フォーマットチェック
4. `npm run build` - ビルド確認
5. `npm run test:unit` - ユニットテスト
6. `npm run test:integration --workspace=@attendance-kit/backend` - Backend統合テスト
7. `npm run test:integration --workspace=@attendance-kit/frontend` - Frontend E2Eテスト
8. `npm run test:integration --workspace=@attendance-kit/deploy` - Infrastructure統合テスト
9. `npm run generate` - OpenAPI仕様生成
10. `npm run test:e2e:local` - E2Eテスト（オプション）

## エラー対応

### Lintエラーが発生した場合

```bash
# エラー詳細を確認
npm run lint

# 個別にLintを実行
npm run lint:secrets
npm run lint:markdown
npm run lint:shellcheck
npm run lint:actionlint
```

- 未使用変数・インポートを削除
- 型定義を追加
- コードスタイルを修正
- シークレットが含まれていないか確認

### フォーマットエラーが発生した場合

```bash
# 自動修正
npm run format

# 再度チェック
npm run format:check
```

- Prettierによる自動フォーマットを実行
- コミット前に必ずフォーマットを適用

### ビルドエラーが発生した場合

```bash
# エラー詳細を確認
npm run build

# 個別にビルド
npm run build --workspace=@attendance-kit/backend
npm run build --workspace=@attendance-kit/frontend
npm run build --workspace=@attendance-kit/deploy
```

- TypeScriptの型エラーを修正
- インポートパスを確認
- tsconfig.jsonの設定を確認

### テストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
npm test

# 個別にテスト実行
npm test --workspace=@attendance-kit/backend
npm test --workspace=@attendance-kit/frontend
npm test --workspace=@attendance-kit/deploy
```

- テストロジックを確認
- モックの設定を確認
- スナップショットを更新

## ベストプラクティス

### コード変更時の原則

1. **変更前に既存のテストを実行**: 既存の問題を把握
2. **小さな変更を頻繁にテスト**: エラーの早期発見
3. **すべての検証を通過させる**: Premergeワークフローと同じ基準
4. **自動生成ファイルをコミット**: OpenAPI仕様やスナップショット

### 検証のスキップ条件

以下の場合のみ一部の検証をスキップ可能:

- **ドキュメントのみの変更**: テスト不要（Lint、フォーマットは実行）
- **特定ワークスペースのみの変更**: 他のワークスペースの統合テストは不要
- **コメントのみの変更**: ビルド確認のみ

それ以外の場合は、必ずすべての検証を実行してください。

## Premergeワークフローとの対応

このスキルの検証項目は、GitHub ActionsのPremergeワークフローと完全に対応しています:

| Premergeステップ                       | ローカル検証コマンド                           |
| -------------------------------------- | ---------------------------------------------- |
| `npm run setup`                        | `npm run setup`                                |
| `npm run lint`                         | `npm run lint`                                 |
| `npm run format:check`                 | `npm run format:check`                         |
| `npm run build`                        | `npm run build`                                |
| `npm run test:unit`                    | `npm run test:unit`                            |
| Backend統合テスト                      | `npm run test:integration --workspace=@attendance-kit/backend`  |
| Frontend E2Eテスト                     | `npm run test:integration --workspace=@attendance-kit/frontend` |
| Infrastructure統合テスト               | `npm run test:integration --workspace=@attendance-kit/deploy` |
| `npm run generate`                     | `npm run generate`                             |
| E2Eテスト                              | `npm run test:e2e:local`                       |

## 参考資料

- [GitHub Actions ワークフロー](../../workflows/README.md)
- [Premerge Checks ワークフロー](../../workflows/premerge.yml)
- [Copilotインストラクション](../../copilot-instructions.md)
- [コーディング規約](../../instructions/coding.instructions.md)
