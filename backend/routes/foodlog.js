const express = require('express');
const router = express.Router();
const {
  addEntry,
  getEntries,
  deleteEntry,
  getDailySummary
} = require('../controllers/foodLogController');
const { protect } = require('../middleware/auth');
const {
  foodLogValidation,
  validate
} = require('../utils/validators');

// All food log routes require authentication
router.use(protect);

router.post('/', foodLogValidation, validate, addEntry);
router.get('/', getEntries);
router.get('/summary/:date', getDailySummary);
router.delete('/:id', deleteEntry);

module.exports = router;
