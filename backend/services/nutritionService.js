const { BUILT_IN_FOODS } = require('../config/constants');

/**
 * Searches the built-in nutrition database for matching food items
 * @param {string} foodName - Name or label of the food item to find
 * @returns {Object} Nutritional breakdown (calories, protein, carbs, fat, fiber, sugar, servingSize)
 */
const lookupNutrition = (foodName) => {
  if (!foodName || typeof foodName !== 'string') {
    return {
      calories: 100,
      protein: 2,
      carbs: 15,
      fat: 2,
      fiber: 1,
      sugar: 2,
      servingSize: '1 serving (100 g)'
    };
  }

  const query = foodName.toLowerCase().trim();

  // 1. Try exact match on name
  let match = BUILT_IN_FOODS.find((food) => food.name.toLowerCase() === query);

  // 2. Try match on base food name before parentheses e.g. "Apple" from "Apple (1 medium)"
  if (!match) {
    match = BUILT_IN_FOODS.find((food) => {
      const baseName = food.name.split('(')[0].toLowerCase().trim();
      return baseName === query;
    });
  }

  // 3. Try checking if query is contained in food name or vice versa
  if (!match) {
    match = BUILT_IN_FOODS.find((food) => {
      const lower = food.name.toLowerCase();
      // Special aliases
      if (query.includes('egg') && lower.includes('egg')) return true;
      if (query.includes('rice') && lower.includes('rice')) return true;
      if ((query.includes('roti') || query.includes('chapati')) && lower.includes('roti')) return true;
      if (query.includes('dal') && lower.includes('dal')) return true;
      if (query.includes('chicken') && lower.includes('chicken')) return true;
      if (query.includes('yogurt') && lower.includes('yogurt')) return true;
      if (query.includes('milk') && lower.includes('milk')) return true;
      if (query.includes('bread') && lower.includes('bread')) return true;
      if (query.includes('salmon') || query.includes('fish') && lower.includes('salmon')) return true;
      if (query.includes('chickpea') && lower.includes('chickpeas')) return true;
      if (query.includes('sweet potato') && lower.includes('sweet potato')) return true;
      if (query.includes('broccoli') && lower.includes('broccoli')) return true;
      if (query.includes('banana') && lower.includes('banana')) return true;
      if (query.includes('apple') && lower.includes('apple')) return true;
      if (query.includes('orange') && lower.includes('orange')) return true;

      return lower.includes(query) || query.includes(lower);
    });
  }

  if (match) {
    return {
      calories: match.calories,
      protein: match.protein,
      carbs: match.carbs,
      fat: match.fat,
      fiber: match.fiber || 0,
      sugar: match.sugar || 0,
      servingSize: match.servingSize || '1 serving'
    };
  }

  // Default fallback values if unrecognized
  return {
    calories: 120,
    protein: 4,
    carbs: 18,
    fat: 3,
    fiber: 1.5,
    sugar: 2,
    servingSize: '1 serving (100 g)'
  };
};

/**
 * Formats raw ML predictions into enriched structured nutrition items
 * @param {Object|Array} scanResult - Output from ML model
 * @returns {Array} Array of foods with confidence and enriched nutritional data
 */
const formatNutritionResponse = (scanResult) => {
  let rawItems = [];

  if (Array.isArray(scanResult)) {
    rawItems = scanResult;
  } else if (scanResult && Array.isArray(scanResult.foods)) {
    rawItems = scanResult.foods;
  } else if (scanResult && Array.isArray(scanResult.predictions)) {
    rawItems = scanResult.predictions;
  } else if (scanResult && typeof scanResult === 'object') {
    // Single prediction object
    if (scanResult.name || scanResult.label || scanResult.food) {
      rawItems = [scanResult];
    }
  }

  // Format and enrich each detected food item
  const formattedFoods = rawItems.map((item) => {
    const rawName = item.name || item.label || item.food || 'Unidentified Food';
    const confidence = typeof item.confidence === 'number' ? item.confidence : 0.85;

    // Use ML provided nutrition if available, otherwise look up in database
    const nutrition = item.nutrition
      ? {
          calories: item.nutrition.calories || 0,
          protein: item.nutrition.protein || 0,
          carbs: item.nutrition.carbs || 0,
          fat: item.nutrition.fat || 0,
          fiber: item.nutrition.fiber || 0,
          sugar: item.nutrition.sugar || 0,
          servingSize: item.nutrition.servingSize || '1 serving'
        }
      : lookupNutrition(rawName);

    return {
      name: rawName,
      confidence: parseFloat(confidence.toFixed(4)),
      nutrition
    };
  });

  return formattedFoods;
};

module.exports = {
  lookupNutrition,
  formatNutritionResponse
};
