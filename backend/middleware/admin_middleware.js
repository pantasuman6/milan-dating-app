require('dotenv').config();

const adminMiddleware = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ error: 'Admin not configured on server' });
  }

  if (!req.user || req.user.email !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

module.exports = adminMiddleware;
