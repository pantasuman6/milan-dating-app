const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/:receiverId', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });
  try {
    const match = await pool.query(
      `SELECT id FROM connection_requests
       WHERE ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)) AND status='accepted'`,
      [senderId, receiverId]
    );
    if (match.rows.length === 0) return res.status(403).json({ error: 'You must be connected to message' });
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1,$2,$3) RETURNING *',
      [senderId, receiverId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to send message' }); }
});

router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND is_read=false',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch unread count' }); }
});

router.get('/:userId', authMiddleware, async (req, res) => {
  const myId = req.user.id;
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as sender_name, u.profile_pic as sender_pic
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE (m.sender_id=$1 AND m.receiver_id=$2) OR (m.sender_id=$2 AND m.receiver_id=$1)
       ORDER BY m.created_at ASC`,
      [myId, userId]
    );
    await pool.query(
      'UPDATE messages SET is_read=true WHERE receiver_id=$1 AND sender_id=$2 AND is_read=false',
      [myId, userId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

module.exports = router;
