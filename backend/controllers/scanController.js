const fs = require('fs');
const path = require('path');
const Scan = require('../models/Scan');
const mlService = require('../services/mlService');
const nutritionService = require('../services/nutritionService');

/**
 * @desc    Upload food image and run recognition with ML model
 * @route   POST /api/scan
 * @access  Private
 */
const scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file using multipart/form-data field "image"'
      });
    }

    const imageFilePath = req.file.path;
    const publicImagePath = `/uploads/${req.file.filename}`;

    // Forward image to Python ML microservice
    let mlResult;
    try {
      mlResult = await mlService.predictFood(imageFilePath);
    } catch (mlErr) {
      // Clean up uploaded file if recognition fails
      if (fs.existsSync(imageFilePath)) {
        try {
          fs.unlinkSync(imageFilePath);
        } catch (_) {}
      }
      return next(mlErr);
    }

    // Enrich detected foods with nutritional data from database
    const formattedFoods = nutritionService.formatNutritionResponse(mlResult);

    if (!formattedFoods || formattedFoods.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No recognizable foods detected in the image',
        data: {
          imagePath: publicImagePath,
          foods: []
        }
      });
    }

    // Save scan record to database
    const scanRecord = await Scan.create({
      userId: req.user.id,
      imagePath: publicImagePath,
      foods: formattedFoods,
      savedToLog: false
    });

    res.status(201).json({
      success: true,
      message: 'Food scanned and analyzed successfully',
      data: scanRecord
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
    next(error);
  }
};

/**
 * @desc    Get paginated scan history for authenticated user
 * @route   GET /api/scan/history
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    const total = await Scan.countDocuments(query);
    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: scans.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: scans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific scan by ID
 * @route   GET /api/scan/:id
 * @access  Private
 */
const getScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: `Scan not found with id of ${req.params.id}`
      });
    }

    // Ensure scan belongs to authenticated user
    if (scan.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this scan'
      });
    }

    res.status(200).json({
      success: true,
      data: scan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific scan record
 * @route   DELETE /api/scan/:id
 * @access  Private
 */
const deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: `Scan not found with id of ${req.params.id}`
      });
    }

    // Ensure scan belongs to authenticated user
    if (scan.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this scan'
      });
    }

    // Remove the image file from uploads folder if it exists
    if (scan.imagePath) {
      const filename = path.basename(scan.imagePath);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`Could not delete file ${filePath}:`, err.message);
        }
      }
    }

    await scan.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Scan record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanFood,
  getHistory,
  getScan,
  deleteScan
};
