const FoodLog = require('../models/FoodLog');
const Scan = require('../models/Scan');
const User = require('../models/User');
const { MEALS, calculateNutritionTargets } = require('../config/constants');

/**
 * @desc    Add a new food log entry
 * @route   POST /api/foodlog
 * @access  Private
 */
const addEntry = async (req, res, next) => {
  try {
    const { date, meal, food, servings = 1, source = 'manual', scanId } = req.body;

    const entry = await FoodLog.create({
      userId: req.user.id,
      date,
      meal,
      food: {
        name: food.name,
        calories: Number(food.calories),
        protein: Number(food.protein || 0),
        carbs: Number(food.carbs || 0),
        fat: Number(food.fat || 0)
      },
      servings: Number(servings) || 1,
      source: source === 'scan' ? 'scan' : 'manual'
    });

    // If logged from a scan, mark scan as savedToLog
    if (scanId) {
      await Scan.findOneAndUpdate(
        { _id: scanId, userId: req.user.id },
        { savedToLog: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Food entry logged successfully',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get food log entries (optional date or date range filter)
 * @route   GET /api/foodlog
 * @access  Private
 */
const getEntries = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    if (date) {
      query.date = date;
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const entries = await FoodLog.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a food log entry
 * @route   DELETE /api/foodlog/:id
 * @access  Private
 */
const deleteEntry = async (req, res, next) => {
  try {
    const entry = await FoodLog.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Food log entry not found with id of ${req.params.id}`
      });
    }

    // Ensure entry belongs to authenticated user
    if (entry.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this food entry'
      });
    }

    await entry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food log entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily nutrition summary and target comparisons for a given date
 * @route   GET /api/foodlog/summary/:date
 * @access  Private
 */
const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Expected YYYY-MM-DD'
      });
    }

    // Fetch entries for this day
    const entries = await FoodLog.find({
      userId: req.user.id,
      date
    }).sort({ createdAt: 1 });

    // Aggregate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      itemCount: entries.length
    };

    // Group meals
    const meals = {
      Breakfast: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
      Lunch: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
      Dinner: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
      Snack: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 }
    };

    entries.forEach((item) => {
      const multiplier = item.servings || 1;
      const kcal = Math.round((item.food.calories || 0) * multiplier);
      const prot = Math.round((item.food.protein || 0) * multiplier * 10) / 10;
      const carb = Math.round((item.food.carbs || 0) * multiplier * 10) / 10;
      const fat = Math.round((item.food.fat || 0) * multiplier * 10) / 10;

      totals.calories += kcal;
      totals.protein += prot;
      totals.carbs += carb;
      totals.fat += fat;

      const mealCategory = meals[item.meal] ? item.meal : 'Snack';
      meals[mealCategory].items.push(item);
      meals[mealCategory].calories += kcal;
      meals[mealCategory].protein = +(meals[mealCategory].protein + prot).toFixed(1);
      meals[mealCategory].carbs = +(meals[mealCategory].carbs + carb).toFixed(1);
      meals[mealCategory].fat = +(meals[mealCategory].fat + fat).toFixed(1);
    });

    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein);
    totals.carbs = Math.round(totals.carbs);
    totals.fat = Math.round(totals.fat);

    // Get user targets based on profile
    const user = await User.findById(req.user.id);
    const targets = user ? calculateNutritionTargets(user.profile) : null;

    let targetComparison = null;
    if (targets) {
      targetComparison = {
        caloriesRemaining: targets.calories - totals.calories,
        caloriesOver: Math.max(0, totals.calories - targets.calories),
        proteinRemaining: Math.max(0, targets.protein - totals.protein),
        carbsRemaining: Math.max(0, targets.carbs - totals.carbs),
        fatRemaining: Math.max(0, targets.fat - totals.fat),
        targetKcal: targets.calories,
        targetProtein: targets.protein,
        targetCarbs: targets.carbs,
        targetFat: targets.fat
      };
    }

    res.status(200).json({
      success: true,
      data: {
        date,
        totals,
        meals,
        targets,
        targetComparison,
        entries
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEntry,
  getEntries,
  deleteEntry,
  getDailySummary
};
