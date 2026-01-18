# NestJS ユニットテスト

## 目的

ビジネスロジックの正確性とエラーハンドリングの検証

## テスト内容

### ビジネスルールの計算正当性
- 勤怠時間の計算
- 残業時間の算出
- 休暇日数の集計

### 入力値バリデーションの分岐
- DTOのバリデーションルール
- 境界値テスト

### 例外処理のハンドリング
- カスタム例外の適切なスロー
- エラーレスポンスの形式

## 使用ツール

**Jest**
- NestJS Testing Moduleを使用
- Serviceクラス、Utilityクラスの単体テスト
- 依存関係はMockで代替

## 実行タイミング

- 開発中（ファイル保存時）
- プルリクエスト作成時

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd apps/backend
npm test
```

## 実装例

```typescript
// apps/backend/src/attendance/attendance.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repository: AttendanceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repository = module.get<AttendanceRepository>(AttendanceRepository);
  });

  describe('calculateWorkingHours', () => {
    it('should calculate working hours correctly', () => {
      const clockIn = new Date('2024-01-01T09:00:00Z');
      const clockOut = new Date('2024-01-01T18:00:00Z');
      
      const hours = service.calculateWorkingHours(clockIn, clockOut);
      
      expect(hours).toBe(9);
    });

    it('should handle lunch break', () => {
      const clockIn = new Date('2024-01-01T09:00:00Z');
      const clockOut = new Date('2024-01-01T18:00:00Z');
      const lunchBreak = 60; // minutes
      
      const hours = service.calculateWorkingHours(clockIn, clockOut, lunchBreak);
      
      expect(hours).toBe(8);
    });

    it('should throw error for invalid time range', () => {
      const clockIn = new Date('2024-01-01T18:00:00Z');
      const clockOut = new Date('2024-01-01T09:00:00Z');
      
      expect(() => {
        service.calculateWorkingHours(clockIn, clockOut);
      }).toThrow('Clock-out time must be after clock-in time');
    });
  });

  describe('calculateOvertimeHours', () => {
    it('should calculate overtime hours correctly', () => {
      const workingHours = 10;
      const regularHours = 8;
      
      const overtime = service.calculateOvertimeHours(workingHours, regularHours);
      
      expect(overtime).toBe(2);
    });

    it('should return 0 for no overtime', () => {
      const workingHours = 7;
      const regularHours = 8;
      
      const overtime = service.calculateOvertimeHours(workingHours, regularHours);
      
      expect(overtime).toBe(0);
    });
  });
});

// apps/backend/src/attendance/dto/create-attendance.dto.spec.ts
import { validate } from 'class-validator';
import { CreateAttendanceDto } from './create-attendance.dto';

describe('CreateAttendanceDto', () => {
  it('should validate valid attendance data', async () => {
    const dto = new CreateAttendanceDto();
    dto.userId = 'user-123';
    dto.clockIn = new Date('2024-01-01T09:00:00Z');
    dto.clockOut = new Date('2024-01-01T18:00:00Z');

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation for missing userId', async () => {
    const dto = new CreateAttendanceDto();
    dto.clockIn = new Date('2024-01-01T09:00:00Z');
    dto.clockOut = new Date('2024-01-01T18:00:00Z');

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail validation for invalid date format', async () => {
    const dto = new CreateAttendanceDto();
    dto.userId = 'user-123';
    dto.clockIn = 'invalid-date' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

## テストカバレッジ目標

80%以上

## ベストプラクティス

### 1. 依存関係のモック

```typescript
const mockRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};
```

### 2. テストの独立性

各テストは他のテストに依存せず、独立して実行可能であること。

```typescript
beforeEach(() => {
  // 各テスト前に初期化
  jest.clearAllMocks();
});
```

### 3. AAA（Arrange-Act-Assert）パターン

```typescript
it('should do something', () => {
  // Arrange: テスト準備
  const input = 'test';
  
  // Act: 実行
  const result = service.doSomething(input);
  
  // Assert: 検証
  expect(result).toBe('expected');
});
```
