# Attendance Kit Backend

NestJS製のバックエンドAPI - AWS Lambda + API Gatewayにデプロイ

## 🚀 クイックスタート

### 前提条件

- Node.js 20.x以上
- npm 8.x以上
- AWS CLI (デプロイ時)

### インストール

```bash
npm install
```

### 環境変数の設定

`.env.example`を`.env`にコピーして設定:

```bash
cp .env.example .env
```

### 開発サーバーの起動

```bash
npm run start:dev
```

サーバーが起動したら:
- API: http://localhost:3000/api
- Swagger UI: http://localhost:3000/api/docs

## 📚 API仕様

API仕様はOpenAPI 3.0形式で提供されています:
- [OpenAPI仕様書](../../docs/api/openapi.json)
- [API Documentation](../../docs/api/README.md)

## 🧪 テスト

### ユニットテスト

```bash
npm test
```

### E2Eテスト

```bash
npm run test:e2e
```

### カバレッジ

```bash
npm run test:cov
```

## 🔨 ビルド

```bash
npm run build
```

ビルド成果物は`dist/`ディレクトリに出力されます。

## 🚢 デプロイ

### AWS Lambdaへのデプロイ

CDKを使用してデプロイ:

```bash
# バックエンドをビルド
npm run build

# CDKでデプロイ
cd ../../infrastructure/deploy
npm run build
cdk deploy --context environment=dev
```

## 📁 プロジェクト構造

```
src/
├── auth/              # 認証モジュール
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── clock/             # 打刻モジュール
│   ├── clock.module.ts
│   ├── clock.controller.ts
│   ├── clock.service.ts
│   └── dto/
│       └── clock.dto.ts
├── app.module.ts      # ルートモジュール
├── main.ts            # アプリケーションエントリーポイント
├── lambda.ts          # Lambdaハンドラー
└── generate-openapi.ts # OpenAPI仕様生成
```

## 🔐 認証

### JWT認証

現在はJWT Bearer認証を使用しています。

環境変数`JWT_SECRET`でシークレットキーを設定してください。

### GitHub OAuth (将来実装予定)

GitHub Secretsの`GITHUB_CLIENT_ID`と`GITHUB_CLIENT_SECRET`を使用する予定です。

## 🗄️ データベース

### DynamoDB

AWS DynamoDB `attendance-kit-{env}-clock`テーブルを使用:

- **Partition Key**: userId (String)
- **Sort Key**: timestamp (String)
- **GSI**: DateIndex (date, timestamp)

詳細は[DynamoDB設計ドキュメント](../../docs/architecture/dynamodb-clock-table.md)を参照。

## 🛠️ 開発

### コード整形

```bash
npm run format
```

### Lint

```bash
npm run lint
```

## 📝 スクリプト

| スクリプト | 説明 |
|-----------|------|
| `npm run build` | アプリケーションをビルド |
| `npm run start` | 本番モードで起動 |
| `npm run start:dev` | 開発モードで起動（ホットリロード） |
| `npm test` | ユニットテストを実行 |
| `npm run test:e2e` | E2Eテストを実行 |
| `npm run lint` | ESLintでコードをチェック |
| `npm run format` | Prettierでコードを整形 |
| `npm run generate:openapi` | OpenAPI仕様書を生成 |

## 🔄 CI/CD

### GitHub Actions

- **Premerge Checks**: PR時にlint、test、buildを実行
- **OpenAPI Update**: バックエンドコード変更時にOpenAPI仕様書を自動更新

## 🏗️ アーキテクチャ

```
React Frontend
     ↓
API Gateway
     ↓
Lambda (NestJS)
     ↓
DynamoDB
```

## 📦 依存関係

### 主要な依存関係

- **NestJS**: Webフレームワーク
- **AWS SDK v3**: DynamoDB連携
- **Passport JWT**: JWT認証
- **class-validator**: DTOバリデーション
- **Swagger**: OpenAPI生成

### 開発依存関係

- **Jest**: テストフレームワーク
- **Supertest**: APIテスト
- **ESLint**: リンター
- **Prettier**: コードフォーマッター

## 🤝 貢献

プロジェクト憲法に従って開発を進めてください:
- [プロジェクト憲法](../../memory/constitution.md)

## 📄 ライセンス

MIT
