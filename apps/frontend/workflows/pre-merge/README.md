# Pre-Merge Checks

## 概要

フロントエンドのpre-mergeチェック用Composite Actionです。ユニットテストとインテグレーションテストを実行します。

## 前提条件

このComposite Actionを使用する前に、以下の準備が必要です：

- Node.js環境のセットアップ（`actions/setup-node@v4`）
- リポジトリのチェックアウト（`actions/checkout@v4`）

## 使用方法

frontend-pr.ymlから以下のように呼び出します：

```yaml
pre-merge-checks:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: apps/frontend/package-lock.json
    
    - uses: ./apps/frontend/workflows/pre-merge
```

## 実行内容

1. 依存関係のインストール（`npm ci`）
2. Playwrightブラウザのインストール（`npx playwright install --with-deps chromium`）
3. ユニットテストの実行（`./scripts/run-unit-tests.sh`）
4. インテグレーションテストの実行（`./scripts/run-integration-tests.sh`）

## 関連ファイル

- [run-unit-tests.sh](../../scripts/run-unit-tests.sh) - ユニットテスト実行スクリプト
- [run-integration-tests.sh](../../scripts/run-integration-tests.sh) - インテグレーションテスト実行スクリプト
