# スクリーンショット画像のS3アップロードについて

## 概要

機能リファレンスページで使用するスクリーンショット画像は、Astroのビルドプロセスで自動的にS3にアップロードされます。

## 画像の配置

スクリーンショット画像は以下のディレクトリに配置します：

```
apps/site/public/images/screenshots/
├── 01-initial-screen.png
├── 02-after-clock-in.png
└── 03-after-clock-out.png
```

## ビルドプロセス

### 1. ローカルビルド

```bash
npm run build:site
```

ビルド後、画像は `apps/site/dist/images/screenshots/` に出力されます。

### 2. S3へのアップロード

CDKデプロイ時に、ビルド成果物（`dist/`配下のすべてのファイル）がS3にアップロードされます：

```bash
cd infrastructure/deploy
cdk deploy AttendanceKit-Dev-Stack --context environment=dev
```

デプロイ時の処理フロー：

1. **ビルド**: `npm run build:site` が実行される
2. **出力**: `apps/site/dist/` にビルド成果物が生成される
3. **S3アップロード**: CDKが `dist/` の内容をS3バケットにアップロード
4. **CloudFront更新**: CloudFrontのキャッシュが自動的に更新される

### 3. アクセス

デプロイ後、画像は以下のURLでアクセス可能になります：

```
https://<cloudfront-domain>/images/screenshots/01-initial-screen.png
https://<cloudfront-domain>/images/screenshots/02-after-clock-in.png
https://<cloudfront-domain>/images/screenshots/03-after-clock-out.png
```

## Markdownでの画像参照

機能リファレンス（`apps/site/src/content/docs/features.md`）では、以下のように画像を参照します：

```markdown
![初期画面](/images/screenshots/01-initial-screen.png)
```

Astroは `public/` ディレクトリの内容をそのままビルド出力にコピーするため、`/images/screenshots/` というパスでアクセスできます。

## S3バケット構成

CDKで作成されるS3バケット：

- **バケット名**: `attendance-kit-<environment>-site`
- **環境別**: dev, staging, prod
- **暗号化**: S3マネージド暗号化
- **パブリックアクセス**: ブロック（CloudFront経由のみアクセス可能）

### ディレクトリ構造（S3内）

```
s3://attendance-kit-dev-site/
├── index.html
├── _astro/
│   └── (ビルドされたCSS/JSファイル)
├── images/
│   └── screenshots/
│       ├── 01-initial-screen.png
│       ├── 02-after-clock-in.png
│       └── 03-after-clock-out.png
└── (その他のページ)
```

## キャッシュの管理

CloudFrontは画像を自動的にキャッシュします：

- **キャッシュポリシー**: CACHING_OPTIMIZED
- **TTL**: デフォルト設定（1日）
- **更新方法**: 再デプロイ時に自動更新

### キャッシュのクリア（必要な場合）

```bash
# CloudFront Distribution IDを取得
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='attendance-kit dev support site'].Id" \
  --output text)

# キャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/images/screenshots/*"
```

## 画像の更新手順

1. スクリーンショットを再撮影：
   ```bash
   npm run capture:screenshots
   ```

2. 画像を確認：
   ```bash
   ls -lh apps/site/public/images/screenshots/
   ```

3. ローカルでビルド確認：
   ```bash
   npm run build:site
   npm run dev:site  # プレビュー
   ```

4. デプロイ：
   ```bash
   cd infrastructure/deploy
   cdk deploy AttendanceKit-Dev-Stack --context environment=dev
   ```

5. CloudFrontのキャッシュをクリア（オプション）：
   ```bash
   # 上記のコマンドを実行
   ```

## トラブルシューティング

### 画像が表示されない

**原因**:
- ビルド時に画像がコピーされていない
- S3にアップロードされていない
- CloudFrontのキャッシュが古い

**解決方法**:
1. `apps/site/dist/images/screenshots/` に画像があるか確認
2. S3バケットに画像がアップロードされているか確認：
   ```bash
   aws s3 ls s3://attendance-kit-dev-site/images/screenshots/
   ```
3. CloudFrontのキャッシュをクリア

### 画像のパスが間違っている

**問題**: Markdownで画像が表示されない

**解決方法**:
- パスは `/images/screenshots/` で始まること（`public/` は含めない）
- ファイル名が正確に一致しているか確認
- 大文字小文字を確認

## セキュリティ

- S3バケットはパブリックアクセスをブロック
- CloudFront経由でのみアクセス可能
- Origin Access Identity (OAI)を使用
- HTTPS必須（HTTP→HTTPSリダイレクト）

## コスト

スクリーンショット画像のストレージとデリバリーコスト：

- **S3ストレージ**: 3画像 × 約300KB = 約1MB → 月額 $0.023/GB = 約$0.00002/月
- **CloudFront転送**: 1,000リクエスト/月 × 300KB = 約300MB → 月額 $0.085/GB = 約$0.025/月

**合計**: 約$0.03/月（ほぼ無料）

## 参考

- [Astro Public Directory](https://docs.astro.build/en/guides/images/#public)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [CDK S3 Deployment](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment-readme.html)
