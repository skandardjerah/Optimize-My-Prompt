import jwt from 'jsonwebtoken';

/**
 * requireAuth — verifies Bearer JWT token.
 * Attaches decoded payload as req.user = { id, email }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
  }
}
