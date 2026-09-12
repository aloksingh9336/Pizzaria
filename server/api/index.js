require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('../src/config/db');
const env = require('../src/config/env');
const { errorHandler, notFound } = require('../src/middleware/auth');

const authRoutes = require('../src/routes/auth');
const adminRoutes = require('../src/routes/admin');
const orderRoutes = require('../src/routes/orders');
const pizzaRoutes = require('../src/routes/pizza');

let app = null;
let dbConnected = false;

function createApp() {
  const a = express();
  a.use(helmet());
  a.use(cors({ origin: '*', credentials: true }));
  a.use(express.json());
  a.get('/api/health', (req, res) => res.json({ success: true, message: 'OK', time: new Date() }));
  a.use('/api/auth', authRoutes);
  a.use('/api/admin', adminRoutes);
  a.use('/api/orders', orderRoutes);
  a.use('/api/pizza-options', pizzaRoutes);
  // also handle without /api prefix for Vercel rewrites
  a.get('/health', (req, res) => res.json({ success: true, message: 'OK', time: new Date() }));
  a.use(notFound);
  a.use(errorHandler);
  return a;
}

module.exports = async (req, res) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log('MongoDB connected (serverless)');
  }
  if (!app) app = createApp();
  return app(req, res);
};
