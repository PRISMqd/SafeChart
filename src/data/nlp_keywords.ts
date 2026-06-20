export interface KeywordCategory {
  id: number;
  name: string;
  keywords: string[];
  crfStages: string[];
  cmdsMechanisms: string[];
  riskCategory: string;
  autoHighRisk: boolean;
  translationFraming: string;
}

export const NLP_KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    id: 1,
    name: 'Functional Unfamiliarity / Float Risk',
    keywords: [
      'float', 'floated', 'floating', 'new to unit', 'not my unit', 'unfamiliar unit',
      'different floor', 'pulled to', 'sent to', 'never worked', 'first time on',
      'not trained for', 'outside my scope', 'not familiar with', "don't know this unit",
      'transferred to', 'cross-trained', 'not cross-trained', 'agency nurse',
    ],
    crfStages: ['Stage 2', 'Stage 3'],
    cmdsMechanisms: ['M5'],
    riskCategory: 'Functional Unfamiliarity',
    autoHighRisk: false,
    translationFraming: 'Nurse was assigned to provide care in a clinical environment outside their established scope of unit-specific competency, constituting a functional unfamiliarity risk that impairs recognition speed and surveillance capacity.',
  },
  {
    id: 2,
    name: 'Mid-Shift Reassignment',
    keywords: [
      'mid-shift', 'mid shift', 'reassigned', 'during my shift', 'in the middle of my shift',
      'added patient', 'given another patient', 'another patient added', 'patient added',
      'transferred to me', 'taken over', 'picked up patient', 'extra patient',
      'while i was', 'changed assignment', 'assignment change', 'new assignment',
    ],
    crfStages: ['Stage 2', 'Stage 4'],
    cmdsMechanisms: ['M6'],
    riskCategory: 'Mid-Shift Reassignment',
    autoHighRisk: true,
    translationFraming: 'Mid-shift patient reassignment was documented. This constitutes an automatic high-risk flag under the CRF framework. Reassignment during active care continuity disrupts established surveillance patterns and introduces compounded recognition risk that cannot be mitigated by post-assignment orientation.',
  },
  {
    id: 3,
    name: 'Escalation Failure',
    keywords: [
      'told charge', 'reported to charge', 'escalated', 'told supervisor', 'notified manager',
      'no response', 'ignored', 'denied', 'refused', "wouldn't help", 'did nothing',
      'nothing was done', 'dismissed', 'told me to figure it out', 'unavailable',
      "couldn't reach", 'no one answered', 'left message', 'still waiting',
    ],
    crfStages: ['Stage 6'],
    cmdsMechanisms: ['M6'],
    riskCategory: 'Escalation Failure',
    autoHighRisk: false,
    translationFraming: 'Documentation reflects a formal escalation attempt that did not result in resolution. This constitutes an escalation failure signal under the CRF framework, Stage 6. The nurse fulfilled professional obligation to escalate; the absence of institutional response creates residual liability for the facility.',
  },
  {
    id: 4,
    name: 'Perception Destabilization',
    keywords: [
      'gaslighting', 'told i was wrong', 'made me feel', 'questioned my judgment',
      'undermined', 'belittled', 'dismissed my concern', 'told i was overreacting',
      'made to feel incompetent', 'blamed me', 'my fault', 'told it was fine',
      'second-guessing myself', 'doubt myself', "not sure if i'm right",
    ],
    crfStages: ['Stage 2', 'Stage 3'],
    cmdsMechanisms: ['M3'],
    riskCategory: 'Perception Destabilization',
    autoHighRisk: false,
    translationFraming: "Narrative contains indicators of perception destabilization consistent with CMDS Mechanism M3. Clinical judgment was challenged through informal interpersonal mechanisms rather than clinical evidence, which may impair the nurse's recognition confidence and documentation accuracy.",
  },
  {
    id: 5,
    name: 'Surveillance Overload',
    keywords: [
      'too many patients', "can't watch everyone", "can't get to everyone",
      'stretched thin', 'running all day', "couldn't check on", 'forgot to check',
      'overwhelmed', 'behind all shift', "couldn't keep up", 'no time to assess',
      "haven't checked vitals", 'missed assessment', 'surveillance', 'diluted',
    ],
    crfStages: ['Stage 1', 'Stage 2'],
    cmdsMechanisms: ['M5'],
    riskCategory: 'Surveillance Overload',
    autoHighRisk: false,
    translationFraming: 'Nurse documented conditions consistent with surveillance dilution — a state in which patient-to-nurse ratio or acuity load prevents timely recognition of clinical deterioration across all assigned patients simultaneously.',
  },
  {
    id: 6,
    name: 'Patient Deterioration Signal',
    keywords: [
      'patient got worse', 'deteriorated', 'declined', 'rapid response', 'code',
      'called a rapid', 'patient fell', 'fall', 'near miss', 'close call',
      'almost missed', 'caught late', 'delayed recognition', 'should have caught sooner',
      'wish i had', 'patient complained', 'family complained', 'change in condition',
    ],
    crfStages: ['Stage 1', 'Stage 2'],
    cmdsMechanisms: [],
    riskCategory: 'Patient Deterioration',
    autoHighRisk: false,
    translationFraming: 'Documentation includes patient deterioration signals. The clinical trajectory documented is consistent with a staffing-related recognition delay. This record establishes a contemporaneous professional account of the circumstances surrounding the adverse or near-adverse event.',
  },
  {
    id: 7,
    name: 'Signal Suppression',
    keywords: [
      'told not to document', "don't write that down", 'told to change my note',
      'alter my charting', 'change the chart', 'delete', 'remove from chart',
      'pressure to not report', 'threatened if i report', 'warned not to',
      "don't say anything", 'keep quiet', "don't tell anyone",
    ],
    crfStages: ['Stage 6', 'Stage 7'],
    cmdsMechanisms: ['M6'],
    riskCategory: 'Signal Suppression',
    autoHighRisk: false,
    translationFraming: 'Narrative contains indicators consistent with CMDS S2 — institutional signal suppression. If accurate, documentation of this pattern is critical as it may constitute obstruction of professional duty and could implicate regulatory requirements under 42 CFR § 482.',
  },
  {
    id: 8,
    name: 'Fatigue and Compounding Risk',
    keywords: [
      'overtime', 'mandatory overtime', 'double shift', 'back to back',
      'worked extra', 'tired', 'exhausted', 'fatigued', 'no break',
      "didn't eat", 'no lunch', 'on my feet all day', 'third shift in a row',
      'worked all week', 'short staffed', 'understaffed', 'short', 'called in sick',
    ],
    crfStages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6', 'Stage 7', 'Stage 8', 'Stage 9'],
    cmdsMechanisms: ['M5', 'M6'],
    riskCategory: 'Fatigue / Compounding Risk',
    autoHighRisk: false,
    translationFraming: 'Documentation reflects fatigue and compounding risk factors that elevate vulnerability across all CRF stages. Cumulative staffing debt — the accrual of unresolved workload beyond safe clinical threshold — is documented in this record.',
  },
  {
    id: 9,
    name: 'Sitter / Safety Attendant Concerns',
    keywords: [
      'sitter', 'safety attendant', 'one-to-one', '1:1', 'patient watcher',
      'sitter removed', 'sitter discontinued', 'no sitter', "can't get a sitter",
      'fall risk without sitter', 'sitter denied', 'taken off sitter',
    ],
    crfStages: ['Stage 1', 'Stage 2'],
    cmdsMechanisms: ['M6'],
    riskCategory: 'Sitter / Safety Attendant',
    autoHighRisk: false,
    translationFraming: 'Documentation reflects discontinuation or denial of sitter/safety attendant services. Removal of continuous observation for a patient assessed to require it constitutes a documented safety downgrade that increases fall and adverse event risk.',
  },
  {
    id: 10,
    name: 'Experiential Authority Signal',
    keywords: [
      'in my experience', "i've seen this before", 'i know this patient',
      "i've been doing this for", 'years of experience', 'clinical intuition',
      "something wasn't right", 'my gut', 'knew something was wrong',
      'clinical judgment', 'professional assessment', 'as a nurse',
    ],
    crfStages: [],
    cmdsMechanisms: [],
    riskCategory: 'Experiential Authority',
    autoHighRisk: false,
    translationFraming: 'Nurse invoked professional experiential authority as the basis for clinical concern. This is a counter-signal to perception destabilization (M3) and strengthens the evidentiary weight of the clinical judgment documented herein.',
  },
];
