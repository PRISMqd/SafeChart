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
