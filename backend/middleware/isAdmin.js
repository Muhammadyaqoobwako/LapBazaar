const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied for your role.' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
  };
};

module.exports = authorizeRoles;
