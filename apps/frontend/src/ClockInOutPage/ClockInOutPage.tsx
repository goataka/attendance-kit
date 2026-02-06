import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../shared/api';
import { TEST_ACCOUNTS } from '../shared/constants';
import './ClockInOutPage.css';

export function ClockInOutPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleClockInOut = async (type: 'clock-in' | 'clock-out') => {
    if (!userId || !password) {
      setMessage({ type: 'error', text: 'User ID and password are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.clockInOut({ userId, password, type });

      if (response.success) {
        const clockType = type === 'clock-in' ? 'Clock in' : 'Clock out';
        const timestamp = new Date(response.record!.timestamp).toLocaleString(
          'ja-JP',
        );
        setMessage({
          type: 'success',
          text: `${clockType} successful at ${timestamp}`,
        });
        // Clear password for security
        setPassword('');
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to process request',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clock-in-out-page">
      <div className="container">
        <h1>勤怠打刻</h1>

        <div className="form-section">
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

          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => handleClockInOut('clock-in')}
              disabled={loading}
            >
              出勤
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleClockInOut('clock-out')}
              disabled={loading}
            >
              退勤
            </button>
          </div>
        </div>

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

        <div className="navigation">
          <Link to="/clocks" className="link">
            打刻一覧を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
