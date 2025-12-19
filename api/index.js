export default async function handler(req, res) {
  try {
    console.log('API called:', req.method, req.url);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Health check
    if (req.method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Analysis endpoint
    if (req.method === 'POST') {
      console.log('Loading modules...');
      
      const { AnalysisController } = await import('../packages/backend/src/controllers/analysisController.js');
      const { RateLimiter } = await import('../packages/backend/src/services/rateLimiter.js');
      const { config } = await import('../packages/backend/src/config/index.js');
      
      console.log('Modules loaded, config:', { 
        hasApiKey: !!config.llm.apiKey,
        model: config.llm.model 
      });

      const controller = new AnalysisController(config);
      const rateLimiter = new RateLimiter(config.rateLimit.windowMs, config.rateLimit.maxRequests);

      // Rate limiting
      const identifier = req.headers['x-forwarded-for'] || 'unknown';
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
      
      console.log('Calling controller...');
      await controller.analyze(req, res);
    } else {
      return res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      code: 'PROCESSING_ERROR',
      message: error?.message || 'An unexpected error occurred.',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
