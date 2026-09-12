require('dotenv').config();
const connectDB = require('./config/db');
const env = require('./config/env');
const Admin = require('./models/Admin');

async function seedAdmin() {
  await connectDB();
  const { email, password, name } = env.admin;
  let admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    admin = await Admin.create({ name, email: email.toLowerCase(), password });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin exists: ${email}`);
  }
  process.exit(0);
}
seedAdmin().catch((e) => { console.error(e); process.exit(1); });
