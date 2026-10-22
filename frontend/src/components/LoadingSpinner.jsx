import React from 'react';

export const LoadingSpinner = ({ size = 'medium', color = 'var(--primary)' }) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '44px',
  };

  const dimension = sizeMap[size] || size;

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        border: `3px solid rgba(255, 255, 255, 0.15)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'okfit-spin 0.75s linear infinite',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      aria-label="Loading"
      role="status"
    />
  );
};

export const FullPageLoader = ({ message = 'Loading OKfit...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        gap: '18px',
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '2.4rem',
          fontWeight: 800,
          letterSpacing: '1px',
        }}
      >
        OK<span style={{ color: 'var(--primary)' }}>FIT</span>
      </div>
      <LoadingSpinner size="large" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message}</p>
    </div>
  );
};

export const Skeleton = ({ height = '20px', width = '100%', radius = '8px', style = {} }) => {
  return (
    <div
      className="skeleton-pulse"
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: 'var(--card-surface)',
        ...style,
      }}
    />
  );
};

export default LoadingSpinner;
