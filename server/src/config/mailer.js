const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  } else {
    // Stream transport: no real SMTP needed, logs to console
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const info = await t.sendMail({ from: env.smtp.from, to, subject, html, text });
  // Always log so demo works without SMTP
  console.log('--- EMAIL ---');
  console.log(`To: ${to}\nSubject: ${subject}`);
  if (text) console.log(text);
  if (info && info.message) console.log(info.message.toString().slice(0, 2000));
  console.log('--- END EMAIL ---');
  return info;
}

module.exports = { sendMail };
