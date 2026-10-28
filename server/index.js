const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { databasePath } = require('./db/database');
const apiRoutes = require('./routes/api');
const dataRoutes = require('./routes/dataRoutes');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [process.env.CLIENT_URL, process.env.RENDER_EXTERNAL_URL, 'http://localhost:5173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api', apiRoutes);
app.use('/api', dataRoutes);

const clientDirectory = path.join(__dirname, '..', 'dist');
if (fs.existsSync(clientDirectory)) {
  app.use(express.static(clientDirectory));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDirectory, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`SemSync API listening on http://localhost:${port}`);
    console.log(`SQLite database: ${path.resolve(databasePath)}`);
  });
}

module.exports = app;
