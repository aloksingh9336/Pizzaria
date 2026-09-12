const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate, schemas } = require('../middleware/validators');
const c = require('../controllers/authController');
const { authUser } = require('../middleware/auth');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

router.post('/register', authLimiter, validate(schemas.register), c.register);
router.get('/verify-email/:token', c.verifyEmail);
router.post('/login', authLimiter, validate(schemas.login), c.login);
router.post('/forgot-password', authLimiter, validate(schemas.forgot), c.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(schemas.reset), c.resetPassword);
router.get('/me', authUser, c.me);

module.exports = router;
