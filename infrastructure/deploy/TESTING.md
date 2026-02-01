# Testing Guide

## Unit Tests

### 実行方法

```bash
# Unit testsのみ実行
npm run test:unit

# Integration testsのみ実行
npm run test:integration

# すべてのテスト実行
npm test
```

## Snapshot Updates

### スナップショット更新コマンド

スナップショットを更新するには、`update:snapshots`コマンドを使用します。

```bash
# スナップショットを更新
npm run update:snapshots

# ルートディレクトリから実行する場合
npm run update:snapshots --workspace=attendance-kit-infrastructure
```

### コマンド定義

```json
"update:snapshots": "jest --testPathIgnorePatterns=test/integration --updateSnapshot"
```

## スナップショット管理

スナップショットファイルは`test/__snapshots__/`に保存されます。
