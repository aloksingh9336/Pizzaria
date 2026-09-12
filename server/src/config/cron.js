const cron = require('node-cron');
const env = require('../config/env');
const { checkLowStock } = require('../services/stockAlert');

function setupCron(io) {
  const schedule = env.stockCron || '*/10 * * * *';
  console.log(`[CRON] Scheduling stock check: ${schedule}`);
  cron.schedule(schedule, async () => {
    try {
      await checkLowStock(io);
    } catch (e) {
      console.error('[CRON] stock check failed', e.message);
    }
  });
}

module.exports = setupCron;
