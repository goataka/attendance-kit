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

OpenAPI仕様書は以下の方法で更新されます:

### 自動更新（推奨）

Pull Requestを作成すると、GitHub Actionsが自動的にOpenAPI仕様書を更新します。

### 手動更新

バックエンドコードを変更した後、手動で仕様書を生成する場合:

```bash
cd apps/backend
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

## データモデル

### ClockInDto

```json
{
  "location": "Tokyo Office",
  "deviceId": "device-abc123"
}
```

### ClockOutDto

```json
{
  "location": "Tokyo Office",
  "deviceId": "device-abc123"
}
```

### ClockRecordResponseDto

```json
{
  "userId": "user123",
  "timestamp": "2025-12-25T09:00:00Z",
  "date": "2025-12-25",
  "type": "clock-in",
  "location": "Tokyo Office",
  "deviceId": "device-abc123"
}
```

## 関連ドキュメント

- [Backend README](../../apps/backend/README.md)
- [Architecture Documentation](../architecture/README.md)
- [DynamoDB Clock Table Design](../architecture/dynamodb-clock-table.md)
