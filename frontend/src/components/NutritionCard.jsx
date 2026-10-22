import React, { useState } from 'react';
import './NutritionCard.css';

const NutritionCard = ({ food, onAddToLog, showAddButton = true }) => {
  const [selectedMeal, setSelectedMeal] = useState('Lunch');
  const [isAdding, setIsAdding] = useState(false);

  if (!food) return null;

  const confidence = food.confidence ?? 85;
  const confidenceColor =
    confidence >= 70
      ? 'var(--success)'
      : confidence >= 40
      ? 'var(--warning)'
      : 'var(--error)';

  const handleAdd = async () => {
    if (!onAddToLog) return;
    setIsAdding(true);
    try {
      await onAddToLog({
        ...food,
        meal: selectedMeal,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="nutrition-card">
      <div className="nutrition-card-header">
        <div>
          <h3 className="nutrition-food-name">{food.name || food.foodName}</h3>
          {food.servingSize && (
            <span className="nutrition-serving-size">Serving: {food.servingSize}</span>
          )}
        </div>

        {typeof food.confidence === 'number' && (
          <div
            className="confidence-badge"
            style={{
              borderColor: confidenceColor,
              color: confidenceColor,
              backgroundColor: `${confidenceColor}1A`,
            }}
          >
            <span className="confidence-dot" style={{ backgroundColor: confidenceColor }} />
            {confidence}% Match
          </div>
        )}
      </div>

      <div className="nutrition-grid">
        <div className="nutrient-pill highlight">
          <span className="nutrient-label">Calories</span>
          <span className="nutrient-value">{Math.round(food.calories || food.kcal || 0)} <small>kcal</small></span>
        </div>
        <div className="nutrient-pill">
          <span className="nutrient-label">Protein</span>
          <span className="nutrient-value">{food.protein || food.p || 0}g</span>
        </div>
        <div className="nutrient-pill">
          <span className="nutrient-label">Carbs</span>
          <span className="nutrient-value">{food.carbs || food.c || 0}g</span>
        </div>
        <div className="nutrient-pill">
          <span className="nutrient-label">Fat</span>
          <span className="nutrient-value">{food.fat || food.f || 0}g</span>
        </div>
        {food.fiber !== undefined && (
          <div className="nutrient-pill">
            <span className="nutrient-label">Fiber</span>
            <span className="nutrient-value">{food.fiber}g</span>
          </div>
        )}
        {food.sugar !== undefined && (
          <div className="nutrient-pill">
            <span className="nutrient-label">Sugar</span>
            <span className="nutrient-value">{food.sugar}g</span>
          </div>
        )}
      </div>

      {showAddButton && (
        <div className="nutrition-card-actions">
          <select
            className="meal-select"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
            aria-label="Select meal category"
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : '+ Add to Food Log'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionCard;
