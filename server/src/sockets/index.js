const jwt = require('jsonwebtoken');
const env = require('../config/env');

function setupSockets(io) {
  io.on('connection', (socket) => {
    // Client should emit 'join' with { token } or { adminToken }
    socket.on('join', (payload = {}) => {
      try {
        const token = payload.token || payload.adminToken;
        if (!token) return;
        const decoded = jwt.verify(token, env.jwtSecret);
        if (decoded.role === 'admin') {
          socket.join('admin');
          socket.emit('joined', { room: 'admin' });
        } else {
          socket.join(`user:${decoded.id}`);
          socket.emit('joined', { room: `user:${decoded.id}` });
        }
      } catch (e) {
        socket.emit('join:error', { message: 'Invalid token' });
      }
    });

    // Allow explicit room join by userId for simplicity in demos
    socket.on('join:user', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
    socket.on('join:admin', () => socket.join('admin'));
  });
}

module.exports = setupSockets;
