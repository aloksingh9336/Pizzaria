const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');

async function listInventory(req, res) {
  const items = await InventoryItem.find().sort({ type: 1, name: 1 });
  res.json({ success: true, items });
}

async function patchInventory(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const { stockQuantity, lowStockThreshold, name } = req.body;
  if (stockQuantity !== undefined) item.stockQuantity = stockQuantity;
  if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
  if (name !== undefined) item.name = name;
  await item.save();
  if (req.app.get('io')) req.app.get('io').to('admin').emit('stock:updated', { item });
  res.json({ success: true, item });
}

async function listOrders(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

async function patchOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, timestamp: new Date() });
  await order.save();
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${order.user}`).emit('order:status', { orderId: order._id, status: order.status });
    io.to('admin').emit('order:status', { orderId: order._id, status: order.status });
  }
  res.json({ success: true, order });
}

module.exports = { listInventory, patchInventory, listOrders, patchOrderStatus };
