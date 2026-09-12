const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    base: String,
    sauce: String,
    cheese: String,
    vegetables: [String],
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
      default: 'Order Received',
    },
    statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
