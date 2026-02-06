# React 統合テスト

## 目的

コンポーネント間の連携とAPI通信時のUI挙動を検証

## テスト内容

### コンポーネント間のProps受け渡し

- 親子コンポーネント間のデータフロー
- イベントハンドラの伝播

### APIレスポンス別のUI表示切替

- ローディング状態
- エラー状態
- 成功状態の表示

### MSWによる擬似的な通信エラー対応

- ネットワークエラー時のフォールバック
- リトライロジックの検証

## 使用ツール

**Playwright + MSW**

- Playwrightでブラウザテスト
- MSW（Mock Service Worker）でAPIモック
- @testing-library/reactで操作とアサーション

## 実行タイミング

- 開発中
- プルリクエスト作成時

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd apps/frontend

# 統合テスト
npm run test:integration
```

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [MSW公式ドキュメント](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
