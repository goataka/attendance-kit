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

### スナップショット更新の方針

**重要**: `test:unit`コマンドは通常のテスト実行のみを行い、スナップショットは更新しません。スナップショットの更新は`update:snapshots`コマンドで明示的に実行します。

```json
"test:unit": "jest --testPathIgnorePatterns=test/integration",
"update:snapshots": "jest --testPathIgnorePatterns=test/integration --updateSnapshot"
```

### なぜ分離したか

CDKスタックの変更（新しいリソースの追加、プロパティの変更など）を行うと、生成されるCloudFormationテンプレートが変わり、スナップショットテストが失敗します。

通常のテスト実行とスナップショット更新を分離することで：
1. **意図しない更新を防止**: 通常のテスト実行時に誤ってスナップショットが更新されることを防ぐ
2. **明示的な操作**: スナップショット更新が必要な場合のみ、開発者が意識的に`update:snapshots`を実行
3. **レビューの質向上**: スナップショットの変更が意図的なものであることが明確になる

### スナップショット更新の実行方法

```bash
# スナップショットを更新
npm run update:snapshots

# ルートディレクトリから実行する場合
npm run update:snapshots --workspace=attendance-kit-infrastructure
```

## スナップショット管理

スナップショットファイルは`test/__snapshots__/`に保存されます。スナップショットを更新した場合は、変更内容をレビューし、意図した変更であることを確認してからコミットしてください。
