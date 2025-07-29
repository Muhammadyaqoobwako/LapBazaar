// routes/auth.js
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');

const User               = require('../models/User');
const isAuthenticated    = require('../middleware/isAuthenticatedUser');
const authorizeRoles     = require('../middleware/authorizeRoles');
const sendEmail          = require('../utils/sendEmail'); // <-- build or stub

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// ─────────────────────────────────────────
// 1. Register
// POST /api/auth/register
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    // ensure unique e‑mail
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'E‑mail already in use' });

    // create user
    const user = await User.create({ name, email, password, phone, role });

    // generate e‑mail verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // send verification e‑mail (replace with your frontend url)
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your e‑mail',
      text: `Click to verify: ${verifyUrl}`
    });

    res.status(201).json({ success: true, message: 'Registered! Check your e‑mail to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// 2. Login
// POST /api/auth/login
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email & password' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // optional: block unverified users
    // if (!user.verified) return res.status(403).json({ message: 'E‑mail not verified' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// 3. Logout (client just discards token; cookie version shown for reference)
// GET /api/auth/logout
// ─────────────────────────────────────────
router.get('/logout', (_req, res) => {
  res.status(200).json({ success: true, message: 'Logged out. Delete token client‑side.' });
});

// ─────────────────────────────────────────
// 4. Current user profile
// GET /api/auth/me
// ─────────────────────────────────────────
router.get('/me', isAuthenticated, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// ─────────────────────────────────────────
// 5. Forgot password
// POST /api/auth/password/forgot
// ─────────────────────────────────────────
router.post('/password/forgot', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that e‑mail' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password reset',
      text: `Reset your password: ${resetUrl}`
    });

    res.status(200).json({ success: true, message: 'Reset e‑mail sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// 6. Reset password
// PUT /api/auth/password/reset/:token
// ─────────────────────────────────────────
router.put('/password/reset/:token', async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const { password, confirmPassword } = req.body;
    if (!password || password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    user.password = password;            // will hash via pre save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// 7. Verify e‑mail
// GET /api/auth/verify/:token
// ─────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({ verificationToken });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.verified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'E‑mail verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// 8. Example protected/admin route
// GET /api/auth/admin‑test
// ─────────────────────────────────────────
router.get('/admin-test',
  isAuthenticated,
  authorizeRoles('admin'),
  (_req, res) => {
    res.json({ secret: 'Only admins see this' });
  }
);

module.exports = router;
