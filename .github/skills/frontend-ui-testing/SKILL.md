---
name: frontend-ui-testing
description: フロントエンドUI画面を変更・追加した際に必須のテスト作業（snapshot/screenshot更新、E2Eテスト更新、premergeテスト実行）を実施するスキルです。UI画面の変更や追加を行った場合に使用してください。
---

# フロントエンドUI画面変更時の必須作業スキル

このスキルは、フロントエンドのUI画面を変更または追加した際に必要なすべての検証作業を体系的に実施します。

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- 新しいUI画面（Reactコンポーネント）を追加した場合
- 既存のUI画面のレイアウトやスタイルを変更した場合
- UI画面にフォーム要素やボタンを追加/削除した場合
- ナビゲーションフローを変更した場合

## 必須作業チェックリスト

UI画面を変更・追加した場合、以下の作業を**必ず**実施してください:

### 1. Snapshotの更新

```bash
cd apps/frontend
npm run test -- -u
```

**目的**: Jestスナップショットテストを更新し、コンポーネントの構造変更を記録します。

### 2. Screenshotの更新

- 各画面コンポーネントのE2Eテスト内でスクリーンショットを自動取得
- `*.screenshot.png`ファイルが自動生成される

**配置場所**: `apps/frontend/src/<ComponentName>/<ComponentName>.screenshot.png`

### 3. Snapshotファイルの作成/更新

新規画面の場合、HTMLスナップショットファイルを作成:

**配置場所**: `apps/frontend/src/<ComponentName>/<ComponentName>.snapshot.html`

**フォーマット**:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ComponentName - Visual Snapshot</title>
</head>
<body>
    <!-- This file is auto-generated for visual regression testing -->
    <!-- Generated: YYYY-MM-DD -->
    <!-- Page: ComponentName (日本語名) -->
    <h1>ComponentName Visual Snapshot</h1>
    <p>This HTML snapshot is used for visual regression testing of the Component page.</p>
    <ul>
        <li>Route: /route-path</li>
        <li>Component: ComponentName</li>
        <li>Screenshot: ComponentName.screenshot.png</li>
    </ul>
</body>
</html>
```

### 4. E2Eテストの作成/更新

**新規画面の場合**:

`apps/frontend/src/<ComponentName>/<ComponentName>.e2e.spec.ts`を作成

**E2Eテストの必須項目**:
- 画面表示の確認（タイトル、フォーム要素）
- フォーム要素の操作確認
- ナビゲーションの確認
- スクリーンショットの取得（`*.screenshot.png`）

**スクリーンショット取得コード例**:
```typescript
test('should display page', async ({ page }) => {
  await page.goto('/route');
  
  // 要素の確認
  await expect(page.locator('h1')).toHaveText('タイトル');
  
  // アニメーション完了を待機
  await page.waitForTimeout(500);
  
  // スクリーンショット取得
  await expect(page).toHaveScreenshot(['ComponentName.screenshot.png'], {
    fullPage: true,
  });
});
```

**既存画面の場合**:

既存のE2Eテストを更新して新しいUIに対応:
- 新規追加された要素の確認を追加
- 変更されたナビゲーションフローを更新
- スクリーンショットを再取得（`--update-snapshots`フラグ使用）

### 5. Gherkin E2Eテストの作成/更新（該当する場合）

**新規画面の場合**:

`test/e2e/features/<feature-name>.feature`を作成し、BDDスタイルのシナリオを記述:

```gherkin
Feature: 機能名
  機能の説明

  Scenario: シナリオ名
    Given 前提条件
    When アクション
    Then 期待結果
```

**ステップ定義の作成**:

`test/e2e/steps/<page-name>.steps.ts`を作成し、Given/When/Thenステップを実装

### 6. Premergeテストの実行

フロントエンド部分のテスト相当を実行:

```bash
cd apps/frontend

# Lint
npm run lint

# Build
npm run build

# Unit Test
npm run test:unit
```

**すべてのテストが成功することを確認**してください。

## 実行順序

1. **コード変更**: UI画面の変更・追加を実施
2. **E2Eテスト更新**: 新規作成または既存テストを更新
3. **Snapshot更新**: `npm run test -- -u`
4. **Screenshot生成**: `npx playwright test --update-snapshots`
5. **Premergeテスト**: Lint → Build → Unit Test
6. **検証**: すべてのテストが成功することを確認
7. **コミット**: 変更をコミット

## 注意事項

### 必ず実施すべきこと

- ✅ すべての変更画面に対してスクリーンショットを更新
- ✅ 新規画面には必ずE2Eテストを作成
- ✅ Premergeテストを実行して成功を確認
- ✅ `.gitignore`でビルド成果物を除外（`node_modules`、`dist`など）

### やってはいけないこと

- ❌ スナップショット/スクリーンショットの更新を忘れる
- ❌ E2Eテストを作成せずにコミット
- ❌ Premergeテストをスキップ
- ❌ テスト失敗を無視してコミット

## トラブルシューティング

### スクリーンショットが生成されない

```bash
# Playwrightブラウザをインストール
cd apps/frontend
npx playwright install chromium

# 再実行
npx playwright test --update-snapshots
```

### テストがタイムアウトする

- `playwright.config.ts`の`timeout`設定を確認
- ネットワーク待機が必要な場合は`waitForLoadState('networkidle')`を使用

### スナップショットの差分が大きい

- フォント、タイムスタンプ、ランダムデータなどの動的要素を確認
- 必要に応じてマスキングやモック化を実施

## 参考ファイル

- `apps/frontend/playwright.config.ts`: Playwright設定
- `apps/frontend/src/*/*.e2e.spec.ts`: E2Eテストの例
- `test/e2e/`: Gherkin E2Eテストの例
- `.github/instructions/markdown.instructions.md`: ドキュメントルール

## まとめ

UI画面変更時は、以下を確実に実施してください:

1. **Snapshot更新** (`npm run test -- -u`)
2. **Screenshot更新** (E2Eテスト内で自動生成)
3. **Snapshot HTMLファイル作成** (新規画面の場合)
4. **E2Eテスト作成/更新**
5. **Premergeテスト実行** (Lint → Build → Unit Test)
6. **すべてのテストが成功することを確認**

これらの作業を怠ると、ビジュアルリグレッションが検出されず、品質問題につながります。
