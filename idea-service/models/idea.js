const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  budget: { type: Number, required: true },
  projectStage: { type: String, required: true },
  location: { type: String, required: true },

  // ✅ Corrected: file is just a filename string
  file: { type: String, required: true },

  fileId: mongoose.Schema.Types.ObjectId,

  // 👍 Like feature
  likes: { type: Number, default: 0 },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],

  // ✅ Like timestamps for chart
  likeTimestamps: {
    type: Map,
    of: [Date],
    default: {},
  },

  // 🤝 Collaborators
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
}, { timestamps: true });

const Idea = mongoose.models.Idea || mongoose.model('Idea', IdeaSchema);

module.exports = Idea;