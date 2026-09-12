const InventoryItem = require('../models/InventoryItem');

// Decrement 1 unit per ingredient referenced in order items.
// Matches by name (case-insensitive).
async function decrementForOrder(order) {
  const counts = {};
  for (const item of order.items) {
    const names = [item.base, item.sauce, item.cheese, ...(item.vegetables || [])];
    for (const n of names) {
      if (!n) continue;
      const key = n.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  for (const [nameLower, qty] of Object.entries(counts)) {
    const inv = await InventoryItem.findOne({ name: new RegExp(`^${nameLower}$`, 'i') });
    if (inv) {
      inv.stockQuantity = Math.max(0, inv.stockQuantity - qty);
      await inv.save();
    }
  }
}

module.exports = { decrementForOrder };
