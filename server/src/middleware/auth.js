const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.role && decoded.role !== 'user') {
      return res.status(403).json({ success: false, message: 'User token required' });
    }
    req.user = { id: decoded.id, role: 'user' };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin token required' });
    }
    req.admin = { id: decoded.id, role: 'admin' };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

module.exports = { authUser, authAdmin, errorHandler, notFound };
