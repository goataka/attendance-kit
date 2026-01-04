# 共通型定義パッケージ

勤怠管理システムの共通型定義を提供するパッケージ。

## 提供する型

- `ClockRecord` - 打刻記録
- `User` - ユーザー情報  
- `ClockInRequest` - 出勤打刻リクエスト
- `ClockOutRequest` - 退勤打刻リクエスト
- `ApiResponse<T>` - API レスポンスラッパー
- `ApiError` - APIエラー

## 使用方法

```typescript
import { ClockRecord, ApiResponse } from '@attendance-kit/types';

const record: ClockRecord = {
  id: '1',
  userId: 'user001',
  clockInTime: new Date(),
  type: 'clock-in',
};
```
