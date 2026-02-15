---
name: e2e-developer
description: E2E（End-to-End）テスト開発時に必要な検証を実施するスキルです。Cucumber + Playwrightによるフロントエンドとバックエンドの統合テストを含みます。E2Eテスト（test/e2e/）の変更時に使用してください。
---

# E2E開発スキル

このスキルは、E2E（End-to-End）テストの開発時に必要な検証を自律的に実施します。

## 利用可能なツール

- **bash**: コマンド実行、依存関係インストール、検証コマンド実行
- **view**: ファイル内容の確認
- **edit**: ファイルの編集
- **grep**: コード検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- E2Eテストコード（`test/e2e/`）を変更する場合
- Featureファイル（Gherkin形式）を追加・修正する場合
- Step definitionsを追加・修正する場合
- フロントエンドとバックエンドの統合動作を検証する場合

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

### 3. Playwrightブラウザのインストール

```bash
npx playwright install --with-deps chromium
```

**必須**: E2Eテスト実行に必要なブラウザをインストールしてください。

### 4. 全ワークスペースのビルド

```bash
npm run build
```

**必須**: コード変更後、必ず実行してください。

- Backend、Frontend、Infrastructureのビルド
- TypeScriptのコンパイル確認

### 5. E2Eテスト実行

```bash
npm run test:e2e
```

**必須**: E2Eテスト変更時は実行してください。

- Cucumber + Playwrightによる統合テスト

### 6. E2Eテストの詳細な実行手順

E2Eテストは主にCI環境で自動実行されます。

## 実行順序

**推奨される実行順序**:

1. `npm run setup` - 依存関係インストール
2. `npx playwright install --with-deps chromium` - Playwrightブラウザのインストール
3. `npm run build` - 全ワークスペースのビルド
4. `npm run test:e2e` - E2Eテスト実行

## エラー対応

### 依存関係エラーが発生した場合

```bash
# エラー詳細を確認
npm run setup

# Playwrightブラウザを再インストール
npx playwright install --with-deps chromium
```

- パッケージバージョンの競合を確認
- Node.jsバージョンを確認（24.x以上が必要）

### ビルドエラーが発生した場合

```bash
# エラー詳細を確認
npm run build

# 個別にビルド
cd apps/backend && npm run build
cd apps/frontend && npm run build
```

- TypeScriptの型エラーを確認
- インポートパスを確認
- tsconfig.jsonの設定を確認

### E2Eテストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
npm run test:e2e

# 特定のFeatureファイルのみ実行
npx cucumber-js test/e2e/features/<feature-name>.feature
```

**一般的なエラーと対処**:

1. **環境変数の問題**
   - `FRONTEND_URL`, `BACKEND_URL`, `JWT_SECRET`などが設定されているか確認
   - `.env`ファイルの設定を確認

2. **Playwrightのエラー**
   - ブラウザのインストールを確認: `npx playwright install --with-deps chromium`
   - セレクターが正しいか確認
   - 非同期処理の待機を確認

### スクリーンショット確認

E2Eテスト実行後、以下を確認してください:

- スクリーンショットが正しく取得されているか
- 画面が正しく表示されているか
- 文字化けしていないか必ず確認
- 日本語が正しく表示されているか確認

## ベストプラクティス

### コード変更時の原則

1. **変更前に既存のテストを実行**: 既存の問題を把握
2. **小さな変更を頻繁にテスト**: エラーの早期発見
3. **すべての検証を通過させる**: Premergeワークフローと同じ基準

### 検証のスキップ条件

以下の場合のみ一部の検証をスキップ可能:

- **ドキュメントのみの変更**: テスト不要
- **Featureファイルの軽微な修正**: 完全なE2E実行は不要（構文確認のみ）
- **コメントのみの変更**: ビルド確認のみ

それ以外の場合は、必ずすべての検証を実行してください。

### E2Eテストの作成ガイドライン

1. **Featureファイル（Gherkin）**
   - Given-When-Then形式で記述
   - シナリオは明確で理解しやすく
   - 日本語で記述可能

2. **Step definitions**
   - Playwrightを使用したブラウザ操作
   - 適切な待機処理を実装
   - エラーハンドリングを含める

3. **テストデータ**
   - テストごとにクリーンな状態から開始
   - DynamoDBのデータをテスト前にクリア
   - 環境変数を適切に設定

## 技術スタック

- **E2Eフレームワーク**: Cucumber + Playwright
- **言語**: TypeScript
- **ランタイム**: Node.js 24.x以上
- **ブラウザ**: Chromium (Playwright)
- **テストツール**:
  - `@cucumber/cucumber`: BDD形式のテスト記述
  - `@playwright/test`: ブラウザ自動化
  - `playwright-bdd`: CucumberとPlaywrightの統合

## Premergeワークフローとの対応

このスキルの検証項目は、GitHub ActionsのPremergeワークフローと対応しています:

| Premergeステップ                              | ローカル検証コマンド                          |
| --------------------------------------------- | --------------------------------------------- |
| `npm run setup`                               | `npm run setup`                               |
| `npx playwright install --with-deps chromium` | `npx playwright install --with-deps chromium` |
| `npm run build --workspaces --if-present`     | `npm run build`                               |
| `npm run test:e2e`                            | `npm run test:e2e`                            |

## 参考資料

- [E2E Test README](../../../test/e2e/README.md)
- [GitHub Actions ワークフロー](../../workflows/README.md)
- [Premerge Checks ワークフロー](../../workflows/premerge.yml)
- [Copilotインストラクション](../../copilot-instructions.md)
- [コーディング規約](../../instructions/coding.instructions.md)
