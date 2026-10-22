const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePreferences
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const {
  profileUpdateValidation,
  validate
} = require('../utils/validators');

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidation, validate, updateProfile);
router.put('/preferences', updatePreferences);

module.exports = router;
