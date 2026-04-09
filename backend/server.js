require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow all Railway + localhost origins ──────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
];

// Auto-add FRONTEND_URL from env (handles http and https variants)
if (process.env.FRONTEND_URL) {
  const url = process.env.FRONTEND_URL.trim();
  allowedOrigins.push(url);
  // Also add with/without trailing slash
  allowedOrigins.push(url.replace(/\/$/, ''));
  // Add https version if http was provided and vice versa
  if (url.startsWith('http://')) allowedOrigins.push(url.replace('http://', 'https://'));
  if (url.startsWith('https://')) allowedOrigins.push(url.replace('https://', 'http://'));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any railway.app subdomain
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
      return callback(null, true);
    }
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/profile',     require('./routes/profile'));
app.use('/api/browse',      require('./routes/browse'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages',    require('./routes/messages'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Milan Dating App', time: new Date() });
});

// Start server
const start = async () => {
  try {
    await initDB();
  } catch (err) {
    console.error('⚠️  DB init warning (server still starts):', err.message);
  }
  app.listen(PORT, () => {
    console.log(`\n🌸 Milan Backend running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🌐 Allowed origins:`, allowedOrigins, '\n');
  });
};

start();
