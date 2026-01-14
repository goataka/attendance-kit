# run-tests.sh

依存関係のインストール、TypeScriptビルド、ユニットテスト実行を行う共通スクリプトです。

## 使用場所

- Pre-merge CDK Validation ワークフロー
- Update CDK Snapshots ワークフロー

## 実行内容

1. `npm ci` - 依存関係のインストール
2. `npm run build` - TypeScriptのビルド
3. `npm run test:unit` - ユニットテスト実行（統合テストを除外）

## 使用方法

```bash
cd infrastructure/deploy
./scripts/run-tests.sh
```
