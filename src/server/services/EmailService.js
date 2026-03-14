import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.FROM_EMAIL || 'OptimizeMyPrompt <no-reply@optimizemyprompt.com>';
const BASE_URL = process.env.ALLOWED_ORIGIN?.split(',')[0].trim() || 'http://localhost:3000';

export const EmailService = {
  async sendVerification(email, token) {
    const link = `${BASE_URL}/api/auth/verify-email?token=${token}`;
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Verify your OptimizeMyPrompt account',
      text: `Click the link below to verify your email address (valid for 2 hours):\n\n${link}\n\nIf you did not create an account, you can ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#7c6df7">OptimizeMyPrompt</h2>
          <p>Click the button below to verify your email address.<br>The link is valid for <strong>2 hours</strong>.</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#7c6df7;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify my email</a>
          <p style="color:#888;font-size:12px;margin-top:24px">If you did not create an account, you can safely ignore this email.</p>
        </div>`,
    });
  },

  async sendPasswordReset(email, token) {
    const link = `${BASE_URL}/?reset_token=${token}`;
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Reset your OptimizeMyPrompt password',
      text: `Click the link below to reset your password (valid for 2 hours):\n\n${link}\n\nIf you did not request a password reset, you can ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#7c6df7">OptimizeMyPrompt</h2>
          <p>Click the button below to reset your password.<br>The link is valid for <strong>2 hours</strong>.</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#7c6df7;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset my password</a>
          <p style="color:#888;font-size:12px;margin-top:24px">If you did not request this, you can safely ignore this email.</p>
        </div>`,
    });
  },
};
