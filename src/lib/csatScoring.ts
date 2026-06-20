import type { CSATScore, CSATFlagResult, CSATDomainScore } from '../types';

export const csatDomains = [
  {
    id: 'physiologic_stability',
    name: 'Physiologic Stability',
    description: 'What the body is doing.',
    score0: 'Stable vitals, no concerning trends',
    score1: 'Abnormal or trending vitals requiring watch',
    score2: 'Active instability, rapid change, or support escalation',
    examples: 'Increasing O₂ needs; hypotension trends; acute neuro change.',
    isFTRPredictor: false,
  },
  {
    id: 'monitoring_intensity',
    name: 'Monitoring Intensity Required',
    description: 'How often reassessment is needed.',
    score0: 'Routine reassessment',
    score1: 'Frequent reassessment or alarms',
    score2: 'Near-continuous observation or titration',
    examples: 'Titrated drips; Q15-30 min checks; safety attendant needs.',
    isFTRPredictor: false,
  },
  {
    id: 'care_complexity',
    name: 'Care Complexity',
    description: 'How much cognitive and coordination load exists.',
    score0: 'Standard care, predictable tasks',
    score1: 'Multiple interventions or services involved',
    score2: 'High interruption rate or task saturation',
    examples: 'Multiple infusions; frequent procedures; cross-service coordination.',
    isFTRPredictor: false,
  },
  {
    id: 'trajectory_uncertainty',
    name: 'Trajectory Uncertainty',
    description: 'Where the patient is heading.',
    score0: 'Stable and predictable',
    score1: 'Recent change or pending results',
    score2: 'High likelihood of deterioration',
    examples: 'Recent escalation; pending imaging/labs for instability; "something isn\'t right."',
    isFTRPredictor: true,
  },
  {
    id: 'safety_behavioral_risk',
    name: 'Safety / Behavioral Risk',
    description: 'Risk to patient or staff.',
    score0: 'No safety concerns',
    score1: 'Moderate fall, delirium, or agitation risk',
    score2: 'Active self-harm, violence, elopement risk',
    examples: 'Delirium; suicide precautions; aggression or restraint needs.',
    isFTRPredictor: false,
  },
];

export function evaluateCSATFlags(scores: CSATScore[]): CSATFlagResult {
  if (scores.length === 0) {
    return { status: 'green', label: 'No scores entered', explanation: '', hasVariance: false, varianceDomains: [] };
  }

  const anyTwo = scores.some(s => s.primaryRN === 2);
  const countOnes = scores.filter(s => s.primaryRN === 1).length;

  const varianceDomains = scores
    .filter(s => s.chargeRN !== undefined && s.primaryRN > (s.chargeRN as CSATDomainScore))
    .map(s => s.domainId);

  const hasVariance = varianceDomains.length > 0;

  if (anyTwo || hasVariance) {
    return {
      status: 'red',
      label: anyTwo ? 'Red Flag — Assignment Modification Required' : 'Red Flag — Scoring Variance Detected',
      explanation: anyTwo
        ? 'One or more domains scored 2. CRF advances to Recognition minimum. Assignment modification discussion required. Documentation is protected and traceable. Source: Nurse Risk Assessment doc, Tab 17.'
        : 'Primary RN score exceeds Charge RN score in one or more domains. Variance is a safety signal. No override. No dismissal. CRF advances to Recognition. Source: Nurse Risk Assessment doc, Tab 17.',
      hasVariance,
      varianceDomains,
    };
  }

  if (countOnes >= 2) {
    return {
      status: 'yellow',
      label: 'Yellow Flag — Elevated Concern',
      explanation: 'Two or more domains scored 1. Elevated concern. Escalation discussion recommended. Source: Nurse Risk Assessment doc, Tab 17.',
      hasVariance,
      varianceDomains,
    };
  }

  return {
    status: 'green',
    label: 'Green — No Automatic Escalation Required',
    explanation: 'All domains scored 0. No automatic escalation required. Source: Nurse Risk Assessment doc, Tab 17.',
    hasVariance,
    varianceDomains,
  };
}
