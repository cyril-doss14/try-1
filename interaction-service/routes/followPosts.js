const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Idea = require('../models/idea');
const auth = require('../middleware/auth');

// Route to get ideas by followed users
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const followedUsers = currentUser.following;

    if (!followedUsers || followedUsers.length === 0) {
      return res.status(200).json([]);
    }

    // Populate name & email from user
    const ideas = await Idea.find({ userId: { $in: followedUsers } }).populate('userId', 'name email');

    const ideasWithUserInfo = ideas.map((idea) => ({
      ...idea._doc,
      name: idea.userId?.name || '',
      email: idea.userId?.email || '',
    }));

    res.status(200).json(ideasWithUserInfo);
  } catch (error) {
    console.error('Error fetching followed posts:', error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;