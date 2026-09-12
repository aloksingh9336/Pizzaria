const express = require('express');
const { getPizzaOptions } = require('../controllers/pizzaController');

const router = express.Router();
router.get('/', getPizzaOptions);

module.exports = router;
