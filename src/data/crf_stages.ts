import type { CRFStage } from '../types';

export const crfStages: CRFStage[] = [
  {
    stage: 1,
    name: 'Detection',
    domain: '3rs_recognize',
    regulatoryAlignment: 'Early identification of risk indicators, abnormal findings, or safety signals',
    commonFailure: 'Abnormal data, trends, or observations not surfaced, visible, or available',
    rcaQuestions: [
      'What signals, data, observations, or reports indicated a change in condition?',
      'How were these signals generated (monitoring, observation, patient report, alerts)?',
      'Were monitoring tools, workflows, or thresholds adequate to surface the signal?',
      'Were there barriers that limited signal visibility or access?',
    ],
  },
  {
    stage: 2,
    name: 'Recognition',
    domain: '3rs_recognize',
    regulatoryAlignment: 'Missed or delayed recognition of deterioration (TJC, 2024)',
    commonFailure: 'Early warning signs present but not acknowledged as abnormal',
    rcaQuestions: [
      'Was the signal noticed and acknowledged as abnormal or concerning?',
      'If not, what factors contributed to the signal being overlooked or normalized?',
      'Were staffing levels, workload, or environmental factors relevant?',
      'Did prior experiences or expectations influence recognition?',
    ],
  },
  {
    stage: 3,
    name: 'Interpretation',
    domain: '3rs_recognize',
    regulatoryAlignment: 'Diagnostic reasoning, situational awareness, differentiation between artifact and true risk',
    commonFailure: 'Clinical significance, severity, or trajectory misattributed or underestimated',
    rcaQuestions: [
      'How was the signal interpreted at the time?',
      'Was severity, trajectory, or uncertainty adequately considered?',
      'Were alternative explanations (artifact, normal variation) weighed appropriately?',
      'What information was missing or unclear during interpretation?',
    ],
  },
  {
    stage: 4,
    name: 'Prioritization',
    domain: '3rs_recognize',
    regulatoryAlignment: 'Risk stratification and triage failures frequently cited in adverse event analyses',
    commonFailure: 'Identified risk assigned insufficient urgency relative to competing demands',
    rcaQuestions: [
      'How was urgency determined relative to competing demands?',
      'Were there clear criteria or guidance to support prioritization?',
      'Did workload, task switching, or resource constraints affect urgency assignment?',
      'Was escalation delayed due to competing priorities?',
    ],
  },
  {
    stage: 5,
    name: 'Communication',
    domain: '3rs_relay',
    regulatoryAlignment: 'Inadequate handoff, incomplete communication, or failure to convey concern',
    commonFailure: 'Concern not clearly articulated or urgency not conveyed',
    rcaQuestions: [
      'How was the concern communicated, and to whom?',
      'Was risk, uncertainty, and urgency clearly conveyed?',
      'Were structured communication tools available and used effectively?',
      'Were there cultural or hierarchical factors affecting communication clarity?',
    ],
  },
  {
    stage: 6,
    name: 'Escalation',
    domain: '3rs_relay',
    regulatoryAlignment: 'Failure to activate appropriate response pathways or chain of command (TJC, 2024)',
    commonFailure: 'Appropriate escalation pathway or chain of command not activated',
    rcaQuestions: [
      'Did the information reach someone with authority and capacity to intervene?',
      'Were escalation pathways clear, accessible, and supported?',
      'Was escalation delayed or avoided, and if so, why?',
      'Were there perceived barriers to activating higher-level response?',
    ],
  },
  {
    stage: 7,
    name: 'Action',
    domain: '3rs_respond',
    regulatoryAlignment: 'Delayed or absent intervention following recognized deterioration',
    commonFailure: 'Intervention delayed, incomplete, or not initiated',
    rcaQuestions: [
      'What intervention was initiated, and when?',
      'Was the intervention timely and appropriate given the risk identified?',
      'Were there delays related to availability, authorization, or coordination?',
      'Were alternative actions considered but not pursued?',
    ],
  },
  {
    stage: 8,
    name: 'Reassessment',
    domain: '3rs_respond',
    regulatoryAlignment: 'Failure to reassess after intervention or monitor response to treatment',
    commonFailure: 'Patient status or response not re-evaluated after intervention',
    rcaQuestions: [
      'How and when was the patient or system re-evaluated after intervention?',
      'Were changes in condition, trends, or response captured and reviewed?',
      'Was reassessment delayed, incomplete, or absent?',
      'Were responsibilities for reassessment clearly defined?',
    ],
  },
  {
    stage: 9,
    name: 'Validation',
    domain: '3rs_respond',
    regulatoryAlignment: 'Lack of closed-loop verification, follow-up, or documented effectiveness',
    commonFailure: 'Effectiveness of response not confirmed or need for further action not identified',
    rcaQuestions: [
      'Was the effectiveness of the intervention confirmed?',
      'Was stability, improvement, or need for further action clearly determined?',
      'Were findings documented and communicated?',
      'Did validation inform continued monitoring, additional intervention, or further escalation?',
    ],
  },
];

export const crfDomainLabel: Record<CRFStage['domain'], string> = {
  '3rs_recognize': 'Failure to Recognize',
  '3rs_relay': 'Failure to Relay or Escalate',
  '3rs_respond': 'Failure to Respond',
};
