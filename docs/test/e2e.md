# System E2Eテスト

## 目的

エンドユーザーの実際の操作フローを再現し、システム全体の動作を保証

## テスト内容

### ユーザー導線の完結（ログイン〜保存）

- ログイン
- 出勤打刻
- 退勤打刻
- 勤怠履歴の確認
- ログアウト

### ブラウザ間の表示・挙動差異

- Chrome、Firefox、Safariでの動作確認
- レスポンシブデザインの検証

### システム全体のパフォーマンス・疎通

- ページロード時間
- API応答時間
- エンドツーエンドの処理時間

## 使用ツール

**Playwright（Browser Context）**

- ブラウザ自動化
- クロスブラウザテスト
- スクリーンショットとビデオ録画

## 実行タイミング

- デプロイ前（LocalStack環境）
- デプロイ後（AWS環境）
- 定期的な回帰テスト

## 接続先

Local / AWS

## 実行方法

```bash
# E2Eテスト
npm run test:e2e

# 特定のブラウザでテスト
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# UIモードで実行
npx playwright test --ui
```
