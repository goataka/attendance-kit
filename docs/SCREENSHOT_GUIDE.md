# スクリーンショット撮影ガイド

## 概要

機能リファレンスページで使用するスクリーンショットは、以下の2つの方法で撮影できます。

## 方法1: 自動撮影（推奨）

Playwrightを使用して自動的にスクリーンショットを撮影します。

### 手順

1. フロントエンドとバックエンドを起動：
   ```bash
   npm run dev:frontend  # ターミナル1
   npm run dev:backend   # ターミナル2
   ```

2. 別のターミナルでスクリーンショットを撮影：
   ```bash
   npm run capture:screenshots
   ```

3. 撮影された画像を確認：
   ```bash
   ls -lh apps/site/public/images/screenshots/
   ```

### 注意事項

- Playwrightが自動的にインストールされます（初回のみ時間がかかります）
- フロントエンドとバックエンドが起動している必要があります
- 日本語フォントが正しく表示されるか確認してください

## 方法2: 手動撮影

ブラウザのスクリーンショット機能を使用して手動で撮影します。

### 手順

1. アプリケーションを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで http://localhost:5173 を開く

3. 以下の画面をスクリーンショットで撮影：

   **初期画面** (`01-initial-screen.png`):
   - アプリを開いた直後の状態
   - 入力フィールドは空
   - 打刻履歴は「まだ打刻記録がありません」

   **出勤打刻後** (`02-after-clock-in.png`):
   - ユーザーID: user001
   - 名前: 山田太郎
   - 出勤打刻ボタンをクリック後
   - 打刻履歴に1件表示（状態: 勤務中）

   **退勤打刻後** (`03-after-clock-out.png`):
   - 同じユーザーIDで退勤打刻ボタンをクリック後
   - 打刻履歴の状態が「完了」に変更

4. 撮影した画像を保存：
   ```bash
   # 画像を apps/site/public/images/screenshots/ に保存
   ```

### スクリーンショットのコツ

- **解像度**: 1920x1080以上を推奨
- **フォント**: システムのデフォルトフォントで日本語が正しく表示されること
- **ブラウザ**: Chrome, Edge, Firefoxなど、日本語対応のブラウザを使用
- **DevTools**: ブラウザのDevToolsを閉じた状態で撮影
- **ウィンドウサイズ**: フルスクリーンまたは十分に大きいサイズ

## 画像要件

- **形式**: PNG
- **ファイル名**: 
  - `01-initial-screen.png`
  - `02-after-clock-in.png`
  - `03-after-clock-out.png`
- **サイズ**: 500KB以下を推奨
- **解像度**: 1920x1080以上

## 画像の最適化

撮影後、画像サイズが大きい場合は最適化してください：

```bash
# ImageMagickを使用（オプション）
convert 01-initial-screen.png -quality 90 -resize 1920x1080 01-initial-screen.png
```

## トラブルシューティング

### 文字化けが発生する

**問題**: スクリーンショット内の日本語が文字化けする

**解決方法**:
1. ブラウザのフォント設定を確認
2. システムに日本語フォントがインストールされているか確認
3. 別のブラウザで試す（Chrome推奨）

### Playwright の実行エラー

**問題**: `npm run capture:screenshots` でエラーが発生

**解決方法**:
1. Node.jsのバージョンを確認（18以上必要）
2. Playwrightを手動でインストール: `npx playwright install chromium`
3. フロントエンドが起動しているか確認

## デプロイ時の処理

撮影した画像は、Astroのビルドプロセスで自動的に処理されます：

1. `npm run build:site` を実行
2. `apps/site/public/` 配下のファイルがビルド出力に含まれる
3. CDKデプロイ時にS3にアップロード
4. CloudFront経由で配信

## 参考

- Astro Public Directory: https://docs.astro.build/en/guides/images/#public
- Playwright Documentation: https://playwright.dev/
