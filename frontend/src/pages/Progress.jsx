import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/LoadingSpinner';
import './Progress.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const Progress = () => {
  const [profile, setProfile] = useState(null);
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { addToast } = useToast();

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getProfile();
      if (data?.profile) {
        setProfile(data.profile);
        setWeightInput(data.profile.weight ? String(data.profile.weight) : '');
      }
      if (data?.weights) {
        setWeights(data.weights);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load weight metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, []);

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    setFormError('');

    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 20 || val > 300) {
      setFormError('Please enter a realistic weight between 20 kg and 300 kg.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userService.addWeight(val);
      if (res?.weights) {
        setWeights(res.weights);
      }
      setProfile((prev) => ({ ...prev, weight: val }));
      addToast(`Weigh-in recorded: ${val} kg`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save weigh-in', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computations
  const currentWeight = weights.length
    ? weights[weights.length - 1].kg
    : profile?.weight || 70;
  const initialWeight = weights.length ? weights[0].kg : currentWeight;
  const weightChange = currentWeight - initialWeight;

  const heightInMeters = (profile?.height || 175) / 100;
  const bmi = currentWeight / (heightInMeters * heightInMeters);

  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: 'Underweight', color: 'var(--warning)' };
    if (val < 25) return { label: 'Healthy Weight', color: 'var(--success)' };
    if (val < 30) return { label: 'Overweight', color: 'var(--warning)' };
    return { label: 'Obese', color: 'var(--error)' };
  };

  const bmiCat = getBmiCategory(bmi);

  // Line Chart Config
  const chartData = {
    labels: weights.map((w) => {
      const d = new Date(w.date + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights.map((w) => w.kg),
        borderColor: '#F5A524',
        backgroundColor: 'rgba(245, 165, 36, 0.12)',
        borderWidth: 3,
        pointBackgroundColor: '#F5A524',
        pointBorderColor: '#0D1117',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        titleColor: '#E6EDF3',
        bodyColor: '#F5A524',
        padding: 10,
        borderColor: 'rgba(245, 165, 36, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.raw} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8B949E', font: { family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#8B949E', font: { family: 'Inter' } },
        suggestedMin: Math.min(...weights.map((w) => w.kg), currentWeight) - 2,
        suggestedMax: Math.max(...weights.map((w) => w.kg), currentWeight) + 2,
      },
    },
  };

  return (
    <div className="progress-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress & Metrics</h1>
          <p className="page-subtitle">Track body weight shifts, BMI indicators, and trends</p>
        </div>
      </div>

      {/* Top Highlight Cards */}
      <div className="progress-metrics-row">
        {/* Current Weight Card */}
        <div className="glass-card stat-badge-card">
          <span className="stat-card-label">Current Weight</span>
          <div className="stat-card-value-row">
            <span className="stat-big-number">{currentWeight.toFixed(1)}</span>
            <span className="stat-big-unit">kg</span>
          </div>
          <span className="stat-card-sub">
            Change:{' '}
            <strong
              style={{
                color: weightChange <= 0 ? 'var(--success)' : 'var(--warning)',
              }}
            >
              {weightChange > 0 ? `+${weightChange.toFixed(1)}` : weightChange.toFixed(1)} kg
            </strong>{' '}
            since start
          </span>
        </div>

        {/* BMI Card */}
        <div className="glass-card stat-badge-card">
          <span className="stat-card-label">Body Mass Index (BMI)</span>
          <div className="stat-card-value-row">
            <span className="stat-big-number" style={{ color: bmiCat.color }}>
              {bmi.toFixed(1)}
            </span>
            <span className="stat-big-unit">kg/m²</span>
          </div>
          <span className="stat-card-sub" style={{ color: bmiCat.color, fontWeight: 600 }}>
            ● {bmiCat.label}
          </span>
        </div>

        {/* Recorded Entries Card */}
        <div className="glass-card stat-badge-card">
          <span className="stat-card-label">Weigh-In Logs</span>
          <div className="stat-card-value-row">
            <span className="stat-big-number">{weights.length}</span>
            <span className="stat-big-unit">logs</span>
          </div>
          <span className="stat-card-sub">
            Height registered: <strong>{profile?.height || 175} cm</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Weight Log Form + Trend Chart */}
      <div className="progress-grid">
        {/* WEIGH IN FORM */}
        <div className="glass-card log-weigh-card">
          <h2 className="progress-card-title">Log Today's Weight</h2>
          <p className="progress-card-sub">
            Weigh yourself at the same time each morning for best consistency
          </p>

          {formError && <div className="progress-form-error">{formError}</div>}

          <form onSubmit={handleSaveWeight}>
            <div className="form-group">
              <label className="form-label" htmlFor="weight-input">
                Weight in Kilograms (kg)
              </label>
              <div className="weight-input-wrap">
                <input
                  id="weight-input"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  className="form-input"
                  placeholder="72.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  required
                />
                <span className="weight-unit-tag">kg</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording...' : 'Save Weigh-In'}
            </button>
          </form>

          <div className="bmi-scale-explainer">
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Standard BMI Ranges</h4>
            <div className="scale-line">
              <div className="scale-seg under" title="Underweight (&lt; 18.5)">
                &lt;18.5
              </div>
              <div className="scale-seg normal" title="Healthy (18.5 - 24.9)">
                18.5 - 24.9
              </div>
              <div className="scale-seg over" title="Overweight (25 - 29.9)">
                25 - 29.9
              </div>
              <div className="scale-seg obese" title="Obese (&gt; 30)">
                30+
              </div>
            </div>
          </div>
        </div>

        {/* WEIGHT OVER TIME CHART */}
        <div className="glass-card chart-card">
          <h2 className="progress-card-title">Weight Over Time</h2>
          <p className="progress-card-sub">Long-term progress trajectory</p>

          <div className="progress-chart-wrapper">
            {isLoading ? (
              <Skeleton height="100%" radius="12px" />
            ) : weights.length > 1 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="not-enough-data">
                <span style={{ fontSize: '2.5rem' }}>⚖️</span>
                <h4>Need at least 2 weigh-ins to plot your curve</h4>
                <p>Record your weight regularly to uncover trends and patterns.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
