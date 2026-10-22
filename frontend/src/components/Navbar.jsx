import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/scanner', label: 'Scanner', icon: '📷' },
    { to: '/history', label: 'History', icon: '📑' },
    { to: '/log', label: 'Food Log', icon: '🍽️' },
    { to: '/progress', label: 'Progress', icon: '📈' },
    { to: '/chat', label: 'AI Coach', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <NavLink to="/dashboard" className="brand-link">
          <div className="brand-logo-mark">OK</div>
          <div className="brand-text">
            OK<span>FIT</span>
          </div>
        </NavLink>
        <span className="brand-badge">PRO</span>
      </div>

      {/* Main Nav Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        {/* User Card */}
        {user && (
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name || 'Athlete'}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}

        <div className="footer-actions">
          <button
            type="button"
            className="footer-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            <span className="btn-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="btn-text">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button
            type="button"
            className="footer-btn logout-btn"
            onClick={handleLogout}
            title="Sign out of OKfit"
            aria-label="Log Out"
          >
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
