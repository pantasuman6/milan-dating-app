const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name          VARCHAR(100) NOT NULL,
        age           INTEGER NOT NULL CHECK (age >= 18 AND age <= 80),
        gender        VARCHAR(20) NOT NULL,
        job_title     VARCHAR(150),
        bio           TEXT,
        location      VARCHAR(150),
        profile_pic   VARCHAR(500),
        looking_for   TEXT,
        match_gender_pref VARCHAR(20) DEFAULT 'any',
        is_active     BOOLEAN DEFAULT true,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS connection_requests (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
        message     TEXT,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE(sender_id, receiver_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        is_read     BOOLEAN DEFAULT false,
        created_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_connection_sender   ON connection_requests(sender_id);
      CREATE INDEX IF NOT EXISTS idx_connection_receiver ON connection_requests(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender     ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver   ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_users_location      ON users(location);
    `);
    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
