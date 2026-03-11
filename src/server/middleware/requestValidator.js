/**
 * Request validation middleware for the /api/classify endpoint.
 * Validates prompt field: required, string, 1–10000 chars.
 * intentHint: optional, must be one of CODE | NL | NATURAL_LANGUAGE | HYBRID if provided.
 */
const VALID_HINTS = new Set(['CODE', 'NL', 'NATURAL_LANGUAGE', 'HYBRID']);

export function validateClassifyRequest(req, res, next) {
  const { prompt, intentHint } = req.body;

  if (prompt === undefined || prompt === null) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt must be a string' });
  }
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'prompt must not be empty' });
  }
  if (trimmed.length > 10000) {
    return res.status(400).json({ error: 'prompt exceeds maximum length of 10000 characters' });
  }
  if (intentHint !== undefined && intentHint !== null && !VALID_HINTS.has(intentHint)) {
    return res.status(400).json({
      error: `intentHint must be one of: ${[...VALID_HINTS].join(', ')}`,
    });
  }

  req.body.prompt = trimmed;
  next();
}
