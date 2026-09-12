const crypto = require('crypto');
const env = require('../config/env');
const { sendMail } = require('../config/mailer');

function verificationEmailHtml(name, link) {
  return `<h2>Hi ${name}, verify your email</h2><p>Click below to verify:</p><a href="${link}">${link}</a>`;
}
function resetEmailHtml(name, link) {
  return `<h2>Hi ${name}, reset your password</h2><p>Click below (valid 1 hour):</p><a href="${link}">${link}</a>`;
}

async function sendVerificationEmail(user, token) {
  const link = `${env.clientUrl}/verify-email/${token}`;
  console.log(`[AUTH] Verification link for ${user.email}: ${link}`);
  await sendMail({
    to: user.email,
    subject: 'Verify your Pizzaria email',
    text: `Hi ${user.name}, verify here: ${link}`,
    html: verificationEmailHtml(user.name, link),
  });
}

async function sendResetEmail(user, token) {
  const link = `${env.clientUrl}/reset-password/${token}`;
  console.log(`[AUTH] Reset link for ${user.email}: ${link}`);
  await sendMail({
    to: user.email,
    subject: 'Reset your Pizzaria password',
    text: `Hi ${user.name}, reset here: ${link}`,
    html: resetEmailHtml(user.name, link),
  });
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { sendVerificationEmail, sendResetEmail, randomToken };
