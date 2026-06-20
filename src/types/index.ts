export interface CSATDomain {
  id: string;
  name: string;
  description: string;
  score0: string;
  score1: string;
  score2: string;
}

export interface CSATScore {
  domain: string;
  primaryRN: 0 | 1 | 2;
  chargeRN?: 0 | 1 | 2;
}

export type SeverityTier = 'low' | 'moderate' | 'high' | 'critical';

export interface NLPMatch {
  category: number;
  categoryName: string;
  matchedPhrases: string[];
  crfStages: string[];
  cmdsMechanisms: string[];
  riskCategory: string;
  autoHighRisk?: boolean;
  translationFraming: string;
}

export interface ClassificationResult {
  matches: NLPMatch[];
  severityTier: SeverityTier;
  autoHighRisk: boolean;
  hasEscalationFailure: boolean;
  hasPatientDeterioration: boolean;
}

export interface EscalationRecord {
  attemptTime: string;
  reportedTo: string;
  response: 'resolved' | 'deferred' | 'denied' | 'no_response';
  details: string;
}

export interface ShiftRecord {
  id: string;
  timestamp: string;
  nurseRole?: string;
  shiftType?: string;
  unitType?: string;
  state?: string;
  freeText: string;
  csatScores: CSATScore[];
  checklistItems: string[];
  escalations: EscalationRecord[];
  classification?: ClassificationResult;
  translatedReport?: string;
}
