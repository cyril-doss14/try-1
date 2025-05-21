// chat-service/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  profilePicture: {
    type: String,
    default: '',
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
});

module.exports = mongoose.model('User', UserSchema);