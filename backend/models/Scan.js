const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a scan record']
    },
    imagePath: {
      type: String,
      required: [true, 'Image path is required']
    },
    foods: [
      {
        name: {
          type: String,
          required: true
        },
        confidence: {
          type: Number,
          default: 0
        },
        nutrition: {
          calories: { type: Number, default: 0 },
          protein: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
          fat: { type: Number, default: 0 },
          fiber: { type: Number, default: 0 },
          sugar: { type: Number, default: 0 },
          servingSize: { type: String, default: '1 serving' }
        }
      }
    ],
    savedToLog: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for quick queries by user and date
ScanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Scan', ScanSchema);
