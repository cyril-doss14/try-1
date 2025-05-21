const express = require('express');
const {
  registerUser,
  loginUser,
  unfollowUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// ✅ Register
router.post('/register', registerUser);

// ✅ Login
router.post('/login', loginUser);

// ✅ Get current logged-in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error in /me route:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Get total user count (for dashboard or landing page)
router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('User count error:', err.message);
    res.status(500).json({ msg: 'Error fetching user count' });
  }
});

// ✅ Unfollow a user
router.post('/unfollow', unfollowUser);

// ✅ Get followers count for a user
router.get('/followers-count/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const count = user.followers?.length || 0;
    res.json({ count });
  } catch (err) {
    console.error('Error fetching followers count:', err.message);
    res.status(500).json({ msg: 'Error fetching follower count' });
  }
});

// ✅ Get followers list for a user
router.get('/followers-list/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'name email');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.followers || []);
  } catch (err) {
    console.error('Error fetching followers list:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Get following list for a user
router.get('/following-list/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'name email');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.following || []);
  } catch (err) {
    console.error('Error fetching following list:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Get any user's public info by ID
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email following');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;