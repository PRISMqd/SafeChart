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
  primaryRN: 0 | 1 | 2 | undefined;
  chargeRN?: 0 | 1 | 2 | undefined;
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
  loggedAt?: string;
}

export interface AuditEntry {
  id: string;
  sessionId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export const EVENT_TYPES = [
  'Staffing / Assignment',
  'Unsafe Patient Ratio',
  'Mid-Shift Reassignment / Float',
  'Escalation Failure',
  'Patient Deterioration',
  'Medication / Treatment',
  'Fall / Injury',
  'Communication / Coordination',
  'Equipment / Environment',
  'Violence / Behavioral',
  'Sitter / Safety Attendant',
  'Near Miss',
  'Other',
] as const;

export type EventType = typeof EVENT_TYPES[number];

export interface QuickEntryRecord {
  id: string;
  timestamp: string;
  shiftTime: string;
  unit: string;
  eventType: EventType | '';
  description: string;
  state: string;
}

// ─── Module 4: Residual Risk ──────────────────────────────────────────────────

export type ResidualRiskLevel = 'low' | 'moderate' | 'high' | 'unresolved';

export interface ResidualRiskRecord {
  completedAt: string;
  outstandingConcerns: string;
  patientsAffected: string;
  conditionStartTime: string;
  interimSafeguards: string;
  anticipatedResolution: string;
  residualRiskLevel: ResidualRiskLevel;
}

// ─── Module 5: Sitter/Safety Attendant ───────────────────────────────────────

export const SITTER_NEEDS = [
  'Fall risk',
  'Elopement risk',
  'Behavioral / agitation',
  'Post-procedure monitoring',
  'Suicidal ideation / self-harm risk',
  'Altered mental status',
  'Other',
] as const;
export type SitterNeed = typeof SITTER_NEEDS[number];

export interface SitterRecord {
  completedAt: string;
  monitoringNeeds: SitterNeed[];
  monitoringNeedOther: string;
  sitterAssignedAtStart: boolean | null;
  sitterRemovedOrDenied: boolean | null;
  removalTime: string;
  removedByRole: string;
  reasonGiven: string;
  timeWithoutCoverage: string;
  nurseObjection: string;
  patientOutcome: string;
}

// ─── Module 6: ARI Self-Assessment ───────────────────────────────────────────

export interface ARIDomain {
  domain: string;
  score: 0 | 1 | 2 | undefined;
  label0: string;
  label1: string;
  label2: string;
}

export type ARILevel = 'low' | 'moderate' | 'high';

export interface ARIRecord {
  completedAt: string;
  domains: { domain: string; score: 0 | 1 | 2 | undefined }[];
  additionalContext: string;
  ariLevel: ARILevel;
}

// ─── Documentation Enhancements ──────────────────────────────────────────────

export interface InternalReportEntry {
  level: string;
  reportedAt: string;
  response: 'acknowledged' | 'deferred' | 'denied' | 'no_response' | '';
  details: string;
}

export const RETALIATION_INDICATORS = [
  'Schedule change within 30 days of report',
  'Disciplinary action initiated after report',
  'Performance review initiated after report',
  'Hostile or retaliatory communication from management',
  'Removed from preferred unit or shift assignment',
  'Informal pressure not to document or report',
  'Exclusion from meetings or decisions after report',
  'Threat of termination or adverse action',
  'Negative patient complaint filed after report',
  'Other adverse employment action',
] as const;
export type RetaliationIndicator = typeof RETALIATION_INDICATORS[number];

export interface RetaliationRecord {
  flaggedAt: string;
  indicators: RetaliationIndicator[];
  details: string;
}

// ─── ShiftRecord ──────────────────────────────────────────────────────────────

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
  eventType?: EventType | '';
  draftSaved?: string;
}
