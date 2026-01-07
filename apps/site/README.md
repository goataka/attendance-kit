# 製品サポートサイト

勤怠管理システムの製品サポートサイト。

## 技術スタック

- Astro 4.16.19
- Starlight 0.29.3
- Markdown

## 開発

```bash
# 開発サーバー起動
npm run dev:site

# ビルド
npm run build:site
```

## スクリーンショット撮影

製品ドキュメントに使用するスクリーンショットを自動撮影できます。

### 前提条件

1. フロントエンドとバックエンドが起動していること:
   ```bash
   # ターミナル1
   npm run dev:frontend
   
   # ターミナル2
   npm run dev:backend
   ```

2. Playwrightブラウザがインストールされていること:
   ```bash
   cd apps/site
   npx playwright install chromium
   ```

### 撮影方法

```bash
# siteディレクトリに移動
cd apps/site

# 対話的モード（確認あり）
npm run screenshot

# 自動モード（CI/CD用、確認なし）
npm run screenshot:auto
```

### 出力先

`public/images/screenshots/` ディレクトリに以下の画像が保存されます:
- `01-initial-screen.png` - 初期画面
- `02-after-clock-in.png` - 出勤打刻後
- `03-after-clock-out.png` - 退勤打刻後

## コンテンツ

- 概要
- 使い方ガイド
- 機能リファレンス
- FAQ
