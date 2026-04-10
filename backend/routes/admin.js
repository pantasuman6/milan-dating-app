const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const router = express.Router();

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      usersRes, activeRes, maleRes, femaleRes, otherRes,
      newWeekRes, connectionsRes, acceptedRes, pendingRes,
      rejectedRes, messagesRes, photosRes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = true'),
      pool.query("SELECT COUNT(*) FROM users WHERE gender = 'male'"),
      pool.query("SELECT COUNT(*) FROM users WHERE gender = 'female'"),
      pool.query("SELECT COUNT(*) FROM users WHERE gender = 'other'"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query('SELECT COUNT(*) FROM connection_requests'),
      pool.query("SELECT COUNT(*) FROM connection_requests WHERE status = 'accepted'"),
      pool.query("SELECT COUNT(*) FROM connection_requests WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM connection_requests WHERE status = 'rejected'"),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query('SELECT COUNT(DISTINCT user_id) FROM user_photos'),
    ]);

    res.json({
      total_users:          parseInt(usersRes.rows[0].count),
      active_users:         parseInt(activeRes.rows[0].count),
      male_count:           parseInt(maleRes.rows[0].count),
      female_count:         parseInt(femaleRes.rows[0].count),
      other_count:          parseInt(otherRes.rows[0].count),
      new_this_week:        parseInt(newWeekRes.rows[0].count),
      total_connections:    parseInt(connectionsRes.rows[0].count),
      accepted_connections: parseInt(acceptedRes.rows[0].count),
      pending_requests:     parseInt(pendingRes.rows[0].count),
      rejected_requests:    parseInt(rejectedRes.rows[0].count),
      total_messages:       parseInt(messagesRes.rows[0].count),
      users_with_photos:    parseInt(photosRes.rows[0].count),
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, gender, location, profile_pic, is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id — toggle active
router.put('/users/:id', async (req, res) => {
  const { is_active } = req.body;
  try {
    await pool.query('UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2', [is_active, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
