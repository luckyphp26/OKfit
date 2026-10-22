import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(email.trim(), password);
      addToast('Welcome back to OKfit!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrors({ form: msg });
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-ambient-blob" />

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-badge">OK</div>
            <span className="auth-brand-name">
              OK<span>FIT</span>
            </span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to track your meals and macros</p>
        </div>

        {errors.form && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(218, 54, 51, 0.15)',
              border: '1px solid rgba(218, 54, 51, 0.4)',
              color: '#ff7b72',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">✉</span>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="athlete@okfit.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Options */}
          <div className="auth-options">
            <label className="auth-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 20px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="#0D1117" />
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          Don't have an account yet?
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
