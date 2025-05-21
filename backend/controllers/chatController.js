const Chat = require('../models/chat');
const User = require('../models/User');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({ msg: 'Missing receiver or message' });
    }

    const newMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    res.status(201).json({ msg: 'Message sent', message: newMessage });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get chat messages between the logged-in user and another user
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ New: Get chat inbox users (followed + message + collaboration wish)
exports.getInboxUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user
    const currentUser = await User.findById(userId).populate('following', 'name email');
    const followed = currentUser.following.map(u => u.toString());

    // Get unique users messaged with
    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    const messagedUsers = new Set();
    chats.forEach(chat => {
      if (chat.sender.toString() !== userId) messagedUsers.add(chat.sender.toString());
      if (chat.receiver.toString() !== userId) messagedUsers.add(chat.receiver.toString());
    });

    const inboxUserIds = new Set([...followed, ...messagedUsers]);

    // Get collaboration wishes sent to this user
    const collabWishUsers = await User.find({
      collaborationWishes: userId
    }).select('name email');

    const collabWisherIds = collabWishUsers.map(u => u._id.toString());

    // Fetch user info for inbox list
    const inboxUsers = await User.find({ _id: { $in: [...inboxUserIds] } }).select('name email');

    const final = inboxUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      wishesToCollaborate: collabWisherIds.includes(user._id.toString())
    }));

    res.json(final);
  } catch (error) {
    console.error('Inbox fetch error:', error.message);
    res.status(500).json({ msg: 'Failed to load inbox' });
  }
};