import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/LoadingSpinner';
import './Profile.css';

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary (desk job, little to no exercise)' },
  { value: 1.375, label: 'Lightly Active (light exercise 1–3 days/week)' },
  { value: 1.55, label: 'Moderately Active (moderate training 3–5 days/week)' },
  { value: 1.725, label: 'Very Active (hard training 6–7 days/week)' },
];

const GOALS = [
  { value: 'loss', label: 'Weight Loss (-500 kcal deficit)' },
  { value: 'maintain', label: 'Maintain Weight (equilibrium balance)' },
  { value: 'gain', label: 'Muscle Gain (+300 kcal surplus)' },
];

const Profile = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(1.375);
  const [goal, setGoal] = useState('maintain');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getProfile();
      if (res?.profile) {
        const p = res.profile;
        setAge(p.age || 26);
        setGender(p.gender || 'male');
        setHeight(p.height || 175);
        setWeight(p.weight || 72);
        setActivity(p.activity || 1.375);
        setGoal(p.goal || 'maintain');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Targets calculation using Mifflin-St Jeor
  const calculateTargets = () => {
    const a = parseFloat(age) || 26;
    const h = parseFloat(height) || 175;
    const w = parseFloat(weight) || 72;
    const act = parseFloat(activity) || 1.375;

    const bmi = w / ((h / 100) ** 2);
    const bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : gender === 'female' ? -161 : -78);
    const tdee = bmr * act;
    const kcal = Math.max(1200, Math.round(tdee + (goal === 'loss' ? -500 : goal === 'gain' ? 300 : 0)));
    const p = Math.round(w * (goal === 'maintain' ? 1.6 : 2));
    const f = Math.round((kcal * 0.25) / 9);
    const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));

    return {
      bmi,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      kcal,
      p,
      c,
      f,
    };
  };

  const targets = calculateTargets();

  const getBmiLabel = (b) => {
    if (b < 18.5) return 'Underweight';
    if (b < 25) return 'Healthy range';
    if (b < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (!parsedAge || parsedAge < 14 || parsedAge > 100) {
      setFormError('Please enter a valid age between 14 and 100.');
      return;
    }
    if (!parsedHeight || parsedHeight < 100 || parsedHeight > 250) {
      setFormError('Please enter a valid height between 100 cm and 250 cm.');
      return;
    }
    if (!parsedWeight || parsedWeight < 30 || parsedWeight > 300) {
      setFormError('Please enter a valid weight between 30 kg and 300 kg.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile({
        age: parsedAge,
        gender,
        height: parsedHeight,
        weight: parsedWeight,
        activity: parseFloat(activity),
        goal,
      });

      addToast('Profile and nutritional targets updated!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Profile</h1>
          <p className="page-subtitle">Configure your physical metrics and calorie equation</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* PROFILE SETTINGS FORM */}
        <div className="glass-card profile-form-card">
          <div className="user-hero-header">
            <div className="user-hero-avatar">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="user-hero-name">{user?.name || 'Athlete'}</h2>
              <span className="user-hero-email">{user?.email}</span>
            </div>
          </div>

          {formError && <div className="profile-error-alert">{formError}</div>}

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label" htmlFor="age-input">
                    Age (years)
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    min="14"
                    max="100"
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gender-select">
                    Biological Gender
                  </label>
                  <select
                    id="gender-select"
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Neutral</option>
                  </select>
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label" htmlFor="height-input">
                    Height (cm)
                  </label>
                  <input
                    id="height-input"
                    type="number"
                    min="100"
                    max="250"
                    className="form-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="weight-input">
                    Weight (kg)
                  </label>
                  <input
                    id="weight-input"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    className="form-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-select">
                  Daily Activity Level
                </label>
                <select
                  id="activity-select"
                  className="form-select"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  {ACTIVITY_LEVELS.map((act) => (
                    <option key={act.value} value={act.value}>
                      {act.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="goal-select">
                  Nutrition & Body Composition Goal
                </label>
                <select
                  id="goal-select"
                  className="form-select"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
                disabled={isSaving}
              >
                {isSaving ? 'Calculating & Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* Account Controls */}
          <div className="profile-account-controls">
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Preferences & Security</h4>
            <div className="controls-button-group">
              <button type="button" className="btn btn-ghost btn-sm" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* YOUR NUMBERS CARD */}
        <div className="glass-card targets-card">
          <h2 className="progress-card-title">Your Metabolic Numbers</h2>
          <p className="progress-card-sub">
            Calculated in real-time according to the Mifflin-St Jeor equation
          </p>

          <div className="numbers-stats-grid">
            <div className="metric-pill-box">
              <span className="metric-pill-lbl">Body Mass Index</span>
              <span className="metric-pill-val">{targets.bmi.toFixed(1)}</span>
              <span className="metric-pill-tag">{getBmiLabel(targets.bmi)}</span>
            </div>

            <div className="metric-pill-box">
              <span className="metric-pill-lbl">Basal Metabolic Rate</span>
              <span className="metric-pill-val">{targets.bmr}</span>
              <span className="metric-pill-tag">BMR kcal/day</span>
            </div>

            <div className="metric-pill-box">
              <span className="metric-pill-lbl">Maintenance TDEE</span>
              <span className="metric-pill-val">{targets.tdee}</span>
              <span className="metric-pill-tag">Expenditure kcal</span>
            </div>

            <div className="metric-pill-box highlight-box">
              <span className="metric-pill-lbl">Target Calorie Intake</span>
              <span className="metric-pill-val" style={{ color: 'var(--primary)' }}>
                {targets.kcal}
              </span>
              <span className="metric-pill-tag" style={{ color: 'var(--primary)' }}>
                Daily kcal Budget
              </span>
            </div>
          </div>

          {/* Recommended Macros Breakdown */}
          <div className="macro-breakdown-box">
            <h3 className="macro-box-title">Target Daily Macronutrients</h3>
            <div className="macro-targets-row">
              <div className="macro-target-item">
                <span className="macro-type">Protein</span>
                <span className="macro-amount">{targets.p}g</span>
                <span className="macro-cal-share">~{targets.p * 4} kcal</span>
              </div>
              <div className="macro-target-item">
                <span className="macro-type">Carbs</span>
                <span className="macro-amount">{targets.c}g</span>
                <span className="macro-cal-share">~{targets.c * 4} kcal</span>
              </div>
              <div className="macro-target-item">
                <span className="macro-type">Dietary Fat</span>
                <span className="macro-amount">{targets.f}g</span>
                <span className="macro-cal-share">~{targets.f * 9} kcal</span>
              </div>
            </div>
          </div>

          <div className="mifflin-disclaimer">
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>ℹ️</span>
            <p>
              <strong>Mifflin-St Jeor Disclaimer:</strong> Calorie and macronutrient estimates
              are derived using standard clinical formulas and simple deficit/surplus
              adjustments (-500 kcal for fat loss, +300 kcal for hypertrophy). They represent
              a starting point and should not replace clinical medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
