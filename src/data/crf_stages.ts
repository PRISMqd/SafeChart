export interface CRFStage {
  stage: number;
  name: string;
  threeRsMapping: string;
  regulatoryAlignment: string;
  commonFailure: string;
  rcaQuestions: string[];
}

export const CRF_STAGES: CRFStage[] = [
  {
    stage: 1,
    name: 'Initial Condition Recognition',
    threeRsMapping: 'Recognize',
    regulatoryAlignment: '42 CFR § 482.13 (Patient Rights)',
    commonFailure: 'Surveillance dilution prevents timely recognition of patient condition changes',
    rcaQuestions: [
      "What was the nurse-to-patient ratio at the time of the event?",
      'Were there competing demands that limited surveillance time?',
      "Was the nurse familiar with this patient's baseline condition?",
    ],
  },
  {
    stage: 2,
    name: 'Risk Stratification',
    threeRsMapping: 'Recognize',
    regulatoryAlignment: '42 CFR § 482.23 (Nursing Services)',
    commonFailure: 'Functional unfamiliarity impairs accurate risk assessment; float or new-to-unit assignments',
    rcaQuestions: [
      'Was the nurse assigned to a unit within their established competency?',
      'Were acuity scores calculated accurately at shift start?',
      'Was mid-shift reassignment a factor?',
    ],
  },
  {
    stage: 3,
    name: 'Clinical Decision-Making',
    threeRsMapping: 'Recognize',
    regulatoryAlignment: 'ANA Code of Ethics, Provision 3',
    commonFailure: 'Perception destabilization interferes with clinical confidence and decision authority',
    rcaQuestions: [
      "Was the nurse's clinical judgment challenged without clinical evidence?",
      'Were there institutional pressures that affected decision-making?',
      'Did the nurse have access to necessary decision support resources?',
    ],
  },
  {
    stage: 4,
    name: 'Intervention Initiation',
    threeRsMapping: 'Respond',
    regulatoryAlignment: '42 CFR § 482.13(e) (Restraint/Seclusion) as analog',
    commonFailure: 'Compounded workload delays timely intervention; staffing debt accumulation',
    rcaQuestions: [
      'Was the nurse able to initiate intervention within the required timeframe?',
      'Were there barriers to obtaining needed resources or assistance?',
      'Was assignment continuity maintained during intervention?',
    ],
  },
  {
    stage: 5,
    name: 'Coordination and Communication',
    threeRsMapping: 'Respond',
    regulatoryAlignment: '42 CFR § 482.23(b) (Nursing Services)',
    commonFailure: 'Handoff degradation; information loss during shift change or team communication under high load',
    rcaQuestions: [
      'Was critical clinical information communicated accurately and timely?',
      'Were handoff protocols followed under the prevailing workload?',
      'Did communication barriers contribute to the adverse event or near-miss?',
    ],
  },
  {
    stage: 6,
    name: 'Escalation and Institutional Response',
    threeRsMapping: 'Respond',
    regulatoryAlignment: '29 U.S.C. § 157 (NLRA Section 7)',
    commonFailure: 'Escalation failure; institutional non-response leaves nurse without clinical backup',
    rcaQuestions: [
      'To whom did the nurse escalate and at what time?',
      'What was the institutional response to escalation?',
      'Was the nurse discouraged from escalating or documenting concerns?',
    ],
  },
  {
    stage: 7,
    name: 'Documentation and Record Integrity',
    threeRsMapping: 'Record',
    regulatoryAlignment: '42 CFR § 482.24 (Medical Record Services)',
    commonFailure: 'Signal suppression; pressure to alter or omit documentation of unsafe conditions',
    rcaQuestions: [
      'Was the nurse able to document concerns contemporaneously and accurately?',
      'Was there any pressure to alter or withhold documentation?',
      'Does the medical record reflect the clinical reality experienced by the nurse?',
    ],
  },
  {
    stage: 8,
    name: 'Post-Event Analysis',
    threeRsMapping: 'Record',
    regulatoryAlignment: '42 CFR § 482.21 (Quality Assessment)',
    commonFailure: 'Root cause analysis fails to identify staffing as a systemic contributor; individual blame substituted for systems analysis',
    rcaQuestions: [
      'Was a formal RCA conducted following the event?',
      'Did the RCA examine staffing adequacy as a contributing factor?',
      'Were corrective actions systemic or individual in focus?',
    ],
  },
  {
    stage: 9,
    name: 'Systemic Pattern Recognition',
    threeRsMapping: 'Record',
    regulatoryAlignment: '42 CFR § 482.21(a) (QAPI)',
    commonFailure: 'Individual events not aggregated; recurring patterns in staffing-related adverse events go undetected',
    rcaQuestions: [
      'Is this event part of a recurring pattern on this unit or shift?',
      'Has the nurse documented similar concerns previously?',
      'Is there institutional data tracking staffing-related safety events?',
    ],
  },
];
