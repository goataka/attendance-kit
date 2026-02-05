import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../shared/api';
import { TEST_ACCOUNTS } from '../shared/constants';
import './ClockInOutPage.css';

export function ClockInOutPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 認証状態を確認
    setIsAuthenticated(api.isAuthenticated());
  }, []);

  const handleLogin = async () => {
    if (!userId || !password) {
      setMessage({ type: 'error', text: 'User ID and password are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = await api.login(userId, password);

      if (token) {
        setMessage({
          type: 'success',
          text: 'Login successful',
        });
        setIsAuthenticated(true);
        // セキュリティのためパスワードをクリア
        setPassword('');
      } else {
        setMessage({ type: 'error', text: 'Invalid credentials' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUserId('');
    setPassword('');
    setMessage({ type: 'success', text: 'Logged out successfully' });
  };

  const handleClockInOut = async (type: 'clock-in' | 'clock-out') => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.clockInOutWithToken(type);

      if (response.success) {
        const clockType = type === 'clock-in' ? 'Clock in' : 'Clock out';
        const timestamp = new Date(response.record!.timestamp).toLocaleString('ja-JP');
        setMessage({
          type: 'success',
          text: `${clockType} successful at ${timestamp}`,
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to process request' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clock-in-out-page">
      <div className="container">
        <h1>勤怠打刻</h1>

        <div className="form-section">
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* 出勤・退勤ボタンは常に表示 */}
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => handleClockInOut('clock-in')}
              disabled={loading || !isAuthenticated}
            >
              出勤
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleClockInOut('clock-out')}
              disabled={loading || !isAuthenticated}
            >
              退勤
            </button>
          </div>

          {/* 未ログイン時：ログインフォームとログインボタンを表示 */}
          {!isAuthenticated && (
            <>
              <div className="form-group">
                <label htmlFor="userId">User ID</label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your user ID"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                className="btn btn-login"
                onClick={handleLogin}
                disabled={loading}
              >
                ログイン
              </button>

              <div className="help-text">
                <p>テスト用アカウント:</p>
                <ul>
                  {TEST_ACCOUNTS.map((account) => (
                    <li key={account.userId}>
                      {`${account.userId} / ${account.password}`}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ログイン済み時：ログアウトボタンを表示 */}
          {isAuthenticated && (
            <button
              className="btn btn-tertiary"
              onClick={handleLogout}
              disabled={loading}
            >
              ログアウト
            </button>
          )}
        </div>

        {isAuthenticated && (
          <div className="navigation">
            <Link to="/clocks" className="link">
              打刻一覧を見る →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
