const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate, schemas } = require('../middleware/validators');
const { adminLogin } = require('../controllers/adminAuthController');
const { listInventory, patchInventory, listOrders, patchOrderStatus } = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

router.post('/auth/login', limiter, validate(schemas.login), adminLogin);
router.get('/inventory', authAdmin, listInventory);
router.patch('/inventory/:id', authAdmin, validate(schemas.inventoryPatch), patchInventory);
router.get('/orders', authAdmin, listOrders);
router.patch('/orders/:id/status', authAdmin, validate(schemas.orderStatusPatch), patchOrderStatus);

module.exports = router;
