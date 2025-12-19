import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AnalysisController } from '../packages/backend/src/controllers/analysisController.js';
import { RateLimiter } from '../packages/backend/src/services/rateLimiter.js';
import { config } from '../packages/backend/src/config/index.js';

const controller = new AnalysisController(config);
const rateLimiter = new RateLimiter(config.rateLimit.windowMs, config.rateLimit.maxRequests);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET' && req.url === '/api/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Analysis endpoint
  if (req.method === 'POST' && (req.url === '/api/analyze' || req.url === '/api')) {
    try {
      // Rate limiting
      const identifier = req.headers['x-forwarded-for'] as string || 'unknown';
      const allowed = await rateLimiter.checkLimit(identifier);
      
      if (!allowed) {
        const resetTime = rateLimiter.getTimeUntilReset(identifier);
        return res.status(429).json({
          error: 'Too Many Requests',
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000 / 60)} minutes.`,
        });
      }

      await rateLimiter.recordRequest(identifier);
      
      // Call the controller
      await controller.analyze(req as any, res as any);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        code: 'PROCESSING_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  } else {
    return res.status(404).json({ error: 'Not Found' });
  }
}
