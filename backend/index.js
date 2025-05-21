const express = require('express');
const app = express();
const port = 5001;

app.get('/', (req, res) => {
  res.send('Backend running on port 5001');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend is running at http://localhost:${port}`);
});