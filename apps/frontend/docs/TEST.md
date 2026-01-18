# React テスト戦略

Reactフロントエンドは、コンポーネントの独立性とUI/UXの品質を保証します。

## テスト種類

### ユニットテスト

UI非依存のロジックとカスタムフックの動作を検証します。

**詳細**: [test/unit.md](test/unit.md)

### 統合テスト

コンポーネント間の連携とAPI通信時のUI挙動を検証します。

**詳細**: [test/integration.md](test/integration.md)

## テスト実行方法

```bash
# ユニットテスト
cd apps/frontend
npm test

# カバレッジ付き
npm test -- --coverage

# Storybook起動
npm run storybook

# Storybook統合テスト
npm run test-storybook
```

## テストカバレッジ目標

| テスト種類 | カバレッジ目標 |
|-----------|--------------|
| ユニットテスト | 70%以上 |
| 統合テスト | - |

## 使用ツール

- **Jest**: テストフレームワーク
- **@testing-library/react**: Reactコンポーネントテスト
- **@testing-library/react-hooks**: カスタムフックテスト
- **Storybook**: コンポーネントカタログ
- **MSW (Mock Service Worker)**: APIモック

## 参考資料

- [Testing Library](https://testing-library.com/)
- [Jest公式ドキュメント](https://jestjs.io/)
- [Storybook公式ドキュメント](https://storybook.js.org/)
- [MSW公式ドキュメント](https://mswjs.io/)
