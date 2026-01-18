# Workflows

フロントエンド関連のワークフローとアクションを管理しています。

## 利用可能なワークフロー

- [Pre-Merge](pre-merge/README.md) - Pre-mergeチェック（ユニットテスト、インテグレーションテスト）

## ビジュアルリグレッションスクリーンショット

スクリーンショットはE2Eテスト（`*.e2e.spec.ts`）内で自動生成されます。

### スクリーンショットの更新

```bash
# スクリーンショットを更新（初回生成または更新時）
npm run test:integration -- --update-snapshots

# 特定のテストのみ更新
npx playwright test ClockInOutPage.e2e.spec.ts --update-snapshots
```

### 生成されるファイル

- `src/ClockInOutPage/ClockInOutPage.screenshot.png`
- `src/ClocksListPage/ClocksListPage.screenshot.png`

これらのスクリーンショットは各ページのREADMEで表示されます。
