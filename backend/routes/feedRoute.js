const express = require('express');
const multer = require('multer');
const path = require('path');
const Idea = require('../models/idea');

const router = express.Router();

// 🔧 Multer config for file uploads (optional if unused)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/**
 * ✅ Fetch all ideas for the feed
 * URL: /api/feed
 */
router.get('/', async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error fetching feed:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;