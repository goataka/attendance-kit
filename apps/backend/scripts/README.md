# Backend Scripts

バックエンドの開発・ビルド・デプロイに関するスクリプトです。

## スクリプト一覧

| スクリプト | 説明 |
|-----------|------|
| [build-backend.sh](./build-backend.sh) | Lambda デプロイ用のビルド |
| [generate-openapi.sh](./generate-openapi.sh) | OpenAPI 仕様書の生成 |

各スクリプトの詳細は、スクリプトファイル内のコメントを参照してください。

## 使用方法

### ローカルでの実行

```bash
# OpenAPI 仕様書の生成
bash apps/backend/scripts/generate-openapi.sh

# Lambda デプロイパッケージのビルド
bash apps/backend/scripts/build-backend.sh
```

### CI/CD での使用

これらのスクリプトは GitHub Actions ワークフローから呼び出されます:
- [update-openapi](../workflows/update-openapi/README.md): OpenAPI 仕様の自動更新
- deploy (将来実装予定): Lambda デプロイ
