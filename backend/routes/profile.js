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
    cb(null, `${req.user.id}_${Date.now()}_${Math.random().toString(36).substr(2,6)}${ext}`);
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

// Get my profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, age, gender, job_title, bio, location, profile_pic, looking_for, match_gender_pref, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    // Attach photos
    const photos = await pool.query(
      'SELECT id, photo_url, is_primary, sort_order FROM user_photos WHERE user_id = $1 ORDER BY sort_order ASC',
      [req.user.id]
    );
    user.photos = photos.rows;
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

// Update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name, age, gender, job_title, bio, location, looking_for, match_gender_pref } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, age=$2, gender=$3, job_title=$4, bio=$5, location=$6, looking_for=$7, match_gender_pref=$8, updated_at=NOW()
       WHERE id=$9 RETURNING id, name, email, age, gender, job_title, bio, location, profile_pic, looking_for, match_gender_pref`,
      [name, age, gender, job_title, bio, location, looking_for, match_gender_pref, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to update profile' }); }
});

// Upload single profile picture (primary)
router.post('/me/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query('UPDATE users SET profile_pic=$1, updated_at=NOW() WHERE id=$2', [photoUrl, req.user.id]);
    // Also add to user_photos as primary
    await pool.query(
      `INSERT INTO user_photos (user_id, photo_url, is_primary, sort_order)
       VALUES ($1, $2, true, 0)
       ON CONFLICT DO NOTHING`,
      [req.user.id, photoUrl]
    );
    res.json({ profile_pic: photoUrl });
  } catch (err) { res.status(500).json({ error: 'Failed to save photo' }); }
});

// Upload multiple photos (up to 5)
router.post('/me/photos', authMiddleware, upload.array('photos', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  try {
    // Get current photo count
    const countRes = await pool.query('SELECT COUNT(*) FROM user_photos WHERE user_id=$1', [req.user.id]);
    let currentCount = parseInt(countRes.rows[0].count);

    const inserted = [];
    for (const file of req.files) {
      const photoUrl = `/uploads/${file.filename}`;
      const isPrimary = currentCount === 0;
      const result = await pool.query(
        'INSERT INTO user_photos (user_id, photo_url, is_primary, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
        [req.user.id, photoUrl, isPrimary, currentCount]
      );
      // Set first photo as profile_pic
      if (isPrimary) {
        await pool.query('UPDATE users SET profile_pic=$1, updated_at=NOW() WHERE id=$2', [photoUrl, req.user.id]);
      }
      inserted.push(result.rows[0]);
      currentCount++;
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Delete a photo
router.delete('/me/photos/:photoId', authMiddleware, async (req, res) => {
  try {
    const photo = await pool.query(
      'SELECT * FROM user_photos WHERE id=$1 AND user_id=$2',
      [req.params.photoId, req.user.id]
    );
    if (photo.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

    await pool.query('DELETE FROM user_photos WHERE id=$1', [req.params.photoId]);

    // If deleted was primary, set next photo as primary
    if (photo.rows[0].is_primary) {
      const next = await pool.query(
        'SELECT * FROM user_photos WHERE user_id=$1 ORDER BY sort_order ASC LIMIT 1',
        [req.user.id]
      );
      if (next.rows.length > 0) {
        await pool.query('UPDATE user_photos SET is_primary=true WHERE id=$1', [next.rows[0].id]);
        await pool.query('UPDATE users SET profile_pic=$1 WHERE id=$2', [next.rows[0].photo_url, req.user.id]);
      } else {
        await pool.query('UPDATE users SET profile_pic=NULL WHERE id=$1', [req.user.id]);
      }
    }
    res.json({ message: 'Photo deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete photo' }); }
});

// Get any user profile by id (with photos)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, age, gender, job_title, bio, location, profile_pic, looking_for, created_at FROM users WHERE id=$1 AND is_active=true',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    const photos = await pool.query(
      'SELECT id, photo_url, is_primary, sort_order FROM user_photos WHERE user_id=$1 ORDER BY sort_order ASC',
      [req.params.id]
    );
    user.photos = photos.rows;
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

module.exports = router;