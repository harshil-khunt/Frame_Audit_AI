// Input Model
export interface ScenarioInput {
  scenario: string; // 1-1500 characters
  timestamp: Date;
  identifier: string; // IP or session ID for rate limiting
}

// Framing Verdict Classification
export type FramingVerdict = 
  | 'WELL_FRAMED' 
  | 'PARTIALLY_FLAWED' 
  | 'FUNDAMENTALLY_FLAWED' 
  | 'FALSE_DILEMMA';

// Frame Audit Section
export interface FrameAuditSection {
  assumptions: string[];
  falseBinaries: string[];
  artificialConstraints: string[];
  beneficiaries: string;
  hiddenElements: string[];
  framingVerdict: FramingVerdict;
  confidenceScore: number; // 0-1, confidence that the framingVerdict classification is correct
  whyThisFramingPersists: string; // Explains political, incentive, institutional, or cognitive reasons
}

// System Map Section
export interface Actor {
  name: string;
  type: 'person' | 'system' | 'institution';
  role: string;
}

export interface Dependency {
  from: string;
  to: string;
  description: string;
}

export interface PowerAsymmetry {
  decisionMaker: string;
  costBearer: string;
  description: string;
}

export interface SystemMapSection {
  actors: Actor[];
  controlPoints: string[];
  dependencies: Dependency[];
  failureModes: string[];
  powerAsymmetries: PowerAsymmetry[];
  primaryControlHolder: string; // Who controls outcomes
  primaryCostBearer: string; // Who suffers consequences
  misalignmentDescription: string; // Explicit power analysis
}

// Reality Compression Section
export interface RealityCompressionSection {
  coreTruths: string[]; // 3-5 items
}

// Levers Section
export type LeverType = 'STRUCTURAL' | 'INCENTIVE' | 'INFORMATION' | 'GOVERNANCE';

export interface Lever {
  description: string;
  leverType: LeverType;
  focus: 'prevention' | 'redesign';
  impact: 'high' | 'medium' | 'low';
}

export interface LeversSection {
  changePoints: Lever[];
  // Note: Levers are descriptive system change points, not recommendations.
  // They indicate where intervention would have the highest systemic impact,
  // not what action a user should take.
}

// Complete Analysis Result
export interface AnalysisResult {
  refusalReason?: string; // Present if prompt is irredeemable
  reframedQuestion?: string; // Suggested reframe for refused prompts
  frameAudit?: FrameAuditSection; // Absent if prompt refused
  systemMap?: SystemMapSection; // Absent if prompt refused
  realityCompression?: RealityCompressionSection; // Absent if prompt refused
  levers?: LeversSection; // Optional even for valid analyses
  metadata: {
    analyzedAt: Date;
    processingTime: number; // milliseconds
  };
}

// Error Model
export type ErrorCode = 'VALIDATION_ERROR' | 'RATE_LIMIT_ERROR' | 'PROCESSING_ERROR';

export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  message: string;
}

// Configuration Model
export interface SystemConfig {
  llm: {
    provider: 'openai' | 'anthropic';
    model: string;
    temperature: number; // 0.2-0.4
    maxTokens: number;
    apiKey: string;
  };
  rateLimit: {
    windowMs: number; // milliseconds
    maxRequests: number;
  };
  input: {
    maxLength: number; // 1500
    minLength: number; // 1
  };
  server: {
    port: number;
  };
}
