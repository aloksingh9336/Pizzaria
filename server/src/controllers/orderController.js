const crypto = require('crypto');
const Order = require('../models/Order');
const env = require('../config/env');
const { getRazorpay } = require('../config/razorpay');
const { decrementForOrder } = require('../services/inventoryService');

function getIO(req) { return req.app.get('io'); }

async function createOrder(req, res) {
  const { items, totalAmount } = req.body;
  const order = await Order.create({
    user: req.user.id,
    items,
    totalAmount,
    paymentStatus: 'pending',
    status: 'Order Received',
    statusHistory: [{ status: 'Order Received', timestamp: new Date() }],
  });
  res.status(201).json({ success: true, order });
}

async function createPayment(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

  const rzp = getRazorpay();
  if (rzp) {
    const rOrder = await rzp.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString(),
    });
    order.razorpayOrderId = rOrder.id;
    await order.save();
    return res.json({ success: true, razorpayOrderId: rOrder.id, amount: order.totalAmount * 100, keyId: env.razorpay.keyId, mock: false });
  }
  // Mock mode
  const mockId = `order_mock_${order._id}`;
  order.razorpayOrderId = mockId;
  await order.save();
  res.json({ success: true, razorpayOrderId: mockId, amount: order.totalAmount * 100, keyId: env.razorpay.keyId || 'rzp_test_mock', mock: true });
}

async function verifyPayment(req, res) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, simulateSuccess } = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const rzp = getRazorpay();
  let valid = false;
  if (rzp && !simulateSuccess && razorpay_signature) {
    const expected = crypto.createHmac('sha256', env.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    valid = expected === razorpay_signature;
  } else {
    // Mock/test mode: simulate success
    valid = simulateSuccess !== false;
  }
  if (!valid) {
    order.paymentStatus = 'failed';
    await order.save();
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.status = 'Order Received';
  order.statusHistory.push({ status: 'Order Received', timestamp: new Date() });
  await order.save();
  await decrementForOrder(order);

  const io = getIO(req);
  if (io) {
    io.to('admin').emit('order:created', { orderId: order._id, totalAmount: order.totalAmount });
    io.to(`user:${order.user}`).emit('order:status', { orderId: order._id, status: order.status, paymentStatus: 'paid' });
  }
  res.json({ success: true, order });
}

async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

async function orderDetail(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
}

module.exports = { createOrder, createPayment, verifyPayment, myOrders, orderDetail };
