import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { analyzeRouter } from './routes/analyze.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', analyzeRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Frame Audit AI backend running on port ${PORT}`);
  console.log(`LLM Provider: ${config.llm.provider}`);
  console.log(`Model: ${config.llm.model}`);
  console.log(`Temperature: ${config.llm.temperature}`);
  console.log(`Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
});

export default app;
