import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import scanService from '../services/scanService';
import foodLogService from '../services/foodLogService';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/LoadingSpinner';
import './ScanHistory.css';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const { addToast } = useToast();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await scanService.getHistory();
      setScans(data.scans || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load scan history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await scanService.deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
      addToast('Scan record deleted', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete scan', 'error');
    }
  };

  const handleQuickAdd = async (food, e) => {
    e.stopPropagation();
    try {
      await foodLogService.addEntry({
        name: food.name,
        meal: 'Lunch',
        quantity: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      });
      addToast(`Added ${food.name} to Food Log!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not add to log', 'error');
    }
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="page-subtitle">Your past AI food analysis sessions and logs</p>
        </div>
        <Link to="/scanner" className="btn btn-primary btn-sm">
          📷 New Scan
        </Link>
      </div>

      {isLoading ? (
        <div className="history-grid">
          <Skeleton height="260px" radius="16px" />
          <Skeleton height="260px" radius="16px" />
          <Skeleton height="260px" radius="16px" />
        </div>
      ) : scans.length === 0 ? (
        <EmptyState
          icon="📷"
          title="No food scans recorded yet"
          description="Use our AI scanner to photograph your meals, recognize food items, and track macros automatically."
          actionText="Start Your First Scan"
          actionLink="/scanner"
        />
      ) : (
        <div className="history-grid">
          {scans.map((scan) => {
            const isExpanded = expandedId === scan.id;
            const primaryFood = scan.foods?.[0] || {
              name: 'Detected Meal',
              calories: scan.summary?.totalCalories || 0,
            };
            const totalCalories =
              scan.summary?.totalCalories ||
              scan.foods?.reduce((sum, f) => sum + (f.calories || 0), 0) ||
              primaryFood.calories;
            const confidence = scan.confidence || primaryFood.confidence || 90;
            const formattedDate = new Date(scan.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={scan.id}
                className={`history-card glass-card ${isExpanded ? 'history-card-expanded' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : scan.id)}
              >
                {/* Thumbnail & Confidence Header */}
                <div className="history-card-media">
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt={primaryFood.name} className="history-img" />
                  ) : (
                    <div className="history-img-placeholder">🍲</div>
                  )}

                  <div className="history-badge-overlay">
                    <span className="confidence-pill">{confidence}% Match</span>
                  </div>

                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={(e) => handleDelete(scan.id, e)}
                    title="Delete Scan"
                    aria-label="Delete Scan"
                  >
                    ✕
                  </button>
                </div>

                {/* Card Main Info */}
                <div className="history-card-body">
                  <div className="history-main-info">
                    <h3 className="history-food-title">
                      {primaryFood.name}
                      {scan.foods?.length > 1 && (
                        <span className="history-more-count"> +{scan.foods.length - 1} more</span>
                      )}
                    </h3>
                    <span className="history-date">{formattedDate}</span>
                  </div>

                  <div className="history-stats-row">
                    <div className="history-stat">
                      <span className="stat-val">{Math.round(totalCalories)}</span>
                      <span className="stat-lbl">Calories</span>
                    </div>
                    {scan.summary && (
                      <>
                        <div className="history-stat">
                          <span className="stat-val">{scan.summary.totalProtein}g</span>
                          <span className="stat-lbl">Protein</span>
                        </div>
                        <div className="history-stat">
                          <span className="stat-val">{scan.summary.totalCarbs}g</span>
                          <span className="stat-lbl">Carbs</span>
                        </div>
                        <div className="history-stat">
                          <span className="stat-val">{scan.summary.totalFat}g</span>
                          <span className="stat-lbl">Fat</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Expandable detailed items list */}
                  {isExpanded && (
                    <div className="history-expanded-section">
                      <h4 className="expanded-heading">Detected Food Breakdown</h4>
                      <div className="expanded-foods-list">
                        {scan.foods?.map((f, i) => (
                          <div key={i} className="expanded-food-item">
                            <div>
                              <strong>{f.name}</strong>
                              <span className="expanded-sub">
                                {f.calories} kcal · P: {f.protein}g · C: {f.carbs}g · F: {f.fat}g
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => handleQuickAdd(f, e)}
                            >
                              + Log
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="history-expand-hint">
                    {isExpanded ? 'Click to collapse ▲' : 'Click to view breakdown ▼'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
