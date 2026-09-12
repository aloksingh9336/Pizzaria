require('express-async-errors');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const env = require('./config/env');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');
const setupCron = require('./config/cron');
const { errorHandler, notFound } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const pizzaRoutes = require('./routes/pizza');

async function start() {
  await connectDB();
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK', time: new Date() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/pizza-options', pizzaRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.clientUrl, methods: ['GET', 'POST', 'PATCH'] } });
  app.set('io', io);
  setupSockets(io);
  setupCron(io);

  server.listen(env.port, () => console.log(`Server listening on :${env.port}`));
  return { app, server, io };
}

if (require.main === module) {
  start().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = start;
