require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/profile',     require('./routes/profile'));
app.use('/api/browse',      require('./routes/browse'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages',    require('./routes/messages'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Milan', time: new Date() }));

// Start server — DB failure logs error but server still starts
const start = async () => {
  try {
    await initDB();
  } catch (err) {
    console.error('⚠️  DB init warning:', err.message);
    // Don't exit — server still starts so routes work
  }
  app.listen(PORT, () => {
    console.log(`\n🌸 Milan Backend running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health\n`);
  });
};

start();
