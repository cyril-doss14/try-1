const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const collaboration-service_ROUTES = require('./routes/collaboration-serviceRoutes');

    dotenv.config();
    const app = express();
    app.use(express.json());
    app.use('/api/collaboration-service', collaboration-service_ROUTES);

    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      console.log('Connected to MongoDB');
      app.listen(5000, () => console.log('collaboration-service running on port 5000'));
    }).catch((err) => console.error('MongoDB connection error:', err));