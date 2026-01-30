import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../shared/contexts/AuthContext';
import * as api from '../shared/api';

// Mock the api module
vi.mock('../shared/api', () => ({
  api: {
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

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLoginPage();
    
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeTruthy();
    expect(screen.getByLabelText('User ID')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeTruthy();
  });

  it('displays test accounts', () => {
    renderLoginPage();
    
    expect(screen.getByText('テスト用アカウント:')).toBeTruthy();
    expect(screen.getByText(/user001/)).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    renderLoginPage();
    
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('User ID and password are required')).toBeTruthy();
    });
  });

  it('calls login and navigates on success', async () => {
    vi.mocked(api.api.login).mockResolvedValue({
      token: 'test-token',
      userId: 'user001',
    });

    renderLoginPage();
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(api.api.login).toHaveBeenCalledWith('user001', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/clocks');
    });
  });

  it('shows error on login failure', async () => {
    vi.mocked(api.api.login).mockResolvedValue(null);

    renderLoginPage();
    
    const userIdInput = screen.getByLabelText('User ID');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(userIdInput, { target: { value: 'user001' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials. Please try again.')).toBeTruthy();
    });
  });
});
