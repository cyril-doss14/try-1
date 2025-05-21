const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mime = require('mime-types');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const feedRoutes = require('./routes/feedRoute');
const followRoutes = require('./routes/followRoutes');
const followPostsRoutes = require('./routes/followPosts');
const likeRoutes = require('./routes/likeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Idea = require('./models/idea');

dotenv.config();
const app = express();

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Uploads directory created');
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// Serve uploaded files
app.use('/uploads', express.static(uploadsPath));

// ✅ File download by ID
app.get('/api/ideas/file/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea?.file) {
      return res.status(404).json({ error: 'File not found in database', ideaId: req.params.id });
    }

    const filePath = path.join(uploadsPath, idea.file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found', filename: idea.file });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Disposition', `attachment; filename="${idea.file}"`);
    res.setHeader('Content-Type', mimeType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ error: 'File streaming failed' });
    });
    fileStream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Idea of the Day (most liked idea)
app.get('/api/ideas/idea-of-the-day', async (req, res) => {
  try {
    const idea = await Idea.findOne().sort({ likes: -1 }).limit(1).populate('userId', 'name email');
    if (!idea) return res.status(404).json({ msg: 'No idea found' });
    res.status(200).json(idea);
  } catch (err) {
    console.error('Error fetching idea of the day:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Connect Database
connectDB();

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/followPosts', followPostsRoutes);
app.use('/api', followRoutes);
app.use('/api', likeRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// ✅ Serve frontend static files
const frontendPath = path.join(__dirname, 'public');
app.use(express.static(frontendPath));

// ✅ Fallback for React routing
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('React build not found. Please build frontend.');
  }
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🛢️ Connected to MongoDB: ${process.env.MONGO_URI}`);
});