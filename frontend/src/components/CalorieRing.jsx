import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

const CalorieRing = ({ eaten = 0, target = 2000, size = 190 }) => {
  const safeEaten = Math.max(0, Math.round(eaten));
  const safeTarget = Math.max(1, Math.round(target));
  const remaining = safeTarget - safeEaten;
  const isOver = remaining < 0;

  const data = {
    labels: ['Eaten', 'Remaining'],
    datasets: [
      {
        data: isOver ? [safeEaten, 0] : [safeEaten, remaining],
        backgroundColor: isOver
          ? ['#DA3633', 'rgba(255, 255, 255, 0.05)']
          : ['#F5A524', 'rgba(255, 255, 255, 0.07)'],
        borderColor: 'transparent',
        hoverOffset: 2,
        borderRadius: 8,
        spacing: 2,
      },
    ],
  };

  const options = {
    cutout: '78%',
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        titleColor: '#E6EDF3',
        bodyColor: '#F5A524',
        padding: 10,
        borderColor: 'rgba(245, 165, 36, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} kcal`,
        },
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Doughnut data={data} options={options} />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: isOver ? 'var(--error)' : 'var(--text-main)',
          }}
        >
          {Math.abs(remaining)}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginTop: '4px',
          }}
        >
          {isOver ? 'kcal over' : 'kcal remaining'}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--primary)',
            fontWeight: 500,
            marginTop: '2px',
          }}
        >
          Target: {safeTarget}
        </span>
      </div>
    </div>
  );
};

export default CalorieRing;
