const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const { location, min_age, max_age, gender } = req.query;
  const userId = req.user.id;
  try {
    let conditions = ['u.id != $1', 'u.is_active = true'];
    let params = [userId];
    let i = 2;

    conditions.push(`u.id NOT IN (
      SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
      FROM connection_requests
      WHERE (sender_id = $1 OR receiver_id = $1) AND status IN ('pending','accepted')
    )`);

    if (location)  { conditions.push(`LOWER(u.location) LIKE LOWER($${i++})`); params.push(`%${location}%`); }
    if (min_age)   { conditions.push(`u.age >= $${i++}`); params.push(parseInt(min_age)); }
    if (max_age)   { conditions.push(`u.age <= $${i++}`); params.push(parseInt(max_age)); }
    if (gender && gender !== 'any') { conditions.push(`u.gender = $${i++}`); params.push(gender); }

    const sql = `
      SELECT u.id, u.name, u.age, u.gender, u.job_title, u.bio, u.location, u.profile_pic, u.looking_for, u.created_at
      FROM users u
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.created_at DESC LIMIT 50
    `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Browse error:', err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

module.exports = router;
