// === Updated ideaRoutes.js ===

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const axios = require('axios');

const Idea = require('../models/idea');
const {
  getUserPosts,
  getLikedPosts,
  submitIdea,
  getIdeas,
  toggleCollaboration,
  getCollaborators
} = require('../controllers/ideaController');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

router.get('/count', async (req, res) => {
  try {
    const count = await Idea.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Idea count error:', err.message);
    res.status(500).json({ msg: 'Error fetching idea count' });
  }
});

router.get('/posts-by-user/:userId', auth, getUserPosts);
router.get('/liked-by-user/:userId', auth, getLikedPosts);

router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Idea.find({ userId: req.user.id })
      .populate('likedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching my posts:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/submit', auth, upload.single('file'), submitIdea);
router.get('/all', auth, getIdeas);

router.get('/feed', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const response = await axios.get(`http://auth-service:5000/api/auth/user/${currentUserId}`);
    const currentUser = response.data;

    const ideas = await Idea.find().populate('collaborators', '_id').sort({ createdAt: -1 });
    const followedIds = currentUser?.following?.map(id => id.toString()) || [];

    const ideasWithFollowStatus = ideas.map(idea => ({
      ...idea.toObject(),
      followed: followedIds.includes(idea.userId.toString()),
      collaborators: idea.collaborators.map(c => c._id.toString())
    }));

    res.status(200).json(ideasWithFollowStatus);
  } catch (err) {
    console.error('Fetch Feed Error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch ideas' });
  }
});

router.get('/idea-of-the-day', async (req, res) => {
  try {
    const topIdea = await Idea.find()
      .sort({ likes: -1 })
      .limit(1)
      .populate('userId', 'name email');

    if (topIdea.length > 0) {
      res.status(200).json(topIdea[0]);
    } else {
      res.status(404).json({ message: 'No ideas found' });
    }
  } catch (err) {
    console.error('Error fetching idea of the day:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:ideaId/likes-per-day', auth, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const result = await Idea.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(ideaId) } },
      { $unwind: "$likeTimestamps" },
      { $match: { "likeTimestamps.likedAt": { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$likeTimestamps.likedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const resultMap = result.reduce((acc, entry) => {
      acc[entry._id] = entry.count;
      return acc;
    }, {});

    const final = days.map(date => ({ date, count: resultMap[date] || 0 }));
    res.json(final);
  } catch (err) {
    console.error('Error fetching like stats:', err);
    res.status(500).json({ msg: 'Failed to fetch like stats' });
  }
});

router.post('/collaborate', auth, toggleCollaboration);
router.get('/:ideaId/collaborators', auth, getCollaborators);
router.put('/:ideaId/revert-collab', async (req, res) => {
  const { userId } = req.body;
  try {
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) return res.status(404).send('Idea not found');

    idea.collaborators = idea.collaborators.filter(
      id => id.toString() !== userId
    );

    await idea.save();
    res.status(200).json({ message: 'Collaboration reverted' });
  } catch (err) {
    console.error('Error reverting collaboration:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;