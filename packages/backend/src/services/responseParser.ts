import { AnalysisResult, FramingVerdict, LeverType } from '../types/index.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ResponseParser validates and parses LLM responses
 * Requirements: 2.6-2.8, 3.6-3.8, 4.1, 5.2, 5.6, 6.1-6.2, 7.6-7.7, 10.4
 */
export class ResponseParser {
  private readonly validFramingVerdicts: FramingVerdict[] = [
    'WELL_FRAMED',
    'PARTIALLY_FLAWED',
    'FUNDAMENTALLY_FLAWED',
    'FALSE_DILEMMA',
  ];

  private readonly validLeverTypes: LeverType[] = [
    'STRUCTURAL',
    'INCENTIVE',
    'INFORMATION',
    'GOVERNANCE',
  ];

  private readonly prescriptivePhrases = [
    'you should',
    'you must',
    'you need to',
    'you ought to',
    'you have to',
  ];

  /**
   * Validates an analysis result
   * Returns validation result with any errors found
   */
  validate(analysis: AnalysisResult): ValidationResult {
    const errors: string[] = [];

    // Check if this is a refusal response
    if (analysis.refusalReason) {
      return this.validateRefusal(analysis);
    }

    // For analyzable prompts, validate all sections
    if (!analysis.frameAudit) {
      errors.push('Missing required frameAudit section');
    } else {
      errors.push(...this.validateFrameAudit(analysis.frameAudit));
    }

    if (!analysis.systemMap) {
      errors.push('Missing required systemMap section');
    } else {
      errors.push(...this.validateSystemMap(analysis.systemMap));
    }

    if (!analysis.realityCompression) {
      errors.push('Missing required realityCompression section');
    } else {
      errors.push(...this.validateRealityCompression(analysis.realityCompression));
    }

    // Levers are optional, but if present, validate them
    if (analysis.levers) {
      errors.push(...this.validateLevers(analysis.levers));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates refusal responses
   * Requirement: 7.6, 7.7
   */
  private validateRefusal(analysis: AnalysisResult): ValidationResult {
    const errors: string[] = [];

    if (!analysis.refusalReason) {
      errors.push('Refusal response missing refusalReason');
    }

    if (!analysis.reframedQuestion) {
      errors.push('Refusal response missing reframedQuestion');
    }

    // Refusal responses should NOT have analysis sections
    if (analysis.frameAudit) {
      errors.push('Refusal response should not include frameAudit section');
    }

    if (analysis.systemMap) {
      errors.push('Refusal response should not include systemMap section');
    }

    if (analysis.realityCompression) {
      errors.push('Refusal response should not include realityCompression section');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates Frame Audit section
   * Requirements: 2.6, 2.7, 2.8
   */
  private validateFrameAudit(frameAudit: any): string[] {
    const errors: string[] = [];

    // Validate framingVerdict (Requirement 2.6)
    if (!this.validFramingVerdicts.includes(frameAudit.framingVerdict)) {
      errors.push(
        `Invalid framingVerdict: ${frameAudit.framingVerdict}. Must be one of: ${this.validFramingVerdicts.join(', ')}`
      );
    }

    // Validate confidenceScore (Requirement 2.7)
    if (
      typeof frameAudit.confidenceScore !== 'number' ||
      frameAudit.confidenceScore < 0 ||
      frameAudit.confidenceScore > 1
    ) {
      errors.push('confidenceScore must be a number between 0 and 1');
    }

    // Validate whyThisFramingPersists (Requirement 2.8)
    if (!frameAudit.whyThisFramingPersists || typeof frameAudit.whyThisFramingPersists !== 'string') {
      errors.push('whyThisFramingPersists is required and must be a string');
    }

    return errors;
  }

  /**
   * Validates System Map section
   * Requirements: 3.6, 3.7, 3.8
   */
  private validateSystemMap(systemMap: any): string[] {
    const errors: string[] = [];

    // Validate mandatory power asymmetry fields (Requirements 3.6, 3.7, 3.8)
    if (!systemMap.primaryControlHolder || typeof systemMap.primaryControlHolder !== 'string') {
      errors.push('primaryControlHolder is required and must be a string');
    }

    if (!systemMap.primaryCostBearer || typeof systemMap.primaryCostBearer !== 'string') {
      errors.push('primaryCostBearer is required and must be a string');
    }

    if (!systemMap.misalignmentDescription || typeof systemMap.misalignmentDescription !== 'string') {
      errors.push('misalignmentDescription is required and must be a string');
    }

    return errors;
  }

  /**
   * Validates Reality Compression section
   * Requirement: 4.1
   */
  private validateRealityCompression(realityCompression: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(realityCompression.coreTruths)) {
      errors.push('coreTruths must be an array');
      return errors;
    }

    const count = realityCompression.coreTruths.length;
    if (count < 3 || count > 5) {
      errors.push(`coreTruths must contain 3-5 items, found ${count}`);
    }

    return errors;
  }

  /**
   * Validates Levers section
   * Requirements: 5.2, 5.6
   */
  private validateLevers(levers: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(levers.changePoints)) {
      errors.push('levers.changePoints must be an array');
      return errors;
    }

    levers.changePoints.forEach((lever: any, index: number) => {
      // Validate leverType (Requirement 5.6)
      if (!this.validLeverTypes.includes(lever.leverType)) {
        errors.push(
          `Lever ${index}: Invalid leverType: ${lever.leverType}. Must be one of: ${this.validLeverTypes.join(', ')}`
        );
      }

      // Check for prescriptive language (Requirement 5.2)
      if (lever.description) {
        const lowerDesc = lever.description.toLowerCase();
        const foundPhrases = this.prescriptivePhrases.filter((phrase) => lowerDesc.includes(phrase));
        if (foundPhrases.length > 0) {
          errors.push(
            `Lever ${index}: Contains prescriptive language: ${foundPhrases.join(', ')}`
          );
        }
      }
    });

    return errors;
  }

  /**
   * Checks if the response contains image data or diagram markup
   * Requirement: 6.5
   */
  hasImageOrDiagramContent(systemMap: any): boolean {
    const content = JSON.stringify(systemMap);
    
    // Check for common image/diagram indicators
    const indicators = [
      'data:image',
      '<svg',
      '<img',
      'base64',
      '![',  // Markdown image
      'mermaid',
      'graphviz',
    ];

    return indicators.some((indicator) => content.includes(indicator));
  }
}
