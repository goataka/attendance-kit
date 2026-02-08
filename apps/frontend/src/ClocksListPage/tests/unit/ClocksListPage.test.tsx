import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClocksListPage } from '../../ClocksListPage';
import { api } from '../../../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../../../shared/api', () => ({
  api: {
    getRecords: vi.fn(),
    isAuthenticated: vi.fn(() => true),
  },
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('ClocksListPage', () => {
  const mockRecords = [
    {
      id: '1',
      userId: 'user001',
      timestamp: '2026-01-10T09:00:00Z',
      type: 'clock-in' as const,
    },
    {
      id: '2',
      userId: 'user001',
      timestamp: '2026-01-10T18:00:00Z',
      type: 'clock-out' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトではログインしている状態
    vi.mocked(api.isAuthenticated).mockImplementation(() => true);
  });

  it('打刻一覧ページが表示されること', async () => {
    // Given: 打刻データが存在する
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: タイトルとデータが表示される
    expect(screen.getByText('打刻一覧')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
  });

  it('初期状態ではローディング表示されること', () => {
    // Given: APIがレスポンスを返さない
    vi.mocked(api.getRecords).mockImplementation(() => new Promise(() => {}));

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: ローディングが表示される
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('ロード後に打刻データが表示されること', async () => {
    // Given: 打刻データが存在する
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: 打刻データが表示される
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('出勤')[0]).toBeInTheDocument();
    });
  });

  it('データが空の場合はメッセージが表示されること', async () => {
    // Given: 打刻データが空
    vi.mocked(api.getRecords).mockResolvedValue([]);

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: 空のメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('打刻データがありません')).toBeInTheDocument();
    });
  });

  it('ユーザーIDでフィルタリングできること', async () => {
    // Given: 打刻データが存在する
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    renderWithRouter(<ClocksListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });

    // When: ユーザーIDを入力して検索
    const userIdFilter = screen.getByLabelText('User ID');
    fireEvent.change(userIdFilter, { target: { value: 'user002' } });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    // Then: フィルタ条件でAPIが呼ばれる
    await waitFor(() => {
      expect(api.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user002' }),
      );
    });
  });

  it('打刻種別でフィルタリングできること', async () => {
    // Given: 打刻データが存在する
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    renderWithRouter(<ClocksListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });

    // When: 打刻種別を選択して検索
    const typeFilter = screen.getByLabelText('打刻種別');
    fireEvent.change(typeFilter, { target: { value: 'clock-in' } });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    // Then: フィルタ条件でAPIが呼ばれる
    await waitFor(() => {
      expect(api.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'clock-in' }),
      );
    });
  });

  it('フィルターをリセットできること', async () => {
    // Given: 打刻データが存在する
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    renderWithRouter(<ClocksListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });

    // When: フィルターを設定してリセット
    const userIdFilter = screen.getByLabelText('User ID') as HTMLInputElement;
    fireEvent.change(userIdFilter, { target: { value: 'user002' } });

    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);

    // Then: フィルターがクリアされる
    await waitFor(() => {
      expect(userIdFilter.value).toBe('');
    });
  });

  it('API呼び出し失敗時に認証エラーメッセージが表示されること', async () => {
    // Given: APIが認証エラーを返す
    const errorMessage = 'Authentication required. Please log in first.';
    vi.mocked(api.getRecords).mockRejectedValue(new Error(errorMessage));

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('fetch失敗時に汎用エラーメッセージが表示されること', async () => {
    // Given: APIがfetchエラーを返す
    vi.mocked(api.getRecords).mockRejectedValue(
      new Error('Failed to fetch records'),
    );

    // When: ページをレンダリング
    renderWithRouter(<ClocksListPage />);

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch records')).toBeInTheDocument();
    });
  });
});
