import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage';
import { AuthProvider } from '../shared/contexts/AuthContext';
import { api } from '../shared/api';

// Mock the API
vi.mock('../shared/api', () => ({
  api: {
    clockInOut: vi.fn(),
    login: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

function renderWithAuthAndRouter(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>,
  );
}

describe('ClockInOutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    // Set up authenticated state
    sessionStorageMock.setItem('attendance-kit-token', 'test-token');
    sessionStorageMock.setItem('attendance-kit-user-id', 'user001');
  });

  it('renders the clock in/out page for authenticated user', () => {
    renderWithAuthAndRouter(<ClockInOutPage />);
    
    expect(screen.getByText('勤怠打刻')).toBeInTheDocument();
    expect(screen.getByText('User: user001')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('出勤')).toBeInTheDocument();
    expect(screen.getByText('退勤')).toBeInTheDocument();
  });

  it('shows error when password is empty', async () => {
    renderWithAuthAndRouter(<ClockInOutPage />);
    
    const clockInButton = screen.getByText('出勤');
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
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
    
    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);
    
    renderWithAuthAndRouter(<ClockInOutPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');
    
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
    
    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);
    
    renderWithAuthAndRouter(<ClockInOutPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const clockInButton = screen.getByText('出勤');
    
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
    
    vi.mocked(api.clockInOut).mockResolvedValue(mockResponse);
    
    renderWithAuthAndRouter(<ClockInOutPage />);
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const clockInButton = screen.getByText('出勤');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(clockInButton);
    
    await waitFor(() => {
      expect(passwordInput.value).toBe('');
    });
  });
});
