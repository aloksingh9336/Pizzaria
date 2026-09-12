const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { sendResetEmail, randomToken } = require('../services/emailService');

function signUser(user) {
  return jwt.sign({ id: user._id, role: 'user' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    isEmailVerified: true,
  });
  res.status(201).json({
    success: true,
    message: 'Registered. You can now log in.',
  });
}

async function verifyEmail(req, res) {
  const { token } = req.params;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified. You can now log in.' });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = signUser(user);
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  // Always respond success to avoid enumeration
  if (user) {
    const token = randomToken();
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 3600 * 1000);
    await user.save();
    await sendResetEmail(user, token);
    return res.json({ success: true, message: 'Reset link sent (check server console in dev).', resetToken: token });
  }
  res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
}

async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset. You can now log in.' });
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, user });
}

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword, me };
