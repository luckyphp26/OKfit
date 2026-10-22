const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [40, 'Name cannot exceed 40 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
      age: {
        type: Number,
        min: [10, 'Age must be at least 10'],
        max: [120, 'Age cannot exceed 120']
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
      },
      height: {
        type: Number, // in cm
        min: [50, 'Height must be at least 50 cm'],
        max: [300, 'Height cannot exceed 300 cm']
      },
      weight: {
        type: Number, // in kg
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg']
      },
      activity: {
        type: Number, // multiplier e.g. 1.2, 1.375, 1.55, 1.725
        default: 1.375
      },
      goal: {
        type: String,
        enum: ['loss', 'gain', 'maintain'],
        default: 'maintain'
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password with bcryptjs before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.JWT_SECRET || 'okfit-default-jwt-secret-replace-in-production',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Match user entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes from now)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
