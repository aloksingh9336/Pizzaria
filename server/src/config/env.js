require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pizzaria',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@pizzaria.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    mock: (process.env.RAZORPAY_MOCK || 'true') === 'true',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Pizzaria <no-reply@pizzaria.local>',
  },
  adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL || 'admin@pizzaria.local',
  stockCron: process.env.STOCK_CRON_SCHEDULE || '*/10 * * * *',
  stockAlertCooldownMin: Number(process.env.STOCK_ALERT_COOLDOWN_MIN || 60),
};
