const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Try to extract token from either header format
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // This assumes your token payload looks like: { user: { id, email } }
    const userId = decoded.user?.id || decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ msg: 'Invalid token payload' });
    }

    // Get user from DB
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email
    };

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;