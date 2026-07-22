const nodemailer = require('nodemailer');

const { EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL } = process.env;
const adminEmail = ADMIN_EMAIL || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
} else {
  console.warn('[MAILER] EMAIL_USER / EMAIL_PASS not set in .env — email notifications are disabled.');
}

// Verify SMTP login once at server startup so config issues show up immediately in logs.
function verifyMailer() {
  if (!transporter) return;
  transporter.verify((err) => {
    if (err) console.error('[MAILER] Gmail app-password login FAILED:', err.message);
    else console.log('[MAILER] Gmail app-password login OK — email notifications active.');
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Fire-and-forget send: never throws, never blocks the caller, always logs success/failure.
// Retries a couple of times on transient failures (e.g. Gmail briefly rate-limiting a burst
// of test orders sent back-to-back) before giving up and logging clearly.
async function sendMail(subject, html, to, attempt = 1) {
  if (!transporter) {
    console.warn(`[MAILER] Skipped "${subject}" — mailer not configured.`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"O'SIPP Delivery" <${EMAIL_USER}>`,
      to: to || adminEmail,
      subject,
      html
    });
    console.log(`[MAILER] Sent: "${subject}" -> ${to || adminEmail}`);
  } catch (err) {
    console.error(`[MAILER] Attempt ${attempt} FAILED to send "${subject}":`, err.message);
    if (attempt < 3) {
      await sleep(attempt * 1500);
      return sendMail(subject, html, to, attempt + 1);
    }
    console.error(`[MAILER] GAVE UP after ${attempt} attempts — "${subject}" was NOT delivered.`);
  }
}

module.exports = { sendMail, verifyMailer };
