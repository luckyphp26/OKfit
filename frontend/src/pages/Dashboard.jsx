import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import foodLogService from '../services/foodLogService';
import userService from '../services/userService';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { Skeleton } from '../components/LoadingSpinner';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [todayEntries, setTodayEntries] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return Number(localStorage.getItem(`okfit_water_${today}`)) || 4;
  });
  const [weekData, setWeekData] = useState([]);

  // Calculate targets using Mifflin-St Jeor formula
  const getTargets = (p) => {
    if (!p) {
      return { kcal: 2000, p: 140, c: 220, f: 60 };
    }
    const bmr =
      10 * p.weight +
      6.25 * p.height -
      5 * p.age +
      (p.gender === 'male' ? 5 : p.gender === 'female' ? -161 : -78);
    const tdee = bmr * (p.activity || 1.375);
    const kcal = Math.max(
      1200,
      Math.round(tdee + (p.goal === 'loss' ? -500 : p.goal === 'gain' ? 300 : 0))
    );
    const pr = Math.round(p.weight * (p.goal === 'maintain' ? 1.6 : 2));
    const f = Math.round((kcal * 0.25) / 9);
    const c = Math.max(0, Math.round((kcal - pr * 4 - f * 9) / 4));
    return { kcal, p: pr, f, c };
  };

  const targets = getTargets(profile);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch Dashboard data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const todayStr = new Date().toISOString().slice(0, 10);

        // Fetch profile
        const profRes = await userService.getProfile();
        if (isMounted && profRes?.profile) {
          setProfile(profRes.profile);
        }

        // Fetch today's summary & entries
        const sumRes = await foodLogService.getDailySummary(todayStr);
        if (isMounted && sumRes) {
          setTodaySummary(sumRes.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 });
          setTodayEntries(sumRes.entries || []);
        }

        // Fetch last 7 days for trend
        const past7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });

        const entriesRes = await foodLogService.getEntries(past7Days[0], past7Days[6]);
        const entries = entriesRes?.entries || [];

        const weekStats = past7Days.map((dStr) => {
          const dayItems = entries.filter((e) => e.date === dStr);
          const dayKcal = dayItems.reduce((acc, curr) => acc + (curr.calories || 0), 0);
          const dateObj = new Date(dStr + 'T00:00:00');
          const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          return {
            date: dStr,
            label: dayLabel,
            kcal: dayKcal,
          };
        });

        if (isMounted) {
          setWeekData(weekStats);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Water tracking actions
  const handleWaterClick = (index) => {
    const today = new Date().toISOString().slice(0, 10);
    const newCount = index + 1 === waterGlasses ? index : index + 1;
    setWaterGlasses(newCount);
    localStorage.setItem(`okfit_water_${today}`, newCount);
    if (newCount === 8) {
      addToast('🎉 Daily hydration goal achieved (2,000 ml)!', 'success');
    }
  };

  const adjustWater = (delta) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = Math.min(8, Math.max(0, waterGlasses + delta));
    setWaterGlasses(updated);
    localStorage.setItem(`okfit_water_${today}`, updated);
    if (updated === 8) {
      addToast('🎉 Daily hydration goal achieved (2,000 ml)!', 'success');
    }
  };

  // Trend Chart Data
  const trendChartData = {
    labels: weekData.map((w) => w.label),
    datasets: [
      {
        type: 'bar',
        label: 'Calories Consumed',
        data: weekData.map((w) => w.kcal),
        backgroundColor: '#F5A524',
        borderRadius: 8,
        barThickness: 24,
      },
      {
        type: 'line',
        label: 'Daily Target',
        data: weekData.map(() => targets.kcal),
        borderColor: '#12806F',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#8B949E',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        titleColor: '#E6EDF3',
        bodyColor: '#F5A524',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
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
        suggestedMax: targets.kcal + 400,
      },
    },
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{user?.name || 'Athlete'}</span>
          </h1>
          <p className="page-subtitle">{formattedDate}</p>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="dashboard-quick-actions">
          <Link to="/scanner" className="btn btn-primary btn-sm">
            <span>📷</span> Scan Food
          </Link>
          <Link to="/log" className="btn btn-secondary btn-sm">
            <span>🍽️</span> Log Meal
          </Link>
          <Link to="/chat" className="btn btn-ghost btn-sm">
            <span>💬</span> AI Coach
          </Link>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="dashboard-grid">
        {/* Card 1: Calorie Ring */}
        <div className="glass-card metric-card">
          <div className="card-header-row">
            <h2 className="card-heading">Energy Intake</h2>
            <span className="card-tag">Today</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
              <Skeleton height="180px" width="180px" radius="50%" />
            </div>
          ) : (
            <CalorieRing
              eaten={todaySummary.calories}
              target={targets.kcal}
              size={185}
            />
          )}

          <div className="ring-sub-metrics">
            <div className="sub-metric">
              <span className="sub-metric-val">{Math.round(todaySummary.calories)}</span>
              <span className="sub-metric-lbl">Consumed</span>
            </div>
            <div className="sub-divider" />
            <div className="sub-metric">
              <span className="sub-metric-val" style={{ color: 'var(--primary)' }}>
                {targets.kcal}
              </span>
              <span className="sub-metric-lbl">Target</span>
            </div>
          </div>
        </div>

        {/* Card 2: Macros */}
        <div className="glass-card metric-card">
          <div className="card-header-row">
            <h2 className="card-heading">Macronutrients</h2>
            <span className="card-tag">
              {profile?.goal ? profile.goal.toUpperCase() : 'MAINTAIN'}
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '16px 0' }}>
              <Skeleton height="28px" />
              <Skeleton height="28px" />
              <Skeleton height="28px" />
            </div>
          ) : (
            <div className="macros-list">
              <MacroBar
                label="Protein"
                icon="🥩"
                value={todaySummary.protein}
                target={targets.p}
                unit="g"
                color="linear-gradient(90deg, #12806F, #2EA043)"
              />
              <MacroBar
                label="Carbohydrates"
                icon="🌾"
                value={todaySummary.carbs}
                target={targets.c}
                unit="g"
                color="linear-gradient(90deg, #F5A524, #FFB74D)"
              />
              <MacroBar
                label="Dietary Fats"
                icon="🥑"
                value={todaySummary.fat}
                target={targets.f}
                unit="g"
                color="linear-gradient(90deg, #388BFD, #79C0FF)"
              />
            </div>
          )}

          <div className="macro-legend-hint">
            Estimated using Mifflin-St Jeor metabolic model
          </div>
        </div>

        {/* Card 3: Water Tracker */}
        <div className="glass-card metric-card">
          <div className="card-header-row">
            <h2 className="card-heading">Hydration Tracker</h2>
            <span className="card-tag">{waterGlasses * 250} / 2,000 ml</span>
          </div>

          <div className="water-glasses-grid">
            {Array.from({ length: 8 }, (_, i) => {
              const filled = i < waterGlasses;
              return (
                <button
                  key={i}
                  type="button"
                  className={`water-glass-btn ${filled ? 'glass-filled' : ''}`}
                  onClick={() => handleWaterClick(i)}
                  title={`${(i + 1) * 250} ml`}
                  aria-label={`Water glass ${i + 1}`}
                >
                  <span className="glass-emoji">{filled ? '💧' : '🥛'}</span>
                </button>
              );
            })}
          </div>

          <div className="water-card-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => adjustWater(1)}
              disabled={waterGlasses >= 8}
            >
              + 1 Glass (250ml)
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => adjustWater(-1)}
              disabled={waterGlasses <= 0}
            >
              Undo
            </button>
          </div>
        </div>

        {/* Card 4: Meals Summary */}
        <div className="glass-card metric-card">
          <div className="card-header-row">
            <h2 className="card-heading">Today's Meals</h2>
            <Link to="/log" className="card-action-link">
              View Log →
            </Link>
          </div>

          <div className="meals-summary-list">
            {MEALS.map((mealName) => {
              const mealItems = todayEntries.filter((item) => item.meal === mealName);
              const mealCalories = mealItems.reduce(
                (sum, it) => sum + (it.calories || 0),
                0
              );

              return (
                <div key={mealName} className="meal-summary-row">
                  <div className="meal-summary-left">
                    <span className="meal-bullet" />
                    <div>
                      <span className="meal-row-name">{mealName}</span>
                      <span className="meal-row-items">
                        {mealItems.length} {mealItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                  <span className="meal-row-kcal">
                    {Math.round(mealCalories)} <small>kcal</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 5: 7-Day Trend Chart (Full Width) */}
        <div className="glass-card trend-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-heading">7-Day Calorie Trend</h2>
              <p className="card-subtitle-small">Daily consumption against target baseline</p>
            </div>
          </div>

          <div className="trend-chart-wrapper">
            {isLoading ? (
              <Skeleton height="100%" radius="12px" />
            ) : (
              <Chart type="bar" data={trendChartData} options={trendChartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
