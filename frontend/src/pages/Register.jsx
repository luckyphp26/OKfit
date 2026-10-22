import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Compute password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'None', color: 'transparent', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score, text: 'Weak', color: 'var(--error)', width: '25%' };
      case 2:
        return { score, text: 'Fair', color: 'var(--warning)', width: '50%' };
      case 3:
        return { score, text: 'Good', color: 'var(--secondary)', width: '75%' };
      case 4:
      default:
        return { score, text: 'Strong', color: 'var(--success)', width: '100%' };
    }
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }

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

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.terms = 'You must accept the terms & privacy policy to continue';
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
      await register(name.trim(), email.trim(), password);
      addToast('Account created successfully! Welcome to OKfit.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start tracking nutrition and hit your goals</p>
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
          {/* Name field */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">👤</span>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">✉</span>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="alex@example.com"
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
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">🔒</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Password Strength Indicator */}
          {password && (
            <div className="password-strength-container">
              <div className="password-strength-bar">
                <div
                  className="password-strength-fill"
                  style={{
                    width: strength.width,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <div className="password-strength-label">
                <span>Strength:</span>
                <span style={{ color: strength.color, fontWeight: 600 }}>{strength.text}</span>
              </div>
            </div>
          )}

          {/* Confirm Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">🔐</span>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                I agree to the <span style={{ color: 'var(--primary)' }}>Terms of Service</span> and{' '}
                <span style={{ color: 'var(--primary)' }}>Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <span className="form-error">{errors.terms}</span>}
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
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
