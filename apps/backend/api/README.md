# API Documentation

このディレクトリには、Attendance Kit Backend APIのOpenAPI仕様書が含まれています。

## OpenAPI仕様書

- ファイル: [openapi.json](./openapi.json)
- 形式: OpenAPI 3.0
- 自動生成されます

## 仕様書の表示

### Swagger UI（ローカル）

```bash
cd apps/backend
npm run start:dev
```

ブラウザで http://localhost:3000/api/docs にアクセス

### オンラインエディタ

https://editor.swagger.io/ で`openapi.json`を開く

## 仕様書の更新

```bash
npm run generate:openapi
```

Pull Request作成時、GitHub Actionsが自動更新します。

## エンドポイント

| エンドポイント       | メソッド | 説明             | 認証    |
| -------------------- | -------- | ---------------- | ------- |
| `/api/clock/in`      | POST     | 出勤打刻         | JWT必須 |
| `/api/clock/out`     | POST     | 退勤打刻         | JWT必須 |
| `/api/clock/records` | GET      | 打刻記録一覧取得 | JWT必須 |
