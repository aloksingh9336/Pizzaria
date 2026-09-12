const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['base', 'sauce', 'cheese', 'vegetable'], required: true },
    name: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    unit: { type: String, default: 'pcs' },
    lastAlertedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', inventorySchema);
