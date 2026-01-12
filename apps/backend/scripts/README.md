# Backend Scripts

このディレクトリには、バックエンドの開発・ビルド・デプロイに関するスクリプトが含まれています。

## スクリプト一覧

### build-backend.sh

Lambda デプロイ用のバックエンドをビルドするスクリプトです。

**使用方法**:
```bash
bash apps/backend/scripts/build-backend.sh
```

**実行内容**:
1. 依存関係のインストール (`npm ci`)
2. アプリケーションのビルド (`npm run build`)
3. Lambda パッケージの準備 (`node_modules` を `dist/` にコピー)

**出力**: `apps/backend/dist/` に Lambda デプロイ用のパッケージが生成されます

### generate-openapi.sh

OpenAPI 仕様書を生成するスクリプトです。

**使用方法**:
```bash
bash apps/backend/scripts/generate-openapi.sh
```

**実行内容**:
1. NestJS コードから OpenAPI 仕様を自動生成
2. `apps/backend/api/openapi.json` に出力

**前提条件**: 依存関係がインストールされている必要があります (`npm ci`)

## CI/CD での使用

これらのスクリプトは GitHub Actions ワークフローから呼び出されます:

- **update-openapi.yml**: `generate-openapi.sh` を使用して OpenAPI 仕様を自動更新
- **deploy-*.yml**: `build-backend.sh` を使用して Lambda パッケージをビルド（将来実装予定）

## 開発時の使用

開発中に手動でこれらのスクリプトを実行することもできます:

```bash
# OpenAPI 仕様書の手動生成
cd apps/backend
npm ci  # 初回のみ
bash scripts/generate-openapi.sh

# Lambda デプロイパッケージの手動ビルド
cd apps/backend
bash scripts/build-backend.sh
```
