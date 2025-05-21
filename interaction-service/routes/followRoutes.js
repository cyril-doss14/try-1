const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// 🔁 FOLLOW USER
router.post('/follow', auth, async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  try {
    if (!userId) return res.status(400).json({ msg: 'User ID is required' });
    if (userId === currentUserId) return res.status(400).json({ msg: 'You cannot follow yourself' });

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const alreadyFollowing = currentUser.following.some(f => f.toString() === userId);
    if (alreadyFollowing) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ msg: 'Successfully followed the user' });
  } catch (err) {
    console.error('🔴 Follow error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔁 UNFOLLOW USER (Updated to handle ObjectId comparison properly)
router.post('/unfollow', auth, async (req, res) => {
  const { userId, unfollowUserId } = req.body;
  
  try {
    if (!userId || !unfollowUserId) {
      return res.status(400).json({ msg: 'Missing userId or unfollowUserId' });
    }

    const currentUser = await User.findById(userId);
    const userToUnfollow = await User.findById(unfollowUserId);

    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === unfollowUserId); // ✅ FIXED

    if (!isFollowing) {
      return res.status(400).json({ msg: 'You are not following this user' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== unfollowUserId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== userId);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ msg: 'Successfully unfollowed the user' });
  } catch (err) {
    console.error('🔴 Unfollow error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🔎 Get list of followed user IDs
router.get('/following/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('following');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.following);
  } catch (err) {
    console.error('🔴 Fetch following list error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;