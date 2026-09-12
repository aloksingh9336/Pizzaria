const Razorpay = require('razorpay');
const env = require('./env');

let instance = null;
function getRazorpay() {
  if (env.razorpay.mock || !env.razorpay.keyId || !env.razorpay.keySecret) return null;
  if (!instance) {
    instance = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  }
  return instance;
}

module.exports = { getRazorpay };
