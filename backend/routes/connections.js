const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/request/:receiverId', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;
  const { message } = req.body;
  if (senderId === receiverId) return res.status(400).json({ error: 'Cannot connect with yourself' });
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [receiverId]);
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const existing = await pool.query(
      'SELECT * FROM connection_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)',
      [senderId, receiverId]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Connection request already exists', status: existing.rows[0].status });
    const result = await pool.query(
      'INSERT INTO connection_requests (sender_id, receiver_id, message) VALUES ($1,$2,$3) RETURNING *',
      [senderId, receiverId, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Request error:', err);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

router.put('/request/:requestId', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;
  if (!['accepted','rejected'].includes(action))
    return res.status(400).json({ error: 'Action must be accepted or rejected' });
  try {
    const result = await pool.query(
      `UPDATE connection_requests SET status=$1, updated_at=NOW()
       WHERE id=$2 AND receiver_id=$3 AND status='pending' RETURNING *`,
      [action, requestId, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found or not authorized' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to update request' }); }
});

router.get('/incoming', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.id, cr.message, cr.created_at, cr.status,
              u.id as sender_id, u.name, u.age, u.gender, u.job_title, u.bio, u.location, u.profile_pic, u.looking_for
       FROM connection_requests cr
       JOIN users u ON u.id = cr.sender_id
       WHERE cr.receiver_id = $1 AND cr.status = 'pending'
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch incoming requests' }); }
});

router.get('/outgoing', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.id, cr.message, cr.created_at, cr.status,
              u.id as receiver_id, u.name, u.age, u.gender, u.job_title, u.location, u.profile_pic
       FROM connection_requests cr
       JOIN users u ON u.id = cr.receiver_id
       WHERE cr.sender_id = $1
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch outgoing requests' }); }
});

router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.id as connection_id, cr.updated_at as connected_at,
              u.id, u.name, u.age, u.gender, u.job_title, u.bio, u.location, u.profile_pic, u.looking_for
       FROM connection_requests cr
       JOIN users u ON u.id = CASE WHEN cr.sender_id = $1 THEN cr.receiver_id ELSE cr.sender_id END
       WHERE (cr.sender_id = $1 OR cr.receiver_id = $1) AND cr.status = 'accepted'
       ORDER BY cr.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch matches' }); }
});

router.delete('/request/:requestId', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM connection_requests WHERE id=$1 AND sender_id=$2 AND status='pending'",
      [req.params.requestId, req.user.id]
    );
    res.json({ message: 'Request cancelled' });
  } catch (err) { res.status(500).json({ error: 'Failed to cancel request' }); }
});

module.exports = router;
