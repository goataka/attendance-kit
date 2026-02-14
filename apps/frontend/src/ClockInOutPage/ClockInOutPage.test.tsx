import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage';
import { api } from '../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../shared/api', () => ({
  api: {
    login: vi.fn(),
    clockInOut: vi.fn(),
  },
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('ClockInOutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('打刻ページが表示されること', () => {
    // Given: ClockInOutPageコンポーネント
    // When: ClockInOutPageをレンダリング
    renderWithRouter(<ClockInOutPage />);

    // Then: ページタイトルと入力フィールド、ボタンが表示される
    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
  });

  it('ログインが成功すること', async () => {
    // Given: APIがログイン成功を返すようモック設定
    vi.mocked(api.login).mockResolvedValue(true);

    renderWithRouter(<ClockInOutPage />);

    // When: ユーザーIDとパスワードを入力してログインボタンをクリック
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('ログイン');

    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Then: 成功メッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
  });

  it('ログインが失敗した場合はエラーを表示すること', async () => {
    // Given: APIがログイン失敗を返すようモック設定
    vi.mocked(api.login).mockResolvedValue(false);

    renderWithRouter(<ClockInOutPage />);

    // When: ユーザーIDとパスワードを入力してログインボタンをクリック
    fireEvent.change(screen.getByLabelText('User ID'), {
      target: { value: 'user001' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByText('ログイン'));

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('ログインで例外が発生した場合は汎用エラーを表示すること', async () => {
    // Given: APIが例外をスローするようモック設定
    vi.mocked(api.login).mockRejectedValue(new Error('network error'));

    renderWithRouter(<ClockInOutPage />);

    // When: ユーザーIDとパスワードを入力してログインボタンをクリック
    fireEvent.change(screen.getByLabelText('User ID'), {
      target: { value: 'user001' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('ログイン'));

    // Then: 汎用エラーメッセージが表示される
    await waitFor(() => {
      expect(
        screen.getByText('An error occurred. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('入力フィールドが空の場合はエラーを表示すること', async () => {
    // Given: 入力フィールドが空の状態
    renderWithRouter(<ClockInOutPage />);

    // When: 出勤ボタンをクリック
    const clockInButton = screen.getByText('出勤');
    fireEvent.click(clockInButton);

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(
        screen.getByText('User ID and password are required'),
      ).toBeInTheDocument();
    });
  });

  it('ログイン時に入力が空の場合はエラーを表示すること', async () => {
    // Given: 入力フィールドが空の状態
    renderWithRouter(<ClockInOutPage />);

    // When: ログインボタンをクリック
    fireEvent.click(screen.getByText('ログイン'));

    // Then: エラーメッセージが表示され、APIは呼ばれない
    await waitFor(() => {
      expect(
        screen.getByText('User ID and password are required'),
      ).toBeInTheDocument();
    });
    expect(api.login).not.toHaveBeenCalled();
  });

  it('出勤打刻が成功すること', async () => {
    // Given: APIが成功レスポンスを返すようモック設定
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };

    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);

    renderWithRouter(<ClockInOutPage />);

    // When: ユーザーIDとパスワードを入力して出勤ボタンをクリック
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');

    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(clockInButton);

    // Then: 成功メッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/Clock in successful/)).toBeInTheDocument();
    });
  });

  it('出勤打刻が失敗すること', async () => {
    // Given: APIが失敗レスポンスを返すようモック設定
    const mockResponse = {
      success: false,
      message: 'Invalid credentials',
    };

    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);

    renderWithRouter(<ClockInOutPage />);

    // When: 無効な認証情報を入力して出勤ボタンをクリック
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');

    fireEvent.change(userIdInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(clockInButton);

    // Then: エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('成功後にパスワードがクリアされること', async () => {
    // Given: APIが成功レスポンスを返すようモック設定
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };

    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);

    renderWithRouter(<ClockInOutPage />);

    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const clockInButton = screen.getByText('出勤');

    // When: ユーザーIDとパスワードを入力して出勤ボタンをクリック
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(clockInButton);

    // Then: パスワードがクリアされ、ユーザーIDは保持される
    await waitFor(() => {
      expect(passwordInput.value).toBe('');
      expect(userIdInput.value).toBe('user001');
    });
  });
});
