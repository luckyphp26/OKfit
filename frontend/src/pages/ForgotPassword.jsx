import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      addToast('Reset instructions sent to your email', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to process reset request';
      setError(msg);
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '14px',
                color: 'var(--success)',
              }}
            >
              ✉️
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Check Your Inbox</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              If an account exists for <strong style={{ color: 'var(--text-main)' }}>{email}</strong>,
              you will receive a password reset link shortly.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
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
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Registered Email Address
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">✉</span>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="athlete@okfit.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" color="#0D1117" />
                  <span>Sending Link...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer-links">
          Remembered your password?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
