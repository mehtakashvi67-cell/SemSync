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

const clientDirectories = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, 'dist')
];
const clientDirectory = clientDirectories.find(directory =>
  fs.existsSync(path.join(directory, 'index.html'))
);
if (clientDirectory) {
  app.use(express.static(clientDirectory));
  app.get('/', (req, res) => {
    res.sendFile(path.join(clientDirectory, 'index.html'));
  });
  app.use((req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDirectory, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(503).type('html').send(
      '<h1>SemSync is starting</h1><p>The frontend build is missing. Run npm run build before npm start.</p>'
    );
  });
}

app.use((req, res) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found.',
      method: req.method,
      path: req.originalUrl
    });
  }
  return res.status(404).type('text/plain').send('Not found.');
});
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
