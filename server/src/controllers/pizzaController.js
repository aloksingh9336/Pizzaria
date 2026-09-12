const PizzaOption = require('../models/PizzaOption');
const InventoryItem = require('../models/InventoryItem');

async function getPizzaOptions(req, res) {
  const options = await PizzaOption.find().populate('linkedInventoryItemId');
  const invByName = {};
  const invs = await InventoryItem.find();
  invs.forEach((i) => { invByName[i.name.toLowerCase()] = i; });

  const grouped = { base: [], sauce: [], cheese: [], vegetable: [] };
  for (const o of options) {
    const linked = o.linkedInventoryItemId;
    let stock = null;
    let available = true;
    if (linked && typeof linked === 'object' && linked.stockQuantity !== undefined) {
      stock = linked.stockQuantity;
      available = linked.stockQuantity > 0;
    } else {
      const inv = invByName[o.name.toLowerCase()];
      if (inv) { stock = inv.stockQuantity; available = inv.stockQuantity > 0; }
    }
    grouped[o.category].push({
      _id: o._id, name: o.name, priceModifier: o.priceModifier,
      available, stock, description: o.description,
    });
  }
  res.json({ success: true, options: grouped });
}

module.exports = { getPizzaOptions };
