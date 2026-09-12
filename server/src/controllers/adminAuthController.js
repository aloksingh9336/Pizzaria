const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const env = require('../config/env');

async function adminLogin(req, res) {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await admin.comparePassword(password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
}

module.exports = { adminLogin };
