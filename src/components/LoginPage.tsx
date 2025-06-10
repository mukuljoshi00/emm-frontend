import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/Api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use centralized login API
      const data = await login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        // Decode JWT to check role
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === 'SUPER_ADMIN') {
          localStorage.setItem('userRole', 'SUPER_ADMIN');
        } else {
          localStorage.setItem('userRole', payload.role || '');
        }
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome</h1>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="hint-text">
          Demo: admin@example.com / password
        </p>
      </div>
    </div>
  );
};

export default LoginPage;