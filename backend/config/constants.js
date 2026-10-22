'use strict';

// Authentication and Upload constants
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Standard meals
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Activity multipliers
const ACTIVITY_LEVELS = {
  1.2: 'Sedentary (little or no exercise)',
  1.375: 'Light (light exercise 1-3 days/week)',
  1.55: 'Moderate (moderate exercise 3-5 days/week)',
  1.725: 'Very active (hard exercise 6-7 days/week)'
};

// Goals definition
const GOALS = {
  loss: 'Weight loss',
  gain: 'Muscle gain',
  maintain: 'Maintain weight'
};

// 24 Built-in foods with calibrated nutritional values per serving
const BUILT_IN_FOODS = [
  {
    name: 'Egg, boiled (1 large)',
    calories: 78,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    fiber: 0,
    sugar: 0.6,
    servingSize: '1 large (50 g)'
  },
  {
    name: 'Banana (1 medium)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14.4,
    servingSize: '1 medium (118 g)'
  },
  {
    name: 'Apple (1 medium)',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4,
    sugar: 19,
    servingSize: '1 medium (182 g)'
  },
  {
    name: 'White rice, cooked (1 cup)',
    calories: 205,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    sugar: 0.1,
    servingSize: '1 cup (158 g)'
  },
  {
    name: 'Roti / chapati (1)',
    calories: 104,
    protein: 3,
    carbs: 18,
    fat: 2.5,
    fiber: 2.5,
    sugar: 0.5,
    servingSize: '1 piece (40 g)'
  },
  {
    name: 'Dal, cooked (1 cup)',
    calories: 230,
    protein: 18,
    carbs: 40,
    fat: 0.8,
    fiber: 16,
    sugar: 3.5,
    servingSize: '1 cup (198 g)'
  },
  {
    name: 'Paneer (100 g)',
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    fiber: 0,
    sugar: 1.2,
    servingSize: '100 g'
  },
  {
    name: 'Chicken breast, cooked (100 g)',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    servingSize: '100 g'
  },
  {
    name: 'Oats, dry (40 g)',
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 2.5,
    fiber: 4,
    sugar: 1,
    servingSize: '40 g'
  },
  {
    name: 'Whole milk (1 cup)',
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    fiber: 0,
    sugar: 12,
    servingSize: '1 cup (244 g)'
  },
  {
    name: 'Greek yogurt (170 g)',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    fiber: 0,
    sugar: 6,
    servingSize: '170 g'
  },
  {
    name: 'Peanut butter (1 tbsp)',
    calories: 95,
    protein: 4,
    carbs: 3,
    fat: 8,
    fiber: 1,
    sugar: 1.5,
    servingSize: '1 tbsp (16 g)'
  },
  {
    name: 'Almonds (28 g)',
    calories: 165,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    sugar: 1.2,
    servingSize: '28 g'
  },
  {
    name: 'Whole wheat bread (1 slice)',
    calories: 80,
    protein: 4,
    carbs: 14,
    fat: 1,
    fiber: 2,
    sugar: 1.5,
    servingSize: '1 slice (32 g)'
  },
  {
    name: 'Salmon, cooked (100 g)',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    servingSize: '100 g'
  },
  {
    name: 'Chickpeas, cooked (1 cup)',
    calories: 270,
    protein: 15,
    carbs: 45,
    fat: 4,
    fiber: 12.5,
    sugar: 8,
    servingSize: '1 cup (164 g)'
  },
  {
    name: 'Idli (2)',
    calories: 130,
    protein: 4,
    carbs: 26,
    fat: 0.4,
    fiber: 1.5,
    sugar: 0.2,
    servingSize: '2 pieces (100 g)'
  },
  {
    name: 'Dosa, plain (1)',
    calories: 170,
    protein: 4,
    carbs: 29,
    fat: 4,
    fiber: 1.8,
    sugar: 0.4,
    servingSize: '1 piece (100 g)'
  },
  {
    name: 'Whey protein (1 scoop)',
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    fiber: 1,
    sugar: 1.5,
    servingSize: '1 scoop (30 g)'
  },
  {
    name: 'Olive oil (1 tbsp)',
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    fiber: 0,
    sugar: 0,
    servingSize: '1 tbsp (14 g)'
  },
  {
    name: 'Broccoli (1 cup)',
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    fiber: 5.1,
    sugar: 2.2,
    servingSize: '1 cup (91 g)'
  },
  {
    name: 'Sweet potato (1 medium)',
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0.1,
    fiber: 3.9,
    sugar: 5.4,
    servingSize: '1 medium (114 g)'
  },
  {
    name: 'Orange (1 medium)',
    calories: 62,
    protein: 1.2,
    carbs: 15,
    fat: 0.2,
    fiber: 3.1,
    sugar: 12.2,
    servingSize: '1 medium (131 g)'
  },
  {
    name: 'Cottage cheese (100 g)',
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0,
    sugar: 3.4,
    servingSize: '100 g'
  }
];

/**
 * Calculates Mifflin-St Jeor TDEE & macro targets based on profile
 * @param {Object} profile - User profile { age, gender, height, weight, activity, goal }
 */
const calculateNutritionTargets = (profile) => {
  if (!profile || !profile.weight || !profile.height || !profile.age) {
    return null;
  }

  const { weight, height, age, gender = 'male', activity = 1.375, goal = 'maintain' } = profile;
  const heightInMeters = height / 100;
  const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(1);

  // Mifflin-St Jeor equation for BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average between male and female
  }

  const tdee = Math.round(bmr * activity);

  // Calorie adjustments based on goal
  let kcalAdjustment = 0;
  if (goal === 'loss') kcalAdjustment = -500;
  else if (goal === 'gain') kcalAdjustment = 300;

  const targetKcal = Math.max(1200, Math.round(tdee + kcalAdjustment));

  // Protein calculation
  const proteinMultiplier = goal === 'maintain' ? 1.6 : 2.0;
  const protein = Math.round(weight * proteinMultiplier);

  // Fat calculation (approx 25% of calories, 9 kcal/g)
  const fat = Math.round((targetKcal * 0.25) / 9);

  // Remaining calories to carbs (4 kcal/g)
  const carbs = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));

  return {
    bmi,
    bmr: Math.round(bmr),
    tdee,
    calories: targetKcal,
    protein,
    carbs,
    fat
  };
};

module.exports = {
  JWT_EXPIRE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  MEALS,
  ACTIVITY_LEVELS,
  GOALS,
  BUILT_IN_FOODS,
  calculateNutritionTargets
};
