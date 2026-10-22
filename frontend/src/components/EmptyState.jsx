import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '🍽️',
  title = 'No records found',
  description = 'Start tracking your nutrition and meals to see insights here.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--card-bg)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: '16px',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          lineHeight: 1,
          marginBottom: '16px',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
          animation: 'bounceSlow 2.5s infinite ease-in-out',
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.92rem',
          maxWidth: '380px',
          lineHeight: 1.5,
          margin: '0 0 20px 0',
        }}
      >
        {description}
      </p>

      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary btn-sm">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary btn-sm">
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
