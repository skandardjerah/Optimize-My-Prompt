/**
 * Global error handling middleware.
 * Must be registered last with app.use() in server.js.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Don't leak stack traces in production
  const body = { error: message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}
