import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '../services/rateLimiter.js';

/**
 * Middleware to enforce rate limiting
 * Requirements: 11.2, 11.3
 */
export function createRateLimitMiddleware(rateLimiter: RateLimiter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';

    // Check if request is within rate limit
    const allowed = await rateLimiter.checkLimit(identifier);

    if (!allowed) {
      // Calculate retry-after time
      const retryAfterMs = rateLimiter.getTimeUntilReset(identifier);
      const retryAfterMinutes = Math.ceil(retryAfterMs / 1000 / 60);

      // Set Retry-After header (in seconds)
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));

      // Return 429 Too Many Requests
      return res.status(429).json({
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_ERROR',
        message: `Rate limit exceeded. Please try again in ${retryAfterMinutes} minute(s).`,
      });
    }

    // Record this request
    await rateLimiter.recordRequest(identifier);

    // Continue to next middleware
    next();
  };
}
