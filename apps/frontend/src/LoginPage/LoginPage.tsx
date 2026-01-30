import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';
import { TEST_ACCOUNTS } from '../shared/constants';
import './LoginPage.css';

export function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !password) {
      setError('User ID and password are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(userId, password);
      
      if (success) {
        // ログイン成功後、打刻一覧にリダイレクト
        navigate('/clocks');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <h1>ログイン</h1>
        
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              disabled={loading}
              autoComplete="username"
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
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

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
      </div>
    </div>
  );
}
