const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((d) => d.message),
    });
  }
  req[source] = value;
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(60).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).max(100).required(),
  }),
  login: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required(),
  }),
  forgot: Joi.object({ email: Joi.string().email({ tlds: { allow: false } }).required() }),
  reset: Joi.object({ password: Joi.string().min(6).max(100).required() }),
  createOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          base: Joi.string().required(),
          sauce: Joi.string().required(),
          cheese: Joi.string().required(),
          vegetables: Joi.array().items(Joi.string()).default([]),
          price: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number().min(0).required(),
  }),
  verifyPayment: Joi.object({
    razorpay_payment_id: Joi.string().required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_signature: Joi.string().allow('', null),
    simulateSuccess: Joi.boolean().optional(),
  }),
  inventoryPatch: Joi.object({
    stockQuantity: Joi.number().min(0).optional(),
    lowStockThreshold: Joi.number().min(0).optional(),
    name: Joi.string().optional(),
  }).min(1),
  orderStatusPatch: Joi.object({
    status: Joi.string().valid('Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered').required(),
  }),
};

module.exports = { validate, schemas };
