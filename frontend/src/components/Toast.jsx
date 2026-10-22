import React from 'react';
import './Toast.css';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type || 'info'}`}>
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <div className="toast-content">{toast.message}</div>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
