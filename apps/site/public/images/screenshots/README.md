# スクリーンショット画像

このディレクトリには、機能リファレンスで使用するスクリーンショット画像を配置します。

## 必要な画像

以下の3つのスクリーンショット画像をこのディレクトリに配置してください：

1. **01-initial-screen.png** - 初期画面（ユーザーID入力フォーム）
   - GitHub Assets URL: https://github.com/user-attachments/assets/e3675d3e-a689-4251-b794-000eb147e859

2. **02-after-clock-in.png** - 出勤打刻後の画面
   - GitHub Assets URL: https://github.com/user-attachments/assets/cb35c29e-0035-4b07-b4c4-d7a7f68cc608

3. **03-after-clock-out.png** - 退勤打刻後の画面（完了状態）
   - GitHub Assets URL: https://github.com/user-attachments/assets/c4ad2af2-03d7-4e34-8b7a-e3b82ec2ab08

## 画像の取得方法

### 方法1: GitHub Assetsからダウンロード（推奨）

上記のURLにアクセスして、実際のスクリーンショット画像をダウンロードし、このディレクトリに保存してください。

### 方法2: 自動撮影

```bash
# フロントエンドとバックエンドを起動
npm run dev:frontend  # ターミナル1
npm run dev:backend   # ターミナル2

# 別のターミナルでスクリーンショット撮影
npm run capture:screenshots
```

### 方法3: 手動撮影

1. アプリケーションを起動します：
   ```bash
   npm run dev
   ```

2. ブラウザで http://localhost:5173 を開きます

3. 以下の画面をスクリーンショットで撮影します：
   - **初期画面** (`01-initial-screen.png`): アプリを開いた直後の画面
   - **出勤打刻後** (`02-after-clock-in.png`): 出勤打刻を実行した後の画面
   - **退勤打刻後** (`03-after-clock-out.png`): 退勤打刻を実行した後の画面

4. 撮影した画像をこのディレクトリに保存します

## 画像要件

- **形式**: PNG
- **推奨サイズ**: 1920x1080ピクセル
- **最小サイズ**: 1280x1024ピクセル  
- **ファイルサイズ**: 500KB以下を推奨
- **カラー**: プライマリカラー #007CC0を使用したUIデザイン
- **内容**: 日本語UI、実際のアプリケーション画面

## S3アップロード

デプロイ時に、これらの画像はAstroのビルドプロセスによって自動的にS3にアップロードされます。

詳細: `/docs/SCREENSHOT_S3_UPLOAD.md`
