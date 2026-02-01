# Premerge Checks ワークフロー

## 概要

Pull Requestに対して実行される統合テストとコード品質チェック

## トリガー

`main`ブランチへのPR作成・更新時

**実行条件**:
- mdファイルのみの変更の場合、テストジョブはスキップされる
- mdファイル以外が含まれる変更の場合、すべてのテストジョブが実行される

## ジョブ

| ジョブ | 説明 |
|-------|------|
| check-changes | `dorny/paths-filter`を使用して変更ファイルをチェックし、テスト実行の要否を判定 |
| unit-test | Lint、ビルド、ユニットテスト |
| backend-integration-test | バックエンド統合テスト |
| deploy-integration-test | CDKデプロイテスト |
| frontend-integration-test | フロントエンドE2Eテスト |
| e2e-test | エンドツーエンドテスト |

## パフォーマンス最適化

### キャッシュ戦略

ビルド時間を短縮するため、以下のキャッシュを使用:

1. **npm依存関係**: `actions/setup-node@v4`の`cache: 'npm'`機能を使用
2. **TypeScriptビルド成果物**: `dist/`と`.tsbuildinfo`をキャッシュ
3. **Playwrightブラウザ**: `~/.cache/ms-playwright`をキャッシュ（約500MB）
4. **グローバルnpmパッケージ**: CDK CLIなどを`~/.npm-global`にキャッシュ

### キャッシュキー

- **TypeScriptビルド**: `${{ runner.os }}-ts-build-${{ hashFiles('**/tsconfig*.json', '**/package-lock.json') }}`
- **Playwright**: `${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}`
- **グローバルnpm**: `${{ runner.os }}-npm-global-${{ hashFiles('**/package-lock.json') }}`

### 期待される効果

- TypeScriptビルド: 変更のないワークスペースのビルドをスキップ
- Playwrightブラウザ: 初回以降のダウンロード時間削減（数分→数秒）
- CDK CLI: グローバルパッケージのインストール時間削減（数十秒→数秒）
