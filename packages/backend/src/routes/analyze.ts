import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController.js';
import { RateLimiter } from '../services/rateLimiter.js';
import { createRateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';
import { config } from '../config/index.js';

export const analyzeRouter = Router();

const controller = new AnalysisController(config);
const rateLimiter = new RateLimiter(config.rateLimit.windowMs, config.rateLimit.maxRequests);
const rateLimitMiddleware = createRateLimitMiddleware(rateLimiter);

/**
 * POST /api/analyze
 * Analyzes the framing of a scenario
 * Requirements: 10.1, 10.2, 11.1, 11.2
 */
analyzeRouter.post('/analyze', rateLimitMiddleware, async (req, res) => {
  try {
    await controller.analyze(req, res);
  } catch (error) {
    console.error('Unhandled error in /analyze:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'PROCESSING_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
});
