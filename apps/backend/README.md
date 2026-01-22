# Attendance Kit Backend

NestJS製のバックエンドAPI - AWS Lambda + API Gatewayにデプロイ

## 技術スタック

- NestJS 10.x + TypeScript 5.1.x
- Node.js 24.x以上
- DynamoDB (AWS SDK v3)
- JWT認証 (Passport)
- Jest + Supertest
- OpenAPI 3.0 (Swagger)

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env`に必要な環境変数を設定してください。

### 開発サーバー起動

```bash
npm run start:dev
```

- API: http://localhost:3000/api
- Swagger UI: http://localhost:3000/api/docs

## API

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/clock/in` | 出勤打刻 | JWT |
| POST | `/api/clock/out` | 退勤打刻 | JWT |
| GET | `/api/clock/records` | 打刻記録一覧 | JWT |

詳細は[API Documentation](./api/README.md)を参照してください。

## テスト

| コマンド | 説明 |
|---------|------|
| `npm test` | ユニットテスト |
| `npm run test:integration` | 統合テスト |
| `npm run test:cov` | カバレッジ付きテスト |

## ビルド

```bash
npm run build
```

## デプロイ

```bash
npm run build
cd ../../infrastructure/deploy
cdk deploy --context environment=dev
```

詳細は[Infrastructure README](../../infrastructure/deploy/README.md)を参照してください。

## プロジェクト構造

```
src/
├── auth/           # 認証モジュール
├── clock/          # 打刻モジュール
├── app.module.ts   # ルートモジュール
├── main.ts         # エントリーポイント
└── lambda.ts       # Lambdaハンドラー
```

## 開発

| コマンド | 説明 |
|---------|------|
| `npm run start:dev` | 開発サーバー起動 |
| `npm run lint` | Lint実行 |
| `npm run format` | コード整形 |
| `npm run generate:openapi` | OpenAPI仕様書生成 |

## 関連ドキュメント

- [API Documentation](./api/README.md)
- [DynamoDB Design](../../docs/architecture/dynamodb-clock-table.md)
