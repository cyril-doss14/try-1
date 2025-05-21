
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const route = require('./routes/authRoutes.js');
app.use('/api/auth', route);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('auth-service connected to MongoDB');
  app.listen(5000, () => console.log('auth-service running on port 5000'));
}).catch((err) => console.error('MongoDB connection error:', err));