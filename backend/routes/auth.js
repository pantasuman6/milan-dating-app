const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, gender, job_title, bio, location, looking_for, match_gender_pref } = req.body;

    // Validate required fields
    if (!email || !password || !name || !age || !gender) {
      return res.status(400).json({ error: 'Required: email, password, name, age, gender' });
    }
    if (parseInt(age) < 18) {
      return res.status(400).json({ error: 'You must be 18 or older' });
    }

    // Check duplicate email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and insert
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users
         (email, password_hash, name, age, gender, job_title, bio, location, looking_for, match_gender_pref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, name, email, age, gender, job_title, bio, location, looking_for, match_gender_pref, profile_pic, created_at`,
      [
        email.toLowerCase().trim(),
        hash,
        name.trim(),
        parseInt(age),
        gender,
        job_title || null,
        bio || null,
        location || null,
        looking_for || null,
        match_gender_pref || 'any'
      ]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user });

  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    return res.json({ token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

module.exports = router;
