const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Sends food image to Python ML microservice for recognition
 * @param {string} imagePath - Absolute path to uploaded image file
 * @returns {Promise<Object>} Recognition results with detected food items and confidences
 */
const predictFood = async (imagePath) => {
  const mlUrl = process.env.PYTHON_ML_URL || 'http://localhost:5001';
  const predictEndpoint = `${mlUrl.replace(/\/+$/, '')}/predict`;

  if (!fs.existsSync(imagePath)) {
    const error = new Error(`Image file not found at: ${imagePath}`);
    error.statusCode = 404;
    throw error;
  }

  const fileName = path.basename(imagePath);
  const fileExt = path.extname(fileName).toLowerCase();
  const mimeType =
    fileExt === '.png'
      ? 'image/png'
      : fileExt === '.webp'
      ? 'image/webp'
      : 'image/jpeg';

  const fileBuffer = fs.readFileSync(imagePath);

  // Build FormData for multipart POST request
  let requestData;
  let headers = {};

  if (typeof FormData !== 'undefined') {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('image', blob, fileName);
    requestData = formData;
  } else {
    // Fallback if FormData is not globally defined
    requestData = fileBuffer;
    headers['Content-Type'] = mimeType;
  }

  try {
    const response = await axios.post(predictEndpoint, requestData, {
      timeout: 30000, // 30 seconds timeout
      headers
    });

    return response.data;
  } catch (error) {
    // Connection refused: Python ML service is not running
    if (error.code === 'ECONNREFUSED') {
      const serviceError = new Error(
        'Food recognition ML service is currently offline or unreachable. Please ensure the Python service is running on ' +
          mlUrl
      );
      serviceError.statusCode = 503;
      throw serviceError;
    }

    // Request timeout after 30s
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      const timeoutError = new Error(
        'Food recognition ML service request timed out after 30 seconds. The image may be too large or model is busy.'
      );
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // Server responded with an error status (4xx, 5xx)
    if (error.response) {
      const msg =
        (error.response.data && (error.response.data.error || error.response.data.message)) ||
        `ML service error with status code ${error.response.status}`;
      const apiError = new Error(msg);
      apiError.statusCode = error.response.status;
      throw apiError;
    }

    throw error;
  }
};

module.exports = {
  predictFood
};
