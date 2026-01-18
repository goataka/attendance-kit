# React 統合テスト

## 目的

コンポーネント間の連携とAPI通信時のUI挙動を検証

## テスト内容

### コンポーネント間のProps受け渡し
- 親子コンポーネント間のデータフロー
- イベントハンドラの伝播

### APIレスポンス別のUI表示切替
- ローディング状態
- エラー状態
- 成功状態の表示

### MSWによる擬似的な通信エラー対応
- ネットワークエラー時のフォールバック
- リトライロジックの検証

## 使用ツール

**Storybook + MSW**
- Storybookでコンポーネントをカタログ化
- MSW（Mock Service Worker）でAPIモック
- @testing-library/reactで操作とアサーション

## 実行タイミング

- 開発中（Storybookサーバー起動時）
- プルリクエスト作成時

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd apps/frontend

# Storybook起動
npm run storybook

# Storybookビルド
npm run build-storybook

# Storybook統合テスト実行（test-storybook）
npm run test-storybook
```

## 実装例

### Storybookストーリー

```typescript
// apps/frontend/src/components/AttendanceForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { AttendanceForm } from './AttendanceForm';

const meta: Meta<typeof AttendanceForm> = {
  title: 'Components/AttendanceForm',
  component: AttendanceForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AttendanceForm>;

export const Default: Story = {
  args: {
    userId: 'user-123',
  },
};

export const Loading: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/attendance/clock-in', async () => {
          await new Promise(resolve => setTimeout(resolve, 3000));
          return HttpResponse.json({ id: '1', clockIn: '2024-01-01T09:00:00Z' });
        }),
      ],
    },
  },
};

export const Success: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/attendance/clock-in', () => {
          return HttpResponse.json({
            id: '1',
            userId: 'user-123',
            clockIn: '2024-01-01T09:00:00Z',
          });
        }),
      ],
    },
  },
};

export const Error: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/attendance/clock-in', () => {
          return HttpResponse.json(
            { message: 'Already clocked in today' },
            { status: 400 }
          );
        }),
      ],
    },
  },
};

export const NetworkError: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/attendance/clock-in', () => {
          return HttpResponse.error();
        }),
      ],
    },
  },
};

// apps/frontend/src/components/AttendanceList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { AttendanceList } from './AttendanceList';

const meta: Meta<typeof AttendanceList> = {
  title: 'Components/AttendanceList',
  component: AttendanceList,
};

export default meta;
type Story = StoryObj<typeof AttendanceList>;

const mockAttendances = [
  {
    id: '1',
    userId: 'user-123',
    clockIn: '2024-01-01T09:00:00Z',
    clockOut: '2024-01-01T18:00:00Z',
  },
  {
    id: '2',
    userId: 'user-123',
    clockIn: '2024-01-02T09:00:00Z',
    clockOut: '2024-01-02T18:00:00Z',
  },
];

export const Default: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/attendance', () => {
          return HttpResponse.json(mockAttendances);
        }),
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/attendance', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/attendance', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch attendances' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};
```

### インタラクションテスト

```typescript
// apps/frontend/src/components/AttendanceForm.stories.tsx（続き）
import { expect } from '@storybook/jest';
import { within, userEvent, waitFor } from '@storybook/testing-library';

export const InteractionTest: Story = {
  args: {
    userId: 'user-123',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/attendance/clock-in', () => {
          return HttpResponse.json({
            id: '1',
            userId: 'user-123',
            clockIn: new Date().toISOString(),
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 出勤ボタンをクリック
    const clockInButton = canvas.getByRole('button', { name: /出勤/i });
    await userEvent.click(clockInButton);

    // ローディング状態の確認
    await waitFor(() => {
      expect(canvas.getByText(/処理中/i)).toBeInTheDocument();
    });

    // 成功メッセージの確認
    await waitFor(() => {
      expect(canvas.getByText(/出勤しました/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  },
};

export const ValidationTest: Story = {
  args: {
    userId: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ユーザーIDが空の状態で出勤ボタンをクリック
    const clockInButton = canvas.getByRole('button', { name: /出勤/i });
    await userEvent.click(clockInButton);

    // バリデーションエラーの確認
    await waitFor(() => {
      expect(canvas.getByText(/ユーザーIDが必要です/i)).toBeInTheDocument();
    });
  },
};
```

### コンポーネント統合テスト

```typescript
// apps/frontend/src/pages/AttendancePage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AttendancePage } from './AttendancePage';

const server = setupServer(
  http.get('/api/attendance', () => {
    return HttpResponse.json([
      {
        id: '1',
        userId: 'user-123',
        clockIn: '2024-01-01T09:00:00Z',
        clockOut: '2024-01-01T18:00:00Z',
      },
    ]);
  }),
  http.post('/api/attendance/clock-in', () => {
    return HttpResponse.json({
      id: '2',
      userId: 'user-123',
      clockIn: new Date().toISOString(),
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AttendancePage', () => {
  it('should render attendance list', async () => {
    render(<AttendancePage userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });
  });

  it('should clock in successfully', async () => {
    render(<AttendancePage userId="user-123" />);

    const clockInButton = screen.getByRole('button', { name: /出勤/i });
    await userEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText(/出勤しました/i)).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    server.use(
      http.post('/api/attendance/clock-in', () => {
        return HttpResponse.json(
          { message: 'Already clocked in today' },
          { status: 400 }
        );
      })
    );

    render(<AttendancePage userId="user-123" />);

    const clockInButton = screen.getByRole('button', { name: /出勤/i });
    await userEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText(/既に出勤済みです/i)).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    server.use(
      http.post('/api/attendance/clock-in', () => {
        return HttpResponse.error();
      })
    );

    render(<AttendancePage userId="user-123" />);

    const clockInButton = screen.getByRole('button', { name: /出勤/i });
    await userEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText(/ネットワークエラー/i)).toBeInTheDocument();
    });
  });
});
```

## MSW設定

```typescript
// apps/frontend/.storybook/preview.ts
import { initialize, mswLoader } from 'msw-storybook-addon';

// MSWの初期化
initialize();

export const loaders = [mswLoader];

export const parameters = {
  msw: {
    handlers: {
      // デフォルトハンドラ
    },
  },
};
```

## ベストプラクティス

### 1. ストーリー単位での状態管理

各ストーリーは独立した状態を持つべき

### 2. APIレスポンスのバリエーション

- 成功
- ローディング
- エラー（400、404、500）
- ネットワークエラー

### 3. アクセシビリティチェック

```typescript
export const AccessibilityTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // アクセシビリティチェック
    await expect(canvas.getByRole('button')).toHaveAccessibleName();
  },
};
```

## 参考資料

- [Storybook公式ドキュメント](https://storybook.js.org/)
- [MSW公式ドキュメント](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
