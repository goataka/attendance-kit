import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage';
import { api } from '../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../shared/api', () => ({
  api: {
    clockInOut: vi.fn(),
    login: vi.fn(),
    isAuthenticated: vi.fn(),
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
    vi.mocked(api.isAuthenticated).mockReturnValue(false);
  });

  it('打刻ページが表示されること', () => {
    renderWithRouter(<ClockInOutPage />);
    
    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
  });

  it('入力フィールドが空の場合はエラーを表示すること', async () => {
    renderWithRouter(<ClockInOutPage />);
    
    const loginButton = screen.getByText('ログイン');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('User ID and password are required')).toBeInTheDocument();
    });
  });

  it('ログインが成功すること', async () => {
    vi.mocked(api.login).mockResolvedValue('mock-token');
    
    renderWithRouter(<ClockInOutPage />);
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('ログイン');
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
  });

  it('ログインが失敗すること', async () => {
    vi.mocked(api.login).mockResolvedValue(null);
    
    renderWithRouter(<ClockInOutPage />);
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('ログイン');
    
    fireEvent.change(userIdInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('ログイン済みの場合は打刻ボタンが表示されること', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    
    renderWithRouter(<ClockInOutPage />);
    
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('ログイン済みの場合は打刻ボタンが表示されること', () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    
    renderWithRouter(<ClockInOutPage />);
    
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('出勤打刻が成功すること', async () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
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
    
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Clock in successful/)).toBeInTheDocument();
    });
  });

  it('出勤打刻が失敗すること', async () => {
    vi.mocked(api.isAuthenticated).mockReturnValue(true);
    const mockResponse = {
      success: false,
      message: 'Invalid credentials',
    };
    
    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);
    
    renderWithRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('成功後にパスワードがクリアされること', async () => {
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };
    
    vi.mocked(api.login).mockResolvedValue('mock-token');
    
    renderWithRouter(<ClockInOutPage />);
    
    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const loginButton = screen.getByText('ログイン');
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(passwordInput.value).toBe('');
      expect(userIdInput.value).toBe('user001');
    });
  });
});
