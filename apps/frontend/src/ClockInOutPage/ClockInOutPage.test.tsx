import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage';
import { api } from '../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../shared/api', () => ({
  api: {
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
    renderWithRouter(<ClockInOutPage />);

    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
  });

  it('入力フィールドが空の場合はエラーを表示すること', async () => {
    renderWithRouter(<ClockInOutPage />);

    const clockInButton = screen.getByText('出勤');
    fireEvent.click(clockInButton);

    await waitFor(() => {
      expect(
        screen.getByText('User ID and password are required'),
      ).toBeInTheDocument();
    });
  });

  it('出勤打刻が成功すること', async () => {
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
  });

  it('出勤打刻が失敗すること', async () => {
    const mockResponse = {
      success: false,
      message: 'Invalid credentials',
    };

    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);

    renderWithRouter(<ClockInOutPage />);

    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');

    fireEvent.change(userIdInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
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

    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);

    renderWithRouter(<ClockInOutPage />);

    const userIdInput = screen.getByLabelText('User ID') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const clockInButton = screen.getByText('出勤');

    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(clockInButton);

    await waitFor(() => {
      expect(passwordInput.value).toBe('');
      expect(userIdInput.value).toBe('user001');
    });
  });
});
