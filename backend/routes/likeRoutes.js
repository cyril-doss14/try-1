const express = require('express');
const router = express.Router();
const Idea = require('../models/idea');
const auth = require('../middleware/auth');

// POST request to like or unlike an idea
router.post('/like', auth, async (req, res) => {
  const { ideaId } = req.body;
  const currentUserId = req.user.id;

  try {
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }

    // Initialize likedBy and likeTimestamps if not present
    if (!Array.isArray(idea.likedBy)) {
      idea.likedBy = [];
    }

    if (!idea.likeTimestamps) {
      idea.likeTimestamps = new Map();
    }

    const alreadyLiked = idea.likedBy.includes(currentUserId);
    const today = new Date();
    const dateKey = today.toISOString().slice(0, 10); // yyyy-mm-dd

    if (alreadyLiked) {
      // 👎 Unlike
      idea.likedBy = idea.likedBy.filter(id => id.toString() !== currentUserId.toString());
      idea.likes = Math.max((idea.likes || 1) - 1, 0);

      const timestamps = idea.likeTimestamps.get(dateKey) || [];
      const updated = timestamps.filter(
        ts => new Date(ts).toISOString() !== today.toISOString()
      );
      idea.likeTimestamps.set(dateKey, updated);
    } else {
      // 👍 Like
      idea.likedBy.push(currentUserId);
      idea.likes = (idea.likes || 0) + 1;

      const timestamps = idea.likeTimestamps.get(dateKey) || [];
      timestamps.push(today);
      idea.likeTimestamps.set(dateKey, timestamps);
    }

    await idea.save();

    res.status(200).json({
      msg: alreadyLiked ? 'Idea unliked successfully' : 'Idea liked successfully',
      likes: idea.likes,
      likedBy: idea.likedBy
    });
  } catch (error) {
    console.error('🔥 Error toggling like:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
