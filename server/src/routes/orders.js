const express = require('express');
const { validate, schemas } = require('../middleware/validators');
const { authUser } = require('../middleware/auth');
const o = require('../controllers/orderController');

const router = express.Router();

router.post('/', authUser, validate(schemas.createOrder), o.createOrder);
router.post('/:id/create-payment', authUser, o.createPayment);
router.post('/:id/verify-payment', authUser, validate(schemas.verifyPayment), o.verifyPayment);
router.get('/my', authUser, o.myOrders);
router.get('/:id', authUser, o.orderDetail);

module.exports = router;
