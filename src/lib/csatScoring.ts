import type { CSATScore } from '../types';

export type CSATFlag = 'green' | 'yellow' | 'red';

export interface CSATResult {
  flag: CSATFlag;
  explanation: string;
  varianceSignals: string[];
}

export function scoreCSAT(scores: CSATScore[]): CSATResult {
  const varianceSignals: string[] = [];
  let redCount = 0;
  let yellowCount = 0;

  for (const s of scores) {
    if (s.primaryRN === 2) redCount++;
    if (s.primaryRN === 1) yellowCount++;
    if (s.chargeRN !== undefined && (s.primaryRN ?? 0) > s.chargeRN) {
      varianceSignals.push(`${s.domain}: Primary RN score (${s.primaryRN}) exceeds Charge RN score (${s.chargeRN}) — safety signal detected`);
    }
  }

  if (redCount >= 1) {
    return {
      flag: 'red',
      explanation: 'RED FLAG: One or more domains scored 2 (high acuity/risk). Immediate documentation and escalation recommended.',
      varianceSignals,
    };
  }
  if (yellowCount >= 2) {
    return {
      flag: 'yellow',
      explanation: 'YELLOW FLAG: Two or more domains scored 1 (moderate concern). Conditions warrant documentation and monitoring.',
      varianceSignals,
    };
  }
  return {
    flag: 'green',
    explanation: 'GREEN: No high-risk domains identified. Continue standard documentation practice.',
    varianceSignals,
  };
}
