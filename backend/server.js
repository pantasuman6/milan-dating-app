require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173','http://localhost:3000','http://localhost:8080'];
if (process.env.FRONTEND_URL) {
  const url = process.env.FRONTEND_URL.trim().replace(/\/$/, '');
  allowedOrigins.push(url, url.replace('http://', 'https://'), url.replace('https://', 'http://'));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/profile',     require('./routes/profile'));
app.use('/api/browse',      require('./routes/browse'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages',    require('./routes/messages'));
app.use('/api/admin',       require('./routes/admin'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const start = async () => {
  try { await initDB(); } catch (err) { console.error('⚠️ DB warning:', err.message); }
  app.listen(PORT, () => {
    console.log(`\n🌸 Milan running on http://localhost:${PORT}`);
    console.log(`👑 Admin email: ${process.env.ADMIN_EMAIL || 'not set'}\n`);
  });
};

start();
