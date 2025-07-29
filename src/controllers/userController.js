// src/controllers/userController.js
const asyncHandler = require('express-async-handler'); // For handling async errors in Express routes
const User = require('../models/userModel'); // Adjust path if your User model is elsewhere
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { userId: id, role: role }, // Payload: user ID and role
    process.env.JWT_SECRET || 'fallback-secret-key', // Use JWT_SECRET from .env
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// @desc    Register new user
// @route   POST /api/v1/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password, // Password will be hashed by the pre-save hook in userSchema
    role: role || 'user', // Default role to 'user' if not provided
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/v1/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  // Check for user email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('Invalid credentials'); // Use generic message for security
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (user && isMatch) {
    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get current user data
// @route   GET /api/v1/auth/me
// @access  Private (requires verifyToken middleware)
const getMe = asyncHandler(async (req, res) => {
  // req.userId and req.userRole are set by the verifyToken middleware
  const user = await User.findById(req.userId).select('-password'); // Exclude password hash

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};