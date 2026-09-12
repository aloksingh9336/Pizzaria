const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

// Dev-environment workaround: if the OS hands Node a loopback-only
// resolver (VPN / DNS-lock tools do this) with nothing listening on it,
// all lookups fail with ECONNREFUSED. Fall back to public DNS so
// mongodb+srv:// (Atlas) and other hostnames still resolve.
try {
  const servers = dns.getServers();
  if (servers.length && servers.every((s) => s === '127.0.0.1' || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('DNS resolver was loopback-only; using public DNS fallback (8.8.8.8, 1.1.1.1)');
  }
} catch (e) {
  console.log('DNS check skipped:', e.message);
}

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
