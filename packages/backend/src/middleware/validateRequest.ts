import { Request, Response, NextFunction } from 'express';
import { InputValidator } from '../validation/inputValidator.js';

/**
 * Middleware to validate incoming requests
 * Requirements: 1.2, 1.3
 */
export function createValidationMiddleware(validator: InputValidator) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { scenario } = req.body;

    // Check if scenario field exists
    if (!scenario || typeof scenario !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        message: 'Request must include a "scenario" field with string value',
      });
    }

    // Validate scenario
    const result = validator.validate(scenario);
    if (!result.isValid && result.error) {
      return res.status(400).json(result.error);
    }

    // Validation passed, continue to next middleware
    next();
  };
}
