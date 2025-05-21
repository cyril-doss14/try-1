const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/chat');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ error: 'Receiver and message text are required' });
    }

    const message = new Message({
      senderId,
      receiverId,
      text,
      timestamp: new Date(),
      seen: false,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Send Message Error:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ✅ Mark messages as seen
router.post('/mark-seen', auth, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (err) {
    console.error('Mark Seen Error:', err.message);
    res.status(500).json({ error: 'Failed to update seen status' });
  }
});

// ✅ Chat Inbox: full logic with wish flags
router.get('/inbox', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId).select('following collaborationWishes');
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const followedIds = currentUser.following.map(id => id.toString());
    const wishesReceived = currentUser.collaborationWishes.map(id => id.toString());

    // Users who wished to collaborate with current user
    const usersICollabed = await User.find({ collaborationWishes: currentUserId }).select('_id');
    const wishesGiven = usersICollabed.map(u => u._id.toString());

    // Users who messaged or were messaged
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    });

    const messagedIds = new Set();
    for (const msg of messages) {
      const otherUserId = msg.senderId.toString() === currentUserId
        ? msg.receiverId.toString()
        : msg.senderId.toString();
      messagedIds.add(otherUserId);
    }

    // Combine all relevant user IDs
    const allUserIds = new Set([
      ...followedIds,
      ...messagedIds,
      ...wishesReceived,
      ...wishesGiven,
    ]);

    const userMap = new Map();

    for (const userId of allUserIds) {
      const user = await User.findById(userId).select('name email collaborationWishes');
      if (!user) continue;

      const unseenCount = await Message.countDocuments({
        senderId: userId,
        receiverId: currentUserId,
        seen: false,
      });

      userMap.set(userId, {
        id: userId,
        name: user.name || user.email,
        unseenCount,
        wishesToCollaborate: wishesReceived.includes(userId),
        wishedByCurrentUser: user.collaborationWishes.includes(currentUserId),
      });
    }

    res.status(200).json(Array.from(userMap.values()));
  } catch (err) {
    console.error('Inbox Fetch Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chat inbox' });
  }
});

// ✅ Get messages between two users
router.get('/:user1/:user2', auth, async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(user1) ||
      !mongoose.Types.ObjectId.isValid(user2)
    ) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Fetch Messages Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router; 