const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  isStudent: { type: Boolean, required: true, default: true },
  university: { type: String, default: null },
  hasWorkExperience: { type: Boolean, required: true, default: true },
  companyName: { type: String, default: null },
  yearsOfExperience: { type: Number, default: 0 },
  firstLogin: { type: Boolean, default: true },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 👇 New addition for the bubble feature
  collaborationWishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
});

module.exports = mongoose.model('User', UserSchema);