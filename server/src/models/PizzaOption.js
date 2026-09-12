const mongoose = require('mongoose');

const pizzaOptionSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['base', 'sauce', 'cheese', 'vegetable'], required: true },
    name: { type: String, required: true },
    priceModifier: { type: Number, required: true, default: 0 },
    linkedInventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    isVeg: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true }
);

pizzaOptionSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('PizzaOption', pizzaOptionSchema);
