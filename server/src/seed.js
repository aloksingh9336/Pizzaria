require('dotenv').config();
const connectDB = require('./config/db');
const env = require('./config/env');
const Admin = require('./models/Admin');
const InventoryItem = require('./models/InventoryItem');
const PizzaOption = require('./models/PizzaOption');

const INVENTORY = [
  { type: 'base', name: 'Thin Crust', stockQuantity: 50, lowStockThreshold: 10, unit: 'pcs' },
  { type: 'base', name: 'Thick Crust', stockQuantity: 50, lowStockThreshold: 10, unit: 'pcs' },
  { type: 'base', name: 'Cheese Burst', stockQuantity: 20, lowStockThreshold: 8, unit: 'pcs' },
  { type: 'base', name: 'Whole Wheat', stockQuantity: 40, lowStockThreshold: 10, unit: 'pcs' },
  { type: 'base', name: 'Gluten-Free', stockQuantity: 25, lowStockThreshold: 8, unit: 'pcs' },
  { type: 'sauce', name: 'Tomato Basil', stockQuantity: 60, lowStockThreshold: 10, unit: 'cups' },
  { type: 'sauce', name: 'BBQ', stockQuantity: 40, lowStockThreshold: 10, unit: 'cups' },
  { type: 'sauce', name: 'Pesto', stockQuantity: 25, lowStockThreshold: 8, unit: 'cups' },
  { type: 'sauce', name: 'Alfredo', stockQuantity: 30, lowStockThreshold: 8, unit: 'cups' },
  { type: 'sauce', name: 'Peri Peri', stockQuantity: 30, lowStockThreshold: 8, unit: 'cups' },
  { type: 'cheese', name: 'Mozzarella', stockQuantity: 70, lowStockThreshold: 15, unit: 'cups' },
  { type: 'cheese', name: 'Cheddar', stockQuantity: 35, lowStockThreshold: 10, unit: 'cups' },
  { type: 'cheese', name: 'Vegan Cheese', stockQuantity: 15, lowStockThreshold: 8, unit: 'cups' },
  { type: 'vegetable', name: 'Capsicum', stockQuantity: 50, lowStockThreshold: 10, unit: 'cups' },
  { type: 'vegetable', name: 'Onion', stockQuantity: 60, lowStockThreshold: 10, unit: 'cups' },
  { type: 'vegetable', name: 'Mushroom', stockQuantity: 30, lowStockThreshold: 10, unit: 'cups' },
  { type: 'vegetable', name: 'Olives', stockQuantity: 25, lowStockThreshold: 8, unit: 'cups' },
  { type: 'vegetable', name: 'Jalapeno', stockQuantity: 20, lowStockThreshold: 8, unit: 'cups' },
];

const PRICES = {
  'Thin Crust': 100, 'Thick Crust': 120, 'Cheese Burst': 180, 'Whole Wheat': 110, 'Gluten-Free': 150,
  'Tomato Basil': 20, BBQ: 30, Pesto: 40, Alfredo: 35, 'Peri Peri': 35,
  Mozzarella: 50, Cheddar: 60, 'Vegan Cheese': 70,
  Capsicum: 25, Onion: 15, Mushroom: 35, Olives: 40, Jalapeno: 30,
};

async function seed() {
  await connectDB();
  console.log('Seeding inventory...');
  for (const item of INVENTORY) {
    await InventoryItem.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true });
  }
  const invs = await InventoryItem.find();
  const byName = Object.fromEntries(invs.map((i) => [i.name, i._id]));
  console.log('Seeding pizza options...');
  for (const [name, price] of Object.entries(PRICES)) {
    const inv = invs.find((i) => i.name === name);
    await PizzaOption.findOneAndUpdate(
      { name },
      { category: inv.type, name, priceModifier: price, linkedInventoryItemId: byName[name] },
      { upsert: true, new: true }
    );
  }
  // Admin
  const { email, password, name } = env.admin;
  let admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    admin = await Admin.create({ name, email: email.toLowerCase(), password });
    console.log(`Admin created: ${email} / ${password}`);
  } else {
    console.log(`Admin exists: ${email}`);
  }
  console.log('Seed done.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
