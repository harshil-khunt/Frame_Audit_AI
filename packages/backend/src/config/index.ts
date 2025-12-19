import { config as dotenvConfig } from 'dotenv';
import { SystemConfig } from '../types/index.js';

// Load environment variables
dotenvConfig();

export const config: SystemConfig = {
  llm: {
    provider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '8000', 10),
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  },
  input: {
    maxLength: parseInt(process.env.INPUT_MAX_LENGTH || '1500', 10),
    minLength: parseInt(process.env.INPUT_MIN_LENGTH || '1', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },
};

// Validate required configuration
if (!config.llm.apiKey) {
  console.warn('Warning: GEMINI_API_KEY not set. LLM calls will fail.');
} else {
  console.log('Using API key:', config.llm.apiKey.substring(0, 10) + '...');
}
