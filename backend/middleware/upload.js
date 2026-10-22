const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } = require('../config/constants');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user && req.user._id ? req.user._id : 'anon';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `scan-${userId}-${timestamp}${ext}`);
  }
});

// Validate file type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype}). Allowed types: JPEG, PNG, WebP`
      ),
      false
    );
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

module.exports = upload;
