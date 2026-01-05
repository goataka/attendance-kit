# 共通型定義パッケージ

勤怠管理システムの共通型定義を提供するパッケージ。

## 提供する型

### 打刻関連

- `ClockEvent` - 打刻イベント（DynamoDB保存用、1イベント=1レコード）
- `ClockRecord` - 打刻記録（フロントエンド表示用、ペアリング済み）
- `User` - ユーザー情報  
- `ClockInRequest` - 出勤打刻リクエスト
- `ClockOutRequest` - 退勤打刻リクエスト

### API関連

- `ApiResponse<T>` - API レスポンスラッパー
- `ApiError` - APIエラー

## 使用方法

### バックエンド（DynamoDB保存）

```typescript
import { ClockEvent } from '@attendance-kit/types';

const event: ClockEvent = {
  id: 'uuid-v4',
  userId: 'user001',
  timestamp: new Date(),
  type: 'clock-in',
  userName: 'テストユーザー',
};
```

### フロントエンド（表示用）

```typescript
import { ClockRecord } from '@attendance-kit/types';

const record: ClockRecord = {
  id: '1',
  userId: 'user001',
  clockInTime: new Date('2024-01-01T09:00:00'),
  clockOutTime: new Date('2024-01-01T18:00:00'),
  type: 'clock-out',
};
```

### API通信

```typescript
import { ApiResponse, ClockInRequest } from '@attendance-kit/types';

const request: ClockInRequest = {
  userId: 'user001',
  userName: 'テストユーザー',
};

const response: ApiResponse<ClockRecord> = await fetch('/api/clock-in', {
  method: 'POST',
  body: JSON.stringify(request),
}).then(res => res.json());
```
