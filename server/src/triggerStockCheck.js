require('dotenv').config();
const connectDB = require('./config/db');
const { checkLowStock } = require('./services/stockAlert');

async function main() {
  await connectDB();
  const result = await checkLowStock(null);
  console.log('Manual stock check done:', result);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
