# Attendance Kit Backend

NestJS製のバックエンドAPI - AWS Lambda + API Gatewayにデプロイ

## 📋 実装概要

**実装完了日**: 2026-01-11

NestJSを使用した勤怠管理キットのバックエンドAPIを実装しました。AWS Lambda + API Gatewayにデプロイ可能な構成で、DynamoDBと連携して打刻データを管理します。

### 主な技術スタック

- **フレームワーク**: NestJS 10.x
- **言語**: TypeScript 5.1.x
- **ランタイム**: Node.js 20.x
- **データベース**: DynamoDB (AWS SDK v3)
- **認証**: JWT (Passport)
- **テスト**: Jest + Supertest
- **デプロイ**: AWS Lambda + API Gateway (CDK)
- **ドキュメント**: OpenAPI 3.0 (Swagger)

### アーキテクチャ

\`\`\`
React Frontend
     ↓
API Gateway (REST API + CORS)
     ↓
Lambda Function (NestJS + JWT)
     ↓
DynamoDB (clock table)
\`\`\`

## 🚀 クイックスタート

### 前提条件

- Node.js 20.x以上
- npm 8.x以上
- AWS CLI (デプロイ時)

### インストール

\`\`\`bash
npm install
\`\`\`

### 環境変数の設定

\`.env.example\`を\`.env\`にコピーして設定:

\`\`\`bash
cp .env.example .env
\`\`\`

必要な環境変数:
- \`AWS_REGION\` - AWSリージョン (デフォルト: ap-northeast-1)
- \`DYNAMODB_TABLE_NAME\` - DynamoDBテーブル名
- \`JWT_SECRET\` - JWT署名用シークレット
- \`CORS_ORIGIN\` - CORS許可オリジン (デフォルト: *)
- \`PORT\` - ポート番号 (デフォルト: 3000)

### 開発サーバーの起動

\`\`\`bash
npm run start:dev
\`\`\`

サーバーが起動したら:
- API: http://localhost:3000/api
- Swagger UI: http://localhost:3000/api/docs

## 📚 API仕様

### エンドポイント

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | \`/api/clock/in\` | 出勤打刻 | ✅ JWT |
| POST | \`/api/clock/out\` | 退勤打刻 | ✅ JWT |
| GET | \`/api/clock/records\` | 打刻記録一覧取得 | ✅ JWT |

### 詳細なAPI仕様

API仕様はOpenAPI 3.0形式で提供されています:
- [OpenAPI仕様書](./api/openapi.json)
- [API Documentation](./api/README.md)

## 🧪 テスト

### ユニットテスト

\`\`\`bash
npm test
\`\`\`

サービス層のビジネスロジックをテストします。DynamoDB DocumentClientはモック化されます。

### APIテスト

\`\`\`bash
npm run test:api
\`\`\`

Supertestを使用してAPIエンドポイントをテストします。ClockServiceはモック化されます。

### カバレッジ

\`\`\`bash
npm run test:cov
\`\`\`

### テスト結果

\`\`\`
✅ ユニットテスト: 6 passed
✅ APIテスト: 7 passed
✅ 総テスト: 13 passed
\`\`\`

## 🔨 ビルド

\`\`\`bash
npm run build
\`\`\`

ビルド成果物は\`dist/\`ディレクトリに出力されます。

## 🚢 デプロイ

### AWS Lambdaへのデプロイ

CDKを使用してデプロイ:

\`\`\`bash
# バックエンドをビルド
npm run build

# CDKでデプロイ
cd ../../infrastructure/deploy
npm run build
cdk deploy --context environment=dev
\`\`\`

### Lambda設定

- **Runtime**: Node.js 20.x
- **Handler**: lambda.handler
- **Timeout**: 30秒
- **Memory**: 512MB
- **環境変数**: DynamoDBテーブル名、JWT Secret等

### API Gateway設定

- **タイプ**: REST API
- **統合**: Lambda Proxy
- **CORS**: 有効
- **スロットリング**: Burst Limit 100, Rate Limit 50

## 📁 プロジェクト構造

\`\`\`
src/
├── auth/                    # 認証モジュール
│   ├── auth.module.ts       # 認証モジュール定義
│   ├── jwt.strategy.ts      # JWT戦略
│   └── jwt-auth.guard.ts    # 認証ガード
├── clock/                   # 打刻モジュール
│   ├── clock.module.ts      # Clockモジュール定義
│   ├── clock.controller.ts  # APIコントローラー
│   ├── clock.service.ts     # ビジネスロジック
│   ├── clock.service.spec.ts  # ユニットテスト
│   ├── clock.api.spec.ts    # APIテスト
│   └── dto/
│       └── clock.dto.ts     # DTOとバリデーション
├── app.module.ts            # ルートモジュール
├── main.ts                  # アプリケーションエントリーポイント
├── lambda.ts                # Lambdaハンドラー
└── generate-openapi.ts      # OpenAPI仕様生成
\`\`\`

## 🔐 認証

### JWT認証

現在はJWT Bearer認証を使用しています。

\`\`\`typescript
// JWTトークンのペイロード構造
{
  sub: string,      // User ID
  userId: string,   // User ID
  username?: string // Username (optional)
}
\`\`\`

環境変数\`JWT_SECRET\`でシークレットキーを設定してください。

認証フロー:
\`\`\`
Client → API Gateway → Lambda
                         ↓
                    JWT Guard
                         ↓
                  Validate Token
                         ↓
                  Extract User Info
                         ↓
                  Execute Handler
\`\`\`

### GitHub OAuth (将来実装予定)

GitHub Secretsの\`GITHUB_CLIENT_ID\`と\`GITHUB_CLIENT_SECRET\`を使用する予定です。

## 🗄️ データベース

### DynamoDB

AWS DynamoDB \`attendance-kit-{env}-clock\`テーブルを使用:

**テーブル構造**:
- **Partition Key**: userId (String)
- **Sort Key**: timestamp (String, ISO 8601形式)
- **GSI**: DateIndex (date, timestamp)
- **課金モード**: Pay-Per-Request
- **暗号化**: AWS管理キー
- **PITR**: 有効
- **削除ポリシー**: RETAIN

**アクセスパターン**:
1. **PutCommand**: 打刻データの書き込み
2. **QueryCommand**: ユーザーIDによる打刻記録の取得

詳細は[DynamoDB設計ドキュメント](../../docs/architecture/dynamodb-clock-table.md)を参照。

## 🛠️ 開発

### コード整形

\`\`\`bash
npm run format
\`\`\`

### Lint

\`\`\`bash
npm run lint
\`\`\`

### OpenAPI仕様書の生成

\`\`\`bash
npm run generate:openapi
\`\`\`

## 📝 スクリプト

| スクリプト | 説明 |
|-----------|------|
| \`npm run build\` | アプリケーションをビルド |
| \`npm run start\` | 本番モードで起動 |
| \`npm run start:dev\` | 開発モードで起動（ホットリロード） |
| \`npm test\` | ユニットテストを実行 |
| \`npm run test:api\` | APIテストを実行 |
| \`npm run test:cov\` | カバレッジ付きテスト実行 |
| \`npm run lint\` | ESLintでコードをチェック |
| \`npm run format\` | Prettierでコードを整形 |
| \`npm run generate:openapi\` | OpenAPI仕様書を生成 |

## 🔄 CI/CD

### GitHub Actions

- **Premerge Checks**: PR時にlint、test、buildを実行
- **OpenAPI Update**: バックエンドコード変更時にOpenAPI仕様書を自動更新

### プレマージワークフロー

既存のワークフロー(\`.github/workflows/premerge.yml\`)がnpm workspaces経由でバックエンドも実行:

1. 依存関係インストール (\`npm ci\`)
2. Lintチェック (\`npm run lint\`)
3. テスト実行 (\`npm test\`)
4. ビルド実行 (\`npm run build\`)

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

## 🎯 MVP達成状況

すべてのMVP要件を達成:
- ✅ NestJSバックエンド実装
- ✅ 打刻API（出勤・退勤・一覧取得）
- ✅ DynamoDB連携 (AWS SDK v3)
- ✅ JWT認証
- ✅ 包括的なテスト（ユニット + API）
- ✅ AWS Lambda + API Gateway対応
- ✅ OpenAPIドキュメント自動生成
- ✅ CI/CD統合
- ✅ コード品質（Lint + Format）

## 🔒 セキュリティ

### 実装済み

1. ✅ JWT認証による保護
2. ✅ 環境変数によるシークレット管理
3. ✅ CORS設定
4. ✅ Input validation (class-validator)
5. ✅ DynamoDB暗号化（AWS管理キー）

### IAM権限

Lambda関数には以下の権限が付与されます:
- DynamoDB読み書き権限（テーブル固有）
- CloudWatch Logs書き込み権限

## 💰 コスト見積もり

### Lambda

- 月間100万リクエスト想定
- 実行時間: 平均200ms
- 月額: 約$0.20

### API Gateway

- 月間100万リクエスト
- 月額: 約$3.50

### DynamoDB

- Pay-Per-Request
- 月間100万書き込み、100万読み込み
- 月額: 約$2.50

**合計**: 約$6.20/月（dev環境）

## 🚀 次のステップ

### 短期（今すぐ可能）

1. 実際のAWS環境へのデプロイ
2. GitHub Secretsの設定（JWT_SECRET）
3. フロントエンドとの統合テスト

### 中期（次のスプリント）

1. GitHub OAuth実装
2. 追加のAPIエンドポイント
3. DynamoDB結合テスト環境構築
4. CloudWatch監視設定

### 長期（将来の拡張）

1. GraphQL API検討
2. WebSocket対応（リアルタイム通知）
3. マルチリージョン対応
4. パフォーマンス最適化

## 📖 関連ドキュメント

- [API Documentation](./api/README.md)
- [OpenAPI Specification](./api/openapi.json)
- [DynamoDB Design](../../docs/architecture/dynamodb-clock-table.md)
- [Architecture Documentation](../../docs/architecture/README.md)
- [プロジェクト憲法](../../memory/constitution.md)

## 🤝 貢献

プロジェクト憲法に従って開発を進めてください:
- [プロジェクト憲法](../../memory/constitution.md)

## 📄 ライセンス

MIT
