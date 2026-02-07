import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from '../../ClockInOutPage';
import { api } from '../../../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../../../shared/api', () => ({
  api: {
    clockInOut: vi.fn(),
    clockInOutWithToken: vi.fn(),
    login: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    logout: vi.fn(),
  },
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('ClockInOutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトではログインしていない状態
    vi.mocked(api.isAuthenticated).mockImplementation(() => false);
  });

  it('打刻ページが表示されること', () => {
    renderWithRouter(<ClockInOutPage />);

    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
  });

  it('入力フィールドが空の場合はエラーを表示すること', async () => {
    renderWithRouter(<ClockInOutPage />);
    
    const loginButton = screen.getByText('ログイン');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(
        screen.getByText('User ID and password are required'),
      ).toBeInTheDocument();
    });
  });

  test.each([
    {
      ケース: 'ログインが成功すること',
      モック戻り値: 'mock-token',
      入力値: { userId: 'user001', password: 'password123' },
      期待メッセージ: 'Login successful',
    },
    {
      ケース: 'ログインが失敗すること',
      モック戻り値: null,
      入力値: { userId: 'wronguser', password: 'wrongpass' },
      期待メッセージ: 'Invalid credentials',
    },
  ])('$ケース', async ({ モック戻り値, 入力値, 期待メッセージ }) => {
    vi.mocked(api.login).mockResolvedValue(モック戻り値);
    
    renderWithRouter(<ClockInOutPage />);
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('ログイン');
    
    fireEvent.change(userIdInput, { target: { value: 入力値.userId } });
    fireEvent.change(passwordInput, { target: { value: 入力値.password } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(期待メッセージ)).toBeInTheDocument();
    });
  });

  it('ログイン済みの場合は打刻ボタンが有効でログインフォームは非表示', () => {
    vi.mocked(api.isAuthenticated).mockImplementation(() => true);
    
    renderWithRouter(<ClockInOutPage />);
    
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
    expect(screen.queryByLabelText('User ID')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('未ログイン時でもユーザーIDとパスワードで出勤打刻が成功すること', async () => {
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
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText(/Clock in successful/)).toBeInTheDocument();
    });
    
    expect(api.clockInOut).toHaveBeenCalledWith({
      userId: 'user001',
      password: 'password123',
      type: 'clock-in',
    });
  });

  it('未ログイン時に入力フィールドが空の場合はエラーを表示すること', async () => {
    renderWithRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(
        screen.getByText('User ID and password are required'),
      ).toBeInTheDocument();
    });
  });

  it('ログイン済みの場合はトークンで出勤打刻が成功すること', async () => {
    vi.mocked(api.isAuthenticated).mockImplementation(() => true);
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };
    
    vi.mocked(api.clockInOutWithToken).mockResolvedValue(mockResponse);
    
    renderWithRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText(/Clock in successful/)).toBeInTheDocument();
    });
  });

  it('出勤打刻が失敗すること', async () => {
    vi.mocked(api.isAuthenticated).mockImplementation(() => true);
    const mockResponse = {
      success: false,
      message: 'Invalid credentials',
    };
    
    vi.mocked(api.clockInOutWithToken).mockResolvedValue(mockResponse);
    
    renderWithRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.click(clockInButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('ログイン成功後にフォームが非表示になりパスワードが保持されないこと', async () => {
    vi.mocked(api.login).mockResolvedValue('mock-token');
    vi.mocked(api.isAuthenticated).mockImplementation(() => false);
    
    renderWithRouter(<ClockInOutPage />);

    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButton = screen.getByText('ログイン');
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
    
    // ログイン後、フォームが非表示になることを確認
    expect(screen.queryByLabelText('User ID')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
});
