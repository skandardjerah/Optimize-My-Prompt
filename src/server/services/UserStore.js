import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

/**
 * UserStore — in-memory user accounts.
 * Resets on server restart. Replace with a persistent DB for production persistence.
 */
const users = new Map(); // email → { id, email, passwordHash, createdAt }

export const UserStore = {
  async create(email, password) {
    const key = email.toLowerCase();
    if (users.has(key)) throw new Error('Email already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      email: key,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.set(key, user);
    return { id: user.id, email: user.email };
  },

  async verify(email, password) {
    const user = users.get(email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');
    return { id: user.id, email: user.email };
  },

  getById(id) {
    for (const u of users.values()) {
      if (u.id === id) return { id: u.id, email: u.email };
    }
    return null;
  },
};
