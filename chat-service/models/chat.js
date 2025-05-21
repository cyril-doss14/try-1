// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  text: { type: String, required: true },
  seen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);