/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error stack:', err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Maximum allowed size is 10MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field in upload request.';
    } else {
      message = err.message;
    }
    error = { message, statusCode: 400 };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token. Please log in again.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired. Please log in again.';
    error = { message, statusCode: 401 };
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
