const Idea = require('../models/idea');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function for validating required fields
const validateFields = (fields, res) => {
  for (const field of fields) {
    if (!field.value) {
      return res.status(400).json({ msg: `Please provide ${field.name}` });
    }
  }
};

// ✅ Submit a new idea
exports.submitIdea = async (req, res) => {
  try {
    const { name, title, description, domain, budget, projectStage, location } = req.body;
    const email = req.user.email;
    const userId = req.user.id;
    const file = req.file ? req.file.filename : null;

    const validationResponse = validateFields([
      { value: email, name: 'email' },
      { value: name, name: 'name' },
      { value: title, name: 'title' },
      { value: description, name: 'description' },
      { value: domain, name: 'domain' },
      { value: budget, name: 'budget' },
      { value: projectStage, name: 'projectStage' },
      { value: location, name: 'location' },
      { value: file, name: 'file' }
    ], res);

    if (validationResponse) return validationResponse;

    const idea = new Idea({
      email,
      name,
      userId,
      title,
      description,
      domain,
      budget,
      projectStage,
      location,
      file
    });

    await idea.save();

    return res.status(201).json({
      msg: 'Idea submitted successfully',
      idea
    });

  } catch (error) {
    console.error('Error submitting idea:', error.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ Get all ideas
exports.getIdeas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.email) {
      if (req.user.email !== req.query.email) {
        return res.status(403).json({ msg: 'Unauthorized access' });
      }
      filter.email = req.query.email;
    }

    const ideas = await Idea.find(filter).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    console.error('Error getting ideas:', error.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ Get posts by user (with likedBy populated)
exports.getUserPosts = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.userId);

    const posts = await Idea.find({ userId: objectId })
      .populate('likedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Error fetching user posts:', err.message);
    res.status(500).json({ msg: "Failed to fetch user's posts" });
  }
};

// ✅ Get posts liked by user
exports.getLikedPosts = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.userId);
    const likedPosts = await Idea.find({ likedBy: objectId })
      .populate('likedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(likedPosts);
  } catch (err) {
    console.error('Error fetching liked posts:', err.message);
    res.status(500).json({ msg: 'Failed to fetch liked posts' });
  }
};

// ✅ Toggle collaborator and update collaborationWishes for chat hint
exports.toggleCollaboration = async (req, res) => {
  try {
    const { ideaId } = req.body;
    const userId = req.user.id;

    const idea = await Idea.findById(ideaId);
    if (!idea) return res.status(404).json({ msg: 'Idea not found' });

    const ideaOwnerId = idea.userId.toString();
    const isCollaborating = idea.collaborators.includes(userId);

    if (isCollaborating) {
      // Remove from collaborators
      idea.collaborators = idea.collaborators.filter(id => id.toString() !== userId);

      // ❌ Remove collaboration wish from idea owner (userId was wishing to collaborate with ideaOwnerId)
      await User.findByIdAndUpdate(ideaOwnerId, {
        $pull: { collaborationWishes: userId }
      });
    } else {
      // Add to collaborators
      idea.collaborators.push(userId);

      // ✅ Add current user to idea owner's collaborationWishes
      await User.findByIdAndUpdate(ideaOwnerId, {
        $addToSet: { collaborationWishes: userId }
      });
    }

    await idea.save();

    res.status(200).json({
      msg: isCollaborating ? 'Collaboration reverted' : 'Collaboration requested',
      collaborators: idea.collaborators,
    });
  } catch (error) {
    console.error('Error toggling collaboration:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ Get collaborators
exports.getCollaborators = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const idea = await Idea.findById(ideaId).populate('collaborators', 'name email');
    if (!idea) return res.status(404).json({ msg: 'Idea not found' });

    res.status(200).json(idea.collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};