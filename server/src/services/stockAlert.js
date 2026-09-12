const InventoryItem = require('../models/InventoryItem');
const env = require('../config/env');
const { sendMail } = require('../config/mailer');

async function checkLowStock(io) {
  const items = await InventoryItem.find({ $expr: { $lt: ['$stockQuantity', '$lowStockThreshold'] } });
  if (!items.length) {
    console.log('[CRON] Stock check: all OK');
    return { alerted: [] };
  }
  const now = new Date();
  const cooldownMs = env.stockAlertCooldownMin * 60 * 1000;
  const alerted = [];
  for (const item of items) {
    if (item.lastAlertedAt && now - new Date(item.lastAlertedAt) < cooldownMs) continue; // dedupe
    const text = `LOW STOCK: ${item.name} (${item.type}) — ${item.stockQuantity}${item.unit} left, threshold ${item.lowStockThreshold}.`;
    console.log('[CRON]', text);
    try {
      await sendMail({ to: env.adminAlertEmail, subject: `Low stock alert: ${item.name}`, text });
      alerted.push(item.name);
    } catch (e) {
      console.error('Failed to send stock alert', e.message);
    }
    item.lastAlertedAt = now;
    await item.save();
    if (io) io.to('admin').emit('stock:low', { name: item.name, type: item.type, stockQuantity: item.stockQuantity });
  }
  return { alerted };
}

module.exports = { checkLowStock };
