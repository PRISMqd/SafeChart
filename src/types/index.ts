export interface CSATDomain {
  id: string;
  name: string;
  description: string;
  score0: string;
  score1: string;
  score2: string;
  examples: string;
  isFTRPredictor?: boolean;
}

export type CSATDomainScore = 0 | 1 | 2;

export interface CSATScore {
  domainId: string;
  primaryRN: CSATDomainScore;
  chargeRN?: CSATDomainScore;
}

export type FlagStatus = 'green' | 'yellow' | 'red';

export interface CSATFlagResult {
  status: FlagStatus;
  label: string;
  explanation: string;
  hasVariance: boolean;
  varianceDomains: string[];
}

export type SeverityTier = 'low' | 'moderate' | 'high' | 'critical';

export interface NLPCategory {
  id: number;
  name: string;
  phrases: string[];
  crfStages: string[];
  cmdsMechanisms: string[];
  riskCategory: string;
  autoHighRisk?: boolean;
  csatFlags?: string;
  translationFraming: string;
}

export interface NLPMatch {
  category: NLPCategory;
  matchedPhrases: string[];
}

export interface ClassificationResult {
  matches: NLPMatch[];
  severityTier: SeverityTier;
  autoHighRisk: boolean;
  hasEscalationFailure: boolean;
  hasPatientDeterioration: boolean;
  hasSignalSuppression: boolean;
}

export type EscalationResponse = 'resolved' | 'deferred' | 'denied' | 'no_response';

export interface EscalationEntry {
  id: string;
  attemptTime: string;
  reportedTo: string;
  response: EscalationResponse;
  details: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  categoryIndex: number;
  label: string;
  safetyBasis: string;
  crfStage?: string;
  citation?: string;
  compoundFlag?: string;
}

export interface ShiftRecord {
  id: string;
  timestamp: string;
  nurseRole: string;
  shiftType: string;
  unitType: string;
  state: string;
  freeText: string;
  csatScores: CSATScore[];
  showChargeRN: boolean;
  checklistItems: string[];
  escalations: EscalationEntry[];
  classification?: ClassificationResult;
  editedTranslation?: string;
}

export interface FederalCitation {
  id: string;
  name: string;
  citation: string;
  source_url: string;
  neutral_citation_phrase: string;
  requires_for_submissions: string[];
  key_duties: string[];
  common_violations: string[];
}

export interface StateBONEntry {
  state: string;
  abbreviation: string;
  npa_authority: string;
  source_url: string;
  bon_name: string;
  bon_complaint_url: string;
  bon_phone: string;
  bon_email: string | null;
  anonymous_complaint_accepted: 'yes' | 'no' | 'conditional';
  anonymous_complaint_source_url: string | null;
  refusal_rights_language_present: 'yes' | 'no' | 'partial';
  key_duty_verbatim: string;
  last_verified: string;
  build_status: 'complete' | 'pending' | 'requires_verification';
}

export interface CRFStage {
  stage: number;
  name: string;
  domain: '3rs_recognize' | '3rs_relay' | '3rs_respond';
  regulatoryAlignment: string;
  commonFailure: string;
  rcaQuestions: string[];
}

export interface CMDSMechanism {
  id: string;
  name: string;
  description: string;
  observableExpressions: string[];
  crfDisruption: string[];
  nlpTriggerPatterns: string[];
  autoFlag?: string;
}

export interface CMDSStage {
  id: string;
  stageNum: string;
  name: string;
  description: string;
  markers: string[];
  criticalNote?: string;
}
