const express = require('express');
const cors = require('cors');
const path = require('path');
const apiProxy = require('./proxy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API proxy routes
app.use('/api', apiProxy);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
