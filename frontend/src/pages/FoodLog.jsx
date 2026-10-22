import React, { useState, useEffect, useMemo } from 'react';
import foodLogService from '../services/foodLogService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './FoodLog.css';

const FOODS = [
  { name: 'Egg, boiled (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'White rice, cooked (1 cup)', calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'Roti / chapati (1)', calories: 104, protein: 3, carbs: 18, fat: 2.5 },
  { name: 'Dal, cooked (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 0.8 },
  { name: 'Paneer (100 g)', calories: 265, protein: 18, carbs: 1.2, fat: 20 },
  { name: 'Chicken breast, cooked (100 g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Oats, dry (40 g)', calories: 150, protein: 5, carbs: 27, fat: 2.5 },
  { name: 'Whole milk (1 cup)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'Greek yogurt (170 g)', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
  { name: 'Peanut butter (1 tbsp)', calories: 95, protein: 4, carbs: 3, fat: 8 },
  { name: 'Almonds (28 g)', calories: 165, protein: 6, carbs: 6, fat: 14 },
  { name: 'Whole wheat bread (1 slice)', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: 'Salmon, cooked (100 g)', calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: 'Chickpeas, cooked (1 cup)', calories: 270, protein: 15, carbs: 45, fat: 4 },
  { name: 'Idli (2)', calories: 130, protein: 4, carbs: 26, fat: 0.4 },
  { name: 'Dosa, plain (1)', calories: 170, protein: 4, carbs: 29, fat: 4 },
  { name: 'Whey protein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: 'Olive oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { name: 'Sweet potato (1 medium)', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { name: 'Orange (1 medium)', calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { name: 'Cottage cheese (100 g)', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
];

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Form state
  const [meal, setMeal] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [servings, setServings] = useState('1');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  // Matched built-in food
  const matchedFood = useMemo(() => {
    return FOODS.find((f) => f.name.toLowerCase() === foodName.trim().toLowerCase());
  }, [foodName]);

  const isCustom = !matchedFood && foodName.trim().length > 0;

  // Load entries for selected date
  const loadEntries = async (date) => {
    setIsLoading(true);
    try {
      const data = await foodLogService.getDailySummary(date);
      setEntries(data.entries || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch food log entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries(selectedDate);
  }, [selectedDate]);

  // Date controls
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Form submit
  const handleAddFood = async (e) => {
    e.preventDefault();
    setFormError('');

    const name = foodName.trim();
    const qty = parseFloat(servings);

    if (!name) {
      setFormError('Please enter or select a food item.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setFormError('Please enter a valid serving quantity greater than 0.');
      return;
    }

    let itemKcal = 0;
    let itemP = 0;
    let itemC = 0;
    let itemF = 0;

    if (matchedFood) {
      itemKcal = matchedFood.calories * qty;
      itemP = matchedFood.protein * qty;
      itemC = matchedFood.carbs * qty;
      itemF = matchedFood.fat * qty;
    } else {
      const rawKcal = parseFloat(customCalories);
      if (isNaN(rawKcal) || rawKcal < 0) {
        setFormError('This custom food needs estimated calories per serving.');
        return;
      }
      itemKcal = rawKcal * qty;
      itemP = (parseFloat(customProtein) || 0) * qty;
      itemC = (parseFloat(customCarbs) || 0) * qty;
      itemF = (parseFloat(customFat) || 0) * qty;
    }

    setIsSubmitting(true);
    try {
      const result = await foodLogService.addEntry({
        date: selectedDate,
        meal,
        name,
        quantity: qty,
        calories: itemKcal,
        protein: itemP,
        carbs: itemC,
        fat: itemF,
      });

      if (result?.entry) {
        setEntries((prev) => [...prev, result.entry]);
      } else {
        await loadEntries(selectedDate);
      }

      addToast(`Logged ${qty}x ${name} to ${meal}`, 'success');
      setFoodName('');
      setServings('1');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
    } catch (err) {
      console.error(err);
      addToast('Failed to log food entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete entry
  const handleDelete = async (id, name) => {
    try {
      await foodLogService.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      addToast(`Deleted ${name}`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete item', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await foodLogService.getEntries();
      const allEntries = res.entries || [];

      if (allEntries.length === 0) {
        addToast('No entries available to export', 'warning');
        return;
      }

      const rows = [
        ['Date', 'Meal', 'Food', 'Servings', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
      ];

      allEntries.forEach((item) => {
        rows.push([
          item.date,
          item.meal,
          `"${(item.name || '').replace(/"/g, '""')}"`,
          item.quantity || 1,
          Math.round(item.calories || 0),
          Math.round((item.protein || 0) * 10) / 10,
          Math.round((item.carbs || 0) * 10) / 10,
          Math.round((item.fat || 0) * 10) / 10,
        ]);
      });

      const csvContent = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `okfit-nutrition-log-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('CSV export downloaded!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Export failed', 'error');
    }
  };

  // Summary computations
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  // Filtered entries by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) => e.name.toLowerCase().includes(q) || e.meal.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  return (
    <div className="food-log-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Food Log</h1>
          <p className="page-subtitle">Track every meal with precision macros and search</p>
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="date-nav-card glass-card">
        <button type="button" className="btn btn-ghost btn-sm" onClick={handlePrevDay}>
          ◀ Prev Day
        </button>

        <div className="date-picker-wrap">
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate === new Date().toISOString().slice(0, 10) && (
            <span className="today-pill">Today</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleToday}>
            Today
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleNextDay}>
            Next Day ▶
          </button>
        </div>
      </div>

      {/* Daily Macro Totals Ribbon */}
      <div className="totals-ribbon glass-card">
        <div className="ribbon-item">
          <span className="ribbon-label">Total Calories</span>
          <span className="ribbon-val" style={{ color: 'var(--primary)' }}>
            {Math.round(totals.calories)} <small>kcal</small>
          </span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-item">
          <span className="ribbon-label">Total Protein</span>
          <span className="ribbon-val" style={{ color: 'var(--secondary)' }}>
            {Math.round(totals.protein)} <small>g</small>
          </span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-item">
          <span className="ribbon-label">Total Carbs</span>
          <span className="ribbon-val">
            {Math.round(totals.carbs)} <small>g</small>
          </span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-item">
          <span className="ribbon-label">Total Fat</span>
          <span className="ribbon-val">
            {Math.round(totals.fat)} <small>g</small>
          </span>
        </div>
      </div>

      {/* Main Grid: Add Food Form + Today's Entries */}
      <div className="food-log-grid">
        {/* ADD FOOD FORM */}
        <div className="glass-card log-form-card">
          <h2 className="log-card-title">Add Food Entry</h2>
          <p className="log-card-sub">Choose from 24 built-in items or enter custom values</p>

          {formError && <div className="form-alert-error">{formError}</div>}

          <form onSubmit={handleAddFood}>
            <div className="form-group">
              <label className="form-label" htmlFor="meal-select">
                Meal Category
              </label>
              <select
                id="meal-select"
                className="form-select"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="food-input">
                Food Name (with autocomplete)
              </label>
              <input
                id="food-input"
                list="builtin-foods"
                className="form-input"
                placeholder="Search e.g. Oatmeal, Chicken breast..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                maxLength={70}
                required
              />
              <datalist id="builtin-foods">
                {FOODS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.calories} kcal (P:{f.protein}g C:{f.carbs}g F:{f.fat}g)
                  </option>
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="servings-input">
                Servings
              </label>
              <input
                id="servings-input"
                type="number"
                step="0.25"
                min="0.25"
                max="20"
                className="form-input"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                required
              />
            </div>

            {/* Custom Macro Fields shown when food is custom */}
            {isCustom && (
              <div className="custom-fields-box">
                <span className="custom-badge">Custom Food Detected</span>
                <p className="custom-desc">
                  This item is not in our quick database. Enter its per-serving values:
                </p>

                <div className="custom-inputs-grid">
                  <div>
                    <label className="form-label">Calories (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      max="4000"
                      className="form-input"
                      placeholder="e.g. 250"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      required={isCustom}
                    />
                  </div>
                  <div>
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      className="form-input"
                      placeholder="e.g. 20"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      className="form-input"
                      placeholder="e.g. 30"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      className="form-input"
                      placeholder="e.g. 8"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '14px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : '+ Add to Food Log'}
            </button>
          </form>
        </div>

        {/* LOGGED ENTRIES LIST */}
        <div className="glass-card log-entries-card">
          <div className="entries-header-row">
            <h2 className="log-card-title">Logged Foods</h2>
            <div className="search-box">
              <input
                type="text"
                className="form-input search-input"
                placeholder="Filter entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height="60px" />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No foods logged for this date"
              description="Add your breakfast, lunch, dinner, or snacks above to start counting your daily macros."
            />
          ) : (
            <div className="entries-list">
              {MEALS.map((mealGroup) => {
                const groupItems = filteredEntries.filter((item) => item.meal === mealGroup);
                if (groupItems.length === 0) return null;

                const groupCalories = groupItems.reduce(
                  (sum, it) => sum + (it.calories || 0),
                  0
                );

                return (
                  <div key={mealGroup} className="meal-group-block">
                    <div className="meal-group-header">
                      <span className="meal-group-title">{mealGroup}</span>
                      <span className="meal-group-cals">
                        {Math.round(groupCalories)} kcal
                      </span>
                    </div>

                    <div className="group-items-stack">
                      {groupItems.map((entry) => (
                        <div key={entry.id} className="entry-row">
                          <div className="entry-left">
                            <span className="entry-title">
                              {entry.name}{' '}
                              <span className="entry-qty">×{entry.quantity}</span>
                            </span>
                            <span className="entry-sub">
                              {Math.round(entry.calories)} kcal · P: {Math.round(entry.protein)}g · C: {Math.round(entry.carbs)}g · F: {Math.round(entry.fat)}g
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn-delete-entry"
                            onClick={() => handleDelete(entry.id, entry.name)}
                            title={`Remove ${entry.name}`}
                            aria-label={`Remove ${entry.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodLog;
