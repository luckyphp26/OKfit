import React from 'react';

const MacroBar = ({
  label,
  value = 0,
  target = 100,
  unit = 'g',
  color = 'var(--secondary)',
  icon = '',
}) => {
  const current = Math.max(0, Math.round(value));
  const max = Math.max(1, Math.round(target));
  const percentage = Math.min(100, Math.round((current / max) * 100));
  const isOver = current > max;

  return (
    <div className="macro-bar-container" style={{ margin: '14px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '6px',
          fontSize: '0.9rem',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <strong style={{ color: isOver ? 'var(--error)' : 'var(--text-main)' }}>{current}</strong> / {max}{unit}
          <span style={{ marginLeft: '8px', opacity: 0.75, fontSize: '0.8rem' }}>({percentage}%)</span>
        </span>
      </div>

      <div
        style={{
          height: '10px',
          width: '100%',
          backgroundColor: 'var(--card-surface)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: isOver
              ? 'linear-gradient(90deg, #F5A524, #DA3633)'
              : color,
            borderRadius: '999px',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 0 10px ${isOver ? 'rgba(218, 54, 51, 0.4)' : 'rgba(18, 128, 111, 0.3)'}`,
          }}
        />
      </div>
    </div>
  );
};

export default MacroBar;
