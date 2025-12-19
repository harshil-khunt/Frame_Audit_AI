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
  confidenceScore: number;
  whyThisFramingPersists: string;
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
  primaryControlHolder: string;
  primaryCostBearer: string;
  misalignmentDescription: string;
}

// Reality Compression Section
export interface RealityCompressionSection {
  coreTruths: string[];
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
}

// Complete Analysis Result
export interface AnalysisResult {
  refusalReason?: string;
  reframedQuestion?: string;
  frameAudit?: FrameAuditSection;
  systemMap?: SystemMapSection;
  realityCompression?: RealityCompressionSection;
  levers?: LeversSection;
  metadata: {
    analyzedAt: string; // ISO string for JSON serialization
    processingTime: number;
  };
}

// Error Response
export type ErrorCode = 'VALIDATION_ERROR' | 'RATE_LIMIT_ERROR' | 'PROCESSING_ERROR';

export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  message: string;
}
