const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { databasePath } = require('./db/database');
const apiRoutes = require('./routes/api');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const port = process.env.PORT || 3001;
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api', apiRoutes);
app.use('/api', dataRoutes);
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
