import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from './Database.js';

export const UserStore = {
  async create(email, password) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) throw new Error('An account with this email already exists.');

    const id = randomUUID();
    const password_hash = await bcrypt.hash(password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
    ).run(id, email.toLowerCase(), password_hash);

    return { id, email: email.toLowerCase(), emailVerified: false };
  },

  async verify(email, password) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) throw new Error('Invalid email or password.');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid email or password.');

    if (!user.email_verified) {
      const err = new Error('Please verify your email before signing in.');
      err.code = 'EMAIL_NOT_VERIFIED';
      err.userId = user.id;
      throw err;
    }

    return { id: user.id, email: user.email, emailVerified: true };
  },

  getById(id) {
    const user = db.prepare('SELECT id, email, email_verified FROM users WHERE id = ?').get(id);
    if (!user) return null;
    return { id: user.id, email: user.email, emailVerified: !!user.email_verified };
  },

  markVerified(userId) {
    db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(userId);
  },

  async resetPassword(userId, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  },

  createToken(userId, type) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h
    db.prepare(
      'INSERT INTO email_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)'
    ).run(token, userId, type, expiresAt);
    return token;
  },

  consumeToken(token, type) {
    const row = db.prepare(
      'SELECT * FROM email_tokens WHERE token = ? AND type = ? AND used = 0'
    ).get(token, type);

    if (!row) throw new Error('Invalid or already-used link.');
    if (new Date(row.expires_at) < new Date()) throw new Error('This link has expired. Please request a new one.');

    db.prepare('UPDATE email_tokens SET used = 1 WHERE token = ?').run(token);
    return row.user_id;
  },

  getByEmail(email) {
    const user = db.prepare('SELECT id, email, email_verified FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return null;
    return { id: user.id, email: user.email, emailVerified: !!user.email_verified };
  },
};
