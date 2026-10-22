const User = require('../models/User');
const { calculateNutritionTargets } = require('../config/constants');

/**
 * @desc    Get user profile and nutritional targets
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const targets = calculateNutritionTargets(user.profile);

    res.status(200).json({
      success: true,
      data: {
        profile: user.profile,
        preferences: user.preferences,
        targets
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile data (age, gender, height, weight, activity, goal)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { age, gender, height, weight, activity, goal } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Merge profile fields
    if (age !== undefined) user.profile.age = Number(age);
    if (gender !== undefined) user.profile.gender = gender;
    if (height !== undefined) user.profile.height = Number(height);
    if (weight !== undefined) user.profile.weight = Number(weight);
    if (activity !== undefined) user.profile.activity = Number(activity);
    if (goal !== undefined) user.profile.goal = goal;

    await user.save();

    const targets = calculateNutritionTargets(user.profile);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: user.profile,
        targets
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user preferences (e.g. theme: 'light' | 'dark')
 * @route   PUT /api/users/preferences
 * @access  Private
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { theme } = req.body;

    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        error: 'Theme must be either "light" or "dark"'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (theme) {
      user.preferences.theme = theme;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences
};
