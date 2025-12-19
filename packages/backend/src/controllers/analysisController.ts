import { Request, Response } from 'express';
import { SystemConfig } from '../types/index.js';
import { InputValidator } from '../validation/inputValidator.js';
import { LLMService } from '../services/llmService.js';
import { ResponseParser } from '../services/responseParser.js';

/**
 * AnalysisController orchestrates the analysis workflow
 * Requirements: 10.2, 10.4
 */
export class AnalysisController {
  private validator: InputValidator;
  private llmService: LLMService;
  private responseParser: ResponseParser;

  constructor(config: SystemConfig) {
    this.validator = new InputValidator(config.input.minLength, config.input.maxLength);
    this.llmService = new LLMService(
      config.llm.apiKey,
      config.llm.model,
      config.llm.temperature,
      config.llm.maxTokens
    );
    this.responseParser = new ResponseParser();
  }

  /**
   * Handles POST /api/analyze requests
   * Requirements: 10.2, 10.4
   */
  async analyze(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { scenario } = req.body;

      // Validate input
      const validationResult = this.validator.validate(scenario);
      if (!validationResult.isValid && validationResult.error) {
        res.status(400).json(validationResult.error);
        return;
      }

      // Store input for processing (Requirement 1.4)
      const identifier = this.getIdentifier(req);
      console.log(`Processing scenario from ${identifier}`);

      // Call LLM for analysis
      const analysis = await this.llmService.analyze(scenario);

      // Validate response structure
      const parseResult = this.responseParser.validate(analysis);
      if (!parseResult.isValid) {
        console.error('LLM response validation failed:', parseResult.errors);
        res.status(500).json({
          error: 'Processing Error',
          code: 'PROCESSING_ERROR',
          message: 'Analysis could not be completed. Please try again.',
        });
        return;
      }

      // Check for image/diagram content in system map
      if (analysis.systemMap && this.responseParser.hasImageOrDiagramContent(analysis.systemMap)) {
        console.warn('System map contains image or diagram content');
      }

      // Return successful analysis
      const processingTime = Date.now() - startTime;
      res.json({
        ...analysis,
        metadata: {
          ...analysis.metadata,
          processingTime,
        },
      });
    } catch (error) {
      console.error('Error in analysis:', error);
      
      // Determine appropriate error response
      if (error instanceof Error && error.message.includes('LLM')) {
        res.status(503).json({
          error: 'Service Unavailable',
          code: 'PROCESSING_ERROR',
          message: 'Analysis service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          code: 'PROCESSING_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  }

  /**
   * Gets identifier for rate limiting (IP address or session)
   */
  private getIdentifier(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
