const express = require('express');
const dotenv = require('dotenv');
const feedRoutes = require('./routes/feedRoutes');

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api/feed', feedRoutes);

app.listen(5000, () => {
  console.log('Feed Service running on port 5000');
});