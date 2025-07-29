// models/User.js
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const validator  = require('validator');
const crypto     = require('crypto');

const userSchema = new mongoose.Schema({
  /* ─────────── Personal Info ─────────── */
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [50, 'Name cannot exceed 50 characters'],
    minLength: [3, 'Name should have at least 3 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [6, 'Password should be at least 6 characters'],
    select: false                           // never return password
  },
  phone: {
    type: String,
    required: [true, 'Please enter your phone number'],
    validate: {
      validator: v => /^[0-9]{10}$/.test(v),
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    street:  String,
    city:    String,
    state:   String,
    zipCode: String
  },

  /* ─────────── Role & Auth ─────────── */
  role: {
    type: String,
    enum: ['user', 'technician', 'admin', 'dealer'], // technician added
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },

  /* ─────────── Tokens ─────────── */
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
  verificationToken:   String,

  /* ─────────── Relationships ─────────── */
  favorites: [{
    type: mongoose.Schema.ObjectId,
    ref:  'Laptop'
  }]
});

/* ──────────────────────────────────────────
   Hooks
─────────────────────────────────────────── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ──────────────────────────────────────────
   Instance Methods
─────────────────────────────────────────── */
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return resetToken;
};

userSchema.methods.getVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

/* ──────────────────────────────────────────
   Clean JSON output
─────────────────────────────────────────── */
userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.verificationToken;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
