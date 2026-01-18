# Pre-Merge Checks

## 概要

フロントエンドのpre-mergeチェック用Composite Actionです。ユニットテストとインテグレーションテストを実行します。

## 使用方法

frontend-pr.ymlから以下のように呼び出します：

```yaml
pre-merge-checks:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: ./apps/frontend/workflows/pre-merge
```

## 実行内容

1. 依存関係のインストール（`npm ci`）
2. ユニットテストの実行（`./scripts/run-unit-tests.sh`）
3. インテグレーションテストの実行（`./scripts/run-integration-tests.sh`）

## 関連ファイル

- [run-unit-tests.sh](../../scripts/run-unit-tests.sh) - ユニットテスト実行スクリプト
- [run-integration-tests.sh](../../scripts/run-integration-tests.sh) - インテグレーションテスト実行スクリプト
