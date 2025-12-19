import { ErrorResponse } from '../types/index.js';

export interface ValidationResult {
  isValid: boolean;
  error?: ErrorResponse;
}

export class InputValidator {
  private readonly minLength: number;
  private readonly maxLength: number;

  constructor(minLength: number = 1, maxLength: number = 1500) {
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  /**
   * Validates scenario input according to requirements
   * Requirements: 1.1, 1.2, 1.3
   */
  validate(scenario: string): ValidationResult {
    // Check for empty or whitespace-only input (Requirement 1.2)
    const trimmed = scenario.trim();
    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: {
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          message: 'Scenario cannot be empty',
        },
      };
    }

    // Check minimum length (Requirement 1.1)
    if (trimmed.length < this.minLength) {
      return {
        isValid: false,
        error: {
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          message: `Scenario must be at least ${this.minLength} character(s)`,
        },
      };
    }

    // Check maximum length (Requirement 1.3)
    if (trimmed.length > this.maxLength) {
      return {
        isValid: false,
        error: {
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          message: `Scenario must be ${this.maxLength} characters or less (currently: ${trimmed.length})`,
        },
      };
    }

    return { isValid: true };
  }

  /**
   * Returns the configured max length
   */
  getMaxLength(): number {
    return this.maxLength;
  }

  /**
   * Returns the configured min length
   */
  getMinLength(): number {
    return this.minLength;
  }
}
