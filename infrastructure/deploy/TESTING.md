# Testing Guide

## Unit Tests

### Snapshot Updates

**重要**: `test:unit`スクリプトには`--updateSnapshot`フラグが含まれています。

```json
"test:unit": "jest --testPathIgnorePatterns=test/integration --updateSnapshot"
```

### なぜこのフラグが必要か

CDKスタックの変更（新しいリソースの追加、プロパティの変更など）を行うと、生成されるCloudFormationテンプレートが変わり、スナップショットテストが失敗します。

`--updateSnapshot`フラグを常に含めることで：
1. コード変更時に自動的にスナップショットが更新される
2. CI/CDパイプラインでスナップショット不一致によるエラーを防ぐ
3. `.github/actions/commit-and-comment`アクションが更新されたスナップショットを自動コミット

### このフラグを削除してはいけない理由

1. **CI/CDの安定性**: スナップショットの不一致でビルドが失敗するのを防ぐ
2. **開発効率**: 手動でスナップショットを更新する手間を省く
3. **コードレビュー**: 変更されたスナップショットがPRで明示的にレビューできる

### 実行方法

```bash
# Unit testsのみ実行（スナップショット自動更新）
npm run test:unit

# Integration testsのみ実行
npm run test:integration

# すべてのテスト実行
npm test
```

## スナップショット管理

スナップショットファイルは`test/__snapshots__/`に保存され、ワークフローの`commit-and-comment`アクションによって自動的にコミットされます。
