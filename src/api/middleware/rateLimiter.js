import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const enhanceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many enhancement requests, please slow down.',
});

// ── Daily optimization limit ───────────────────────────────────────────────────
// 5 free optimizations per IP per calendar day (resets at midnight UTC).
// Uses in-memory storage — resets on server restart, which is acceptable.
const DAILY_LIMIT = 5;
const dailyUsage = new Map(); // ip → { date: 'YYYY-MM-DD', count: number }

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function dailyOptimizeLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const today = todayUTC();
  const entry = dailyUsage.get(ip);

  if (!entry || entry.date !== today) {
    // First request today — initialise counter
    dailyUsage.set(ip, { date: today, count: 1 });
    return next();
  }

  if (entry.count >= DAILY_LIMIT) {
    return res.status(429).json({
      error: 'daily_limit_reached',
      message: `You've used all ${DAILY_LIMIT} free optimizations for today. Come back tomorrow for more!`,
      resetsAt: today + 'T00:00:00Z', // next reset is tomorrow midnight UTC
      limit: DAILY_LIMIT,
      used: entry.count,
    });
  }

  entry.count += 1;
  next();
}