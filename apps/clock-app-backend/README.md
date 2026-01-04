# 勤怠アプリ バックエンド

勤怠管理システムのNestJSバックエンドアプリケーション。

## 技術スタック

- NestJS 10
- TypeScript
- Express

## 開発

```bash
# 開発サーバー起動
npm run dev:backend

# ビルド
npm run build:backend

# 本番起動
npm run start:prod
```

## API エンドポイント

- `POST /api/clock-in` - 出勤打刻
- `POST /api/clock-out` - 退勤打刻
- `GET /api/records` - 打刻履歴取得

## データストレージ

現在のMVP版では、メモリ内データストアを使用しています。
将来的にはDynamoDBなどのデータベースに移行予定です。
