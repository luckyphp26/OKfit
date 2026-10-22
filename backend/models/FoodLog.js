const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD']
    },
    meal: {
      type: String,
      enum: {
        values: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        message: '{VALUE} is not a valid meal type'
      },
      required: [true, 'Meal category is required']
    },
    food: {
      name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true
      },
      calories: {
        type: Number,
        required: [true, 'Calories value is required'],
        min: [0, 'Calories cannot be negative']
      },
      protein: {
        type: Number,
        default: 0,
        min: [0, 'Protein cannot be negative']
      },
      carbs: {
        type: Number,
        default: 0,
        min: [0, 'Carbs cannot be negative']
      },
      fat: {
        type: Number,
        default: 0,
        min: [0, 'Fat cannot be negative']
      }
    },
    servings: {
      type: Number,
      default: 1,
      min: [0.01, 'Servings must be greater than 0']
    },
    source: {
      type: String,
      enum: ['manual', 'scan'],
      default: 'manual'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying by user and date efficiently
FoodLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('FoodLog', FoodLogSchema);
