# API Documentation

このディレクトリには、Attendance Kit Backend APIのOpenAPI仕様書が含まれています。

## OpenAPI仕様書

- **ファイル**: [openapi.json](./openapi.json)
- **形式**: OpenAPI 3.0
- **自動生成**: このファイルはバックエンドコードから自動生成されます

## 仕様書の表示方法

### 1. Swagger UI

オンラインで表示:
```
https://editor.swagger.io/
```

上記URLにアクセスし、`openapi.json`の内容を貼り付けてください。

### 2. ローカル開発環境

バックエンドサーバーを起動すると、Swagger UIが利用可能になります:

```bash
cd apps/backend
npm run start:dev
```

ブラウザで以下にアクセス:
```
http://localhost:3000/api/docs
```

## 仕様書の更新

### 自動更新（推奨）

Pull Requestを作成すると、GitHub Actionsが自動的にOpenAPI仕様書を更新します。
詳細は[../workflows/update-openapi/README.md](../workflows/update-openapi/README.md)を参照してください。

### 手動更新

詳細は[../scripts/generate-openapi.sh](../scripts/generate-openapi.sh)を参照してください。

```bash
npm run generate:openapi
```

## エンドポイント一覧

### 打刻API

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|---------|------|------|
| `/api/clock/in` | POST | 出勤打刻 | ✅ 必須 |
| `/api/clock/out` | POST | 退勤打刻 | ✅ 必須 |
| `/api/clock/records` | GET | 打刻記録一覧取得 | ✅ 必須 |

### 認証

すべてのエンドポイントはJWT Bearer認証が必要です。

リクエストヘッダーに以下を含めてください:
```
Authorization: Bearer <your-jwt-token>
```

## 関連ドキュメント

- [Backend README](../README.md)
- [Architecture Documentation](../../../docs/architecture/README.md)
- [DynamoDB Clock Table Design](../../../docs/architecture/dynamodb-clock-table.md)
