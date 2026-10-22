const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  clearChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes require authentication
router.use(protect);

router.post('/', sendMessage);
router.get('/history', getHistory);
router.delete('/', clearChat);

module.exports = router;
