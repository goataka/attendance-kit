---
name: frontend-developer
description: Frontend開発時に必要な検証を実施するスキルです。Lint、ビルド、ユニットテスト、E2Eテストを含みます。Frontend（apps/frontend）のコード変更時に使用してください。
---

# Frontend開発スキル

このスキルは、Frontend（React + Vite）の開発時に必要な検証を自律的に実施します。

## 利用可能なツール

- **bash**: コマンド実行、依存関係インストール、検証コマンド実行
- **view**: ファイル内容の確認
- **edit**: ファイルの編集
- **grep**: コード検索

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- Frontendコード（`apps/frontend/`）を変更する場合
- Reactコンポーネント、画面、スタイルを変更する場合
- UIの新規実装や修正を行う場合

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
- React Hooksの使用ルールチェック
- 未使用変数・インポートの検出

### 4. ビルド実行

```bash
npm run build
```

**必須**: コード変更後、必ず実行してください。
- TypeScriptの型チェック
- Viteによるプロダクションビルド
- 静的ファイルの生成確認（`apps/frontend/dist/`）

### 5. ユニットテスト実行

```bash
npm run test:unit
```

**必須**: コード変更後、必ず実行してください。
- Vitestによるユニットテスト
- React Testing Libraryによるコンポーネントテスト
- スナップショットテストの更新（必要に応じて）

**スナップショット確認**:
- スナップショットが更新された場合、内容を確認してください
- 文字化けしていないか必ず確認してください
- 日本語が正しく表示されているか確認してください

### 6. Frontend E2Eテスト実行

```bash
# Frontend E2Eテストのみ実行
cd apps/frontend
npm run test:integration
```

**必須**: UI変更時は実行してください。
- Playwrightによるブラウザテスト
- 画面遷移の動作確認
- ユーザー操作のシミュレーション

**スクリーンショット確認**:
- E2Eテスト実行後、スクリーンショットを確認してください
- 画面が正しく表示されているか確認してください
- 文字化けしていないか必ず確認してください
- 日本語が正しく表示されているか確認してください

## 実行順序

**推奨される実行順序**:

1. `npm run setup` - 依存関係インストール
2. `npm run lint` - コードスタイルチェック
3. `npm run build` - ビルド確認
4. `npm run test:unit` - ユニットテスト
5. `cd apps/frontend && npm run test:integration` - E2Eテスト（UI変更時）

## エラー対応

### Lintエラーが発生した場合

```bash
# エラー詳細を確認
npm run lint

# Frontend個別でも確認可能
cd apps/frontend
npm run lint
```

- 未使用変数・インポートを削除
- 型定義を追加
- React Hooksのルールに従う（useEffectの依存配列など）
- コードスタイルを修正

### ビルドエラーが発生した場合

```bash
# エラー詳細を確認
npm run build

# 型チェックのみ実行
cd apps/frontend
npm run build:check
```

- TypeScriptの型エラーを修正
- インポートパスを確認
- tsconfig.jsonの設定を確認
- Viteの設定を確認

### テストエラーが発生した場合

```bash
# 失敗したテストの詳細を確認
npm test

# 特定のテストファイルのみ実行
cd apps/frontend
npm test -- <test-file-name>
```

- テストロジックを確認
- モックの設定を確認（APIモックなど）
- Testing Libraryのクエリを確認

### E2Eテストエラーが発生した場合

```bash
# Playwrightのデバッグモードで実行
cd apps/frontend
npm run test:integration -- --debug

# 特定のテストのみ実行
npm run test:integration -- <test-file-name>
```

- セレクターが正しいか確認
- 非同期処理の待機を確認
- テスト環境の初期化を確認
- スクリーンショットで画面状態を確認
- 文字化けが発生していないか確認

## ベストプラクティス

### コード変更時の原則

1. **変更前に既存のテストを実行**: 既存の問題を把握
2. **小さな変更を頻繁にテスト**: エラーの早期発見
3. **すべての検証を通過させる**: Premergeワークフローと同じ基準
4. **UIの変更はE2Eテストで確認**: 実際のブラウザで動作確認

### 検証のスキップ条件

以下の場合のみ一部の検証をスキップ可能:

- **ドキュメントのみの変更**: テスト不要
- **テストファイルのみの変更**: E2Eテスト不要（ユニットテストは実行）
- **スタイルのみの変更**: ユニットテストのみ実行（E2Eは推奨）

それ以外の場合は、必ずすべての検証を実行してください。

### Storybookの活用

開発時はStorybookでコンポーネントを確認:

```bash
cd apps/frontend
npm run storybook
```

- コンポーネントの単体表示
- 各状態の確認
- インタラクションのテスト

## 技術スタック

- **フレームワーク**: React 18.3.1
- **ビルドツール**: Vite 6.0.3
- **言語**: TypeScript 5.7.2
- **ルーティング**: React Router 6.26.2
- **テスト**: Vitest 2.1.8 + React Testing Library 16.1.0
- **E2E**: Playwright 1.48.0
- **Lint**: ESLint 9.15.0

## Premergeワークフローとの対応

このスキルの検証項目は、GitHub ActionsのPremergeワークフローと対応しています:

| Premergeステップ | ローカル検証コマンド |
|-----------------|---------------------|
| `npm run setup` | `npm run setup` |
| `npm run lint` | `npm run lint` |
| `npm run build` | `npm run build` |
| `npm run test:unit` | `npm run test:unit` |
| Frontend E2Eテスト | `cd apps/frontend && npm run test:integration` |

## 参考資料

- [Frontend README](../../../apps/frontend/README.md)
- [GitHub Actions ワークフロー](../../workflows/README.md)
- [Premerge Checks ワークフロー](../../workflows/premerge.yml)
- [Copilotインストラクション](../../copilot-instructions.md)
- [コーディング規約](../../instructions/coding.instructions.md)
