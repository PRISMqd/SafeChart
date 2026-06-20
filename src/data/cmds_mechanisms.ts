export interface CMDSMechanism {
  id: string;
  type: 'mechanism' | 'stage';
  name: string;
  description: string;
  indicators: string[];
  regulatoryImplication?: string;
}

export const CMDS_DATA: CMDSMechanism[] = [
  {
    id: 'M1',
    type: 'mechanism',
    name: 'Workload Compression',
    description: "The systematic assignment of patient loads that exceed safe clinical threshold, compressing the nurse's ability to provide adequate surveillance and timely intervention.",
    indicators: [
      'Patient-to-nurse ratio above evidence-based safe threshold',
      'Acuity-adjusted workload exceeding clinical capacity',
      'Absence of ancillary support staff',
    ],
    regulatoryImplication: '42 CFR § 482.23(b) — Nursing services must be organized and staffed to provide adequate nursing care to all patients.',
  },
  {
    id: 'M2',
    type: 'mechanism',
    name: 'Acuity Misclassification',
    description: 'Administrative or systemic underclassification of patient acuity, resulting in assignment loads that appear compliant by census count but exceed safe capacity by clinical need.',
    indicators: [
      'Acuity scoring tools that underweight nursing intensity',
      'Discrepancy between documented and actual patient acuity',
      'Charge nurse or manager overriding nurse acuity assessment',
    ],
    regulatoryImplication: '42 CFR § 482.23(b)(1) — Staffing levels must be based on patient care needs.',
  },
  {
    id: 'M3',
    type: 'mechanism',
    name: 'Perception Destabilization',
    description: "The informal erosion of a nurse's clinical confidence through interpersonal challenge, dismissal, or blame, independent of clinical evidence, in a manner that impairs professional judgment.",
    indicators: [
      'Clinical concerns dismissed without clinical rationale',
      'Nurse told they are "overreacting" to documented safety concerns',
      'Blame attribution to individual nurse for systemic conditions',
    ],
    regulatoryImplication: 'ANA Code of Ethics, Provision 6 — The nurse, through individual and collective effort, establishes, maintains, and improves the ethical environment of the work setting.',
  },
  {
    id: 'M4',
    type: 'mechanism',
    name: 'Continuity Disruption',
    description: 'Intentional or structural interruption of established nurse-patient relationships and care continuity, increasing recognition delay risk through loss of clinical baseline familiarity.',
    indicators: [
      'Routine float assignments without competency verification',
      'Mid-shift patient reassignment without clinical justification',
      'Shift scheduling that prevents consistent patient assignment',
    ],
    regulatoryImplication: '42 CFR § 482.23(c) — Nursing services must have a plan for care based on patient assessment.',
  },
  {
    id: 'M5',
    type: 'mechanism',
    name: 'Competency Boundary Violation',
    description: "Assignment of a nurse to provide care outside their verified unit-specific competency, creating functional unfamiliarity risk that impairs recognition, assessment, and intervention capacity.",
    indicators: [
      'Float assignment to unfamiliar specialty unit',
      'Cross-training assignment without competency verification',
      'Agency or travel nurse assignment without adequate orientation',
    ],
    regulatoryImplication: '42 CFR § 482.23(b)(5) — Registered nurses must assess, plan, and evaluate nursing care.',
  },
  {
    id: 'M6',
    type: 'mechanism',
    name: 'Institutional Non-Response',
    description: 'The pattern by which institutional actors — charge nurses, supervisors, administrators — fail to respond adequately to nurse escalation of safety concerns, leaving documented risk unmitigated.',
    indicators: [
      'No response to escalated safety concern',
      'Deferral of safety intervention without timeline',
      'Active denial of escalation request',
    ],
    regulatoryImplication: '29 U.S.C. § 654(a)(1) — Employers must furnish a workplace free from recognized hazards.',
  },
  {
    id: 'M7',
    type: 'mechanism',
    name: 'Documentation Interference',
    description: 'Active or passive institutional interference with accurate professional documentation, including pressure to omit, alter, or delay documentation of safety-relevant events.',
    indicators: [
      'Verbal instruction not to document a safety concern',
      'Pressure to alter existing nursing documentation',
      'Systemic underreporting culture that discourages contemporaneous recording',
    ],
    regulatoryImplication: '42 CFR § 482.24 — Medical records must be accurate and promptly completed.',
  },
  {
    id: 'S0',
    type: 'stage',
    name: 'Pre-Incident Baseline',
    description: "The unit's baseline staffing and safety posture prior to the shift or event in question. Establishes comparative context for subsequent CMDS stages.",
    indicators: [
      'Documented baseline staffing ratio',
      'Unit census and acuity at shift start',
      'Presence or absence of ancillary support',
    ],
  },
  {
    id: 'S1',
    type: 'stage',
    name: 'Threshold Breach',
    description: 'The point at which assigned workload crosses the threshold of safe clinical management, creating compounded surveillance and response risk.',
    indicators: [
      'Ratio breach documented by nurse',
      'Verbal or written acknowledgment of unsafe staffing by supervisor',
      'Census increase without proportional staff increase',
    ],
  },
  {
    id: 'S2',
    type: 'stage',
    name: 'Signal Suppression',
    description: 'Institutional actions or culture that prevent accurate signals of unsafe conditions from reaching appropriate stakeholders or being formally documented.',
    indicators: [
      'Instructions not to document staffing concerns',
      'Informal discouragement of incident reporting',
      'Management pressure to underreport patient events',
    ],
    regulatoryImplication: '42 CFR § 482.21 — Quality assurance programs must capture and address safety signals.',
  },
  {
    id: 'S3',
    type: 'stage',
    name: 'Escalation Initiation',
    description: 'The moment at which the nurse formally or informally raises a safety concern through available institutional channels.',
    indicators: [
      'Verbal report to charge nurse',
      'Written communication to supervisor',
      'Formal incident report submission',
    ],
  },
  {
    id: 'S4',
    type: 'stage',
    name: 'Institutional Response Failure',
    description: 'The institutional failure to adequately address escalated safety concerns within a timeframe that prevents harm.',
    indicators: [
      'No response to escalation within shift',
      'Response limited to acknowledgment without action',
      'Escalation redirected without resolution',
    ],
  },
  {
    id: 'S5',
    type: 'stage',
    name: 'Residual Risk Accumulation',
    description: 'The accumulation of unresolved safety risk following institutional non-response, increasing the probability of adverse patient outcome.',
    indicators: [
      'Unsafe conditions persist after escalation',
      'Patient risk not mitigated following nurse report',
      'Shift ends with documented unresolved concerns',
    ],
  },
  {
    id: 'S6',
    type: 'stage',
    name: 'Adverse Event or Near-Miss',
    description: 'The clinical event or near-miss that occurs in the context of accumulated, unresolved staffing risk.',
    indicators: [
      'Patient fall, deterioration, or adverse outcome',
      'Rapid response or code event',
      'Near-miss event documented by nurse',
    ],
  },
];
