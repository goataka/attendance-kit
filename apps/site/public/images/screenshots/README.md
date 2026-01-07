# スクリーンショット画像

このディレクトリには、勤怠管理システムのUIスクリーンショットが保存されています。

## 画像一覧

### 01-initial-screen.png
- **説明**: 初期画面（ユーザーID入力、名前入力フォーム）
- **サイズ**: 1920x1080
- **元画像**: https://github.com/user-attachments/assets/e3675d3e-a689-4251-b794-000eb147e859

### 02-after-clock-in.png
- **説明**: 出勤打刻後の画面（打刻履歴に1件表示）
- **サイズ**: 1920x1080
- **元画像**: https://github.com/user-attachments/assets/cb35c29e-0035-4b07-b4c4-d7a7f68cc608

### 03-after-clock-out.png
- **説明**: 退勤打刻後の画面（打刻履歴が完了状態）
- **サイズ**: 1920x1080
- **元画像**: https://github.com/user-attachments/assets/c4ad2af2-03d7-4e34-8b7a-e3b82ec2ab08

## 画像の取得方法

実際のスクリーンショット画像を取得するには、以下のいずれかの方法を使用してください:

### 方法1: 自動撮影スクリプトを使用（推奨）

```bash
# フロントエンドとバックエンドを起動
npm run dev:frontend  # ターミナル1
npm run dev:backend   # ターミナル2

# 別のターミナルでスクリーンショット撮影
npm run capture:screenshots
```

### 方法2: GitHub Assetsから手動ダウンロード

上記の「元画像」URLからブラウザで画像を開き、右クリック→「名前を付けて保存」でダウンロードして、このディレクトリに保存してください。

## 注意事項

- 画像は日本語フォント（Noto Sans JP）でレンダリングされています
- スクリーンショットはリポジトリで管理され、CDKデプロイ時にS3へ自動アップロードされます
- 画像を更新した場合は、必ずgit addでステージングしてコミットしてください
