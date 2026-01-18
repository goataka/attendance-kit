# React ユニットテスト

## 目的

UI非依存のロジックとカスタムフックの動作検証

## テスト内容

### Custom Hooksの戻り値
- useAttendance、useAuthなどのカスタムフック
- 状態管理とライフサイクルの検証

### 純粋な関数（Utils）の出力
- 日付フォーマット関数
- バリデーション関数
- 計算ロジック

### UI非依存のステート管理ロジック
- Redux/Zustandストアのreducers/actions
- ビジネスロジックの分離

## 使用ツール

**Jest**
- @testing-library/react-hooksを使用
- 純粋関数のテスト

## 実行タイミング

- 開発中（ファイル保存時）
- プルリクエスト作成時

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd apps/frontend
npm test
```

## 実装例

### Custom Hooksのテスト

```typescript
// apps/frontend/src/hooks/useAttendance.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAttendance } from './useAttendance';

describe('useAttendance', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAttendance());
    
    expect(result.current.attendances).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch attendance data', async () => {
    const mockData = [
      { id: '1', userId: 'user-123', clockIn: '2024-01-01T09:00:00Z' },
    ];
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;

    const { result, waitForNextUpdate } = renderHook(() => useAttendance());

    act(() => {
      result.current.fetchAttendances('user-123');
    });

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.attendances).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    const { result, waitForNextUpdate } = renderHook(() => useAttendance());

    act(() => {
      result.current.fetchAttendances('user-123');
    });

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.attendances).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should clock in', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', clockIn: '2024-01-01T09:00:00Z' }),
      })
    ) as jest.Mock;

    const { result, waitForNextUpdate } = renderHook(() => useAttendance());

    act(() => {
      result.current.clockIn('user-123');
    });

    await waitForNextUpdate();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/attendance/clock-in',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: 'user-123' }),
      })
    );
  });
});

// apps/frontend/src/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token', user: mockUser }),
      })
    ) as jest.Mock;

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    act(() => {
      result.current.login('test@example.com', 'password');
    });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('should logout', () => {
    localStorage.setItem('token', 'fake-token');
    
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

### Utils関数のテスト

```typescript
// apps/frontend/src/utils/date.test.ts
import { formatDate, parseDate, isWorkingDay } from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01T09:00:00Z');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-01');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/01');
      expect(formatDate(date, 'HH:mm')).toBe('09:00');
    });

    it('should handle invalid date', () => {
      expect(() => formatDate(new Date('invalid'), 'YYYY-MM-DD')).toThrow();
    });
  });

  describe('parseDate', () => {
    it('should parse date string correctly', () => {
      const date = parseDate('2024-01-01');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('should handle invalid date string', () => {
      expect(() => parseDate('invalid')).toThrow();
    });
  });

  describe('isWorkingDay', () => {
    it('should return true for weekdays', () => {
      const monday = new Date('2024-01-01'); // Monday
      expect(isWorkingDay(monday)).toBe(true);
    });

    it('should return false for weekends', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      expect(isWorkingDay(saturday)).toBe(false);
    });
  });
});

// apps/frontend/src/utils/validation.test.ts
import { validateEmail, validatePassword, validateRequired } from './validation';

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.jp')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      expect(validatePassword('Passw0rd!')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('password')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty value', () => {
      expect(validateRequired('value')).toBe(true);
    });

    it('should reject empty value', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });
});
```

### ストアのテスト（Zustand例）

```typescript
// apps/frontend/src/stores/attendance.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAttendanceStore } from './attendance';

describe('attendanceStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAttendanceStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAttendanceStore());
    
    expect(result.current.attendances).toEqual([]);
    expect(result.current.selectedDate).toBeNull();
  });

  it('should add attendance', () => {
    const { result } = renderHook(() => useAttendanceStore());
    const attendance = {
      id: '1',
      userId: 'user-123',
      clockIn: '2024-01-01T09:00:00Z',
    };

    act(() => {
      result.current.addAttendance(attendance);
    });

    expect(result.current.attendances).toHaveLength(1);
    expect(result.current.attendances[0]).toEqual(attendance);
  });

  it('should update attendance', () => {
    const { result } = renderHook(() => useAttendanceStore());
    const attendance = {
      id: '1',
      userId: 'user-123',
      clockIn: '2024-01-01T09:00:00Z',
    };

    act(() => {
      result.current.addAttendance(attendance);
      result.current.updateAttendance('1', { clockOut: '2024-01-01T18:00:00Z' });
    });

    expect(result.current.attendances[0].clockOut).toBe('2024-01-01T18:00:00Z');
  });

  it('should set selected date', () => {
    const { result } = renderHook(() => useAttendanceStore());
    const date = '2024-01-01';

    act(() => {
      result.current.setSelectedDate(date);
    });

    expect(result.current.selectedDate).toBe(date);
  });
});
```

## テストカバレッジ目標

70%以上

## ベストプラクティス

### 1. カスタムフックは独立してテスト

```typescript
const { result } = renderHook(() => useCustomHook());
```

### 2. 非同期処理の適切な待機

```typescript
await waitForNextUpdate();
```

### 3. グローバルなモックのクリーンアップ

```typescript
afterEach(() => {
  jest.restoreAllMocks();
});
```
