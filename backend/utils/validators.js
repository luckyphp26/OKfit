const { body, validationResult } = require('express-validator');
const { MEALS } = require('../config/constants');

/**
 * Middleware that inspects express-validator errors and returns standard 400 response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 40 })
    .withMessage('Name cannot exceed 40 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for profile updates
 */
const profileUpdateValidation = [
  body('age')
    .optional()
    .isInt({ min: 10, max: 120 })
    .withMessage('Age must be between 10 and 120'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('activity')
    .optional()
    .isFloat({ min: 1.0, max: 3.0 })
    .withMessage('Activity multiplier must be between 1.0 and 3.0'),
  body('goal')
    .optional()
    .isIn(['loss', 'gain', 'maintain'])
    .withMessage('Goal must be loss, gain, or maintain')
];

/**
 * Validation rules for food log entries
 */
const foodLogValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('meal')
    .notEmpty()
    .withMessage('Meal category is required')
    .isIn(MEALS)
    .withMessage(`Meal must be one of: ${MEALS.join(', ')}`),
  body('food.name')
    .trim()
    .notEmpty()
    .withMessage('Food name is required')
    .isLength({ max: 100 })
    .withMessage('Food name must not exceed 100 characters'),
  body('food.calories')
    .notEmpty()
    .withMessage('Calories are required')
    .isFloat({ min: 0 })
    .withMessage('Calories must be 0 or greater'),
  body('food.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be 0 or greater'),
  body('food.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates must be 0 or greater'),
  body('food.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be 0 or greater'),
  body('servings')
    .optional()
    .isFloat({ min: 0.05, max: 50 })
    .withMessage('Servings must be between 0.05 and 50')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  foodLogValidation
};
