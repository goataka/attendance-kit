# run-unit-tests.sh

依存関係のインストール、TypeScriptビルド、ユニットテスト実行を行う共通スクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー
- Update CDK Snapshots ワークフロー

## 実行内容

1. 依存関係のインストール
2. TypeScriptのビルド
3. ユニットテスト実行（統合テストを除外）

## 実行方法

詳細は[スクリプトファイル](./run-unit-tests.sh)を参照してください。
