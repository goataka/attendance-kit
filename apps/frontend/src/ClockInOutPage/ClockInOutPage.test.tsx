import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage';
import { mockApi } from '../shared/api/mockApi';

// Mock the API
vi.mock('../shared/api/mockApi', () => ({
  mockApi: {
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

  it('renders the clock in/out page', () => {
    renderWithRouter(<ClockInOutPage />);
    
    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    renderWithRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(screen.getByText('User ID and password are required')).toBeInTheDocument();
    });
  });

  it('handles successful clock in', async () => {
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };
    
    vi.mocked(mockApi.clockInOut).mockResolvedValue(mockResponse);
    
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

  it('handles failed clock in', async () => {
    const mockResponse = {
      success: false,
      message: 'Invalid credentials',
    };
    
    vi.mocked(mockApi.clockInOut).mockResolvedValue(mockResponse);
    
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

  it('clears password after successful clock in', async () => {
    const mockResponse = {
      success: true,
      record: {
        id: '1',
        userId: 'user001',
        timestamp: new Date().toISOString(),
        type: 'clock-in' as const,
      },
    };
    
    vi.mocked(mockApi.clockInOut).mockResolvedValue(mockResponse);
    
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
