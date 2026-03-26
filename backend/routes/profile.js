const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg','image/png','image/webp','image/jpg'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images allowed'));
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, age, gender, job_title, bio, location, profile_pic, looking_for, match_gender_pref, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

router.put('/me', authMiddleware, async (req, res) => {
  const { name, age, gender, job_title, bio, location, looking_for, match_gender_pref } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1,age=$2,gender=$3,job_title=$4,bio=$5,location=$6,looking_for=$7,match_gender_pref=$8,updated_at=NOW()
       WHERE id=$9 RETURNING id, name, email, age, gender, job_title, bio, location, profile_pic, looking_for, match_gender_pref`,
      [name, age, gender, job_title, bio, location, looking_for, match_gender_pref, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to update profile' }); }
});

router.post('/me/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query('UPDATE users SET profile_pic=$1, updated_at=NOW() WHERE id=$2', [photoUrl, req.user.id]);
    res.json({ profile_pic: photoUrl });
  } catch (err) { res.status(500).json({ error: 'Failed to save photo' }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, age, gender, job_title, bio, location, profile_pic, looking_for, created_at FROM users WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

module.exports = router;
