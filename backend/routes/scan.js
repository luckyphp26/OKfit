const express = require('express');
const router = express.Router();
const {
  scanFood,
  getHistory,
  getScan,
  deleteScan
} = require('../controllers/scanController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All scan routes require authentication
router.use(protect);

router.post('/', upload.single('image'), scanFood);
router.get('/history', getHistory);
router.get('/:id', getScan);
router.delete('/:id', deleteScan);

module.exports = router;
