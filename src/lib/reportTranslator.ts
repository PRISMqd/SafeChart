import type { ShiftRecord, ClassificationResult, EscalationEntry } from '../types';

export const REQUIRED_DISCLOSURE = `SafeChart is a professional documentation support tool. It does not constitute legal advice. Use of this tool does not guarantee protection from employment consequences. Nurses should consult their Nurse Practice Act, union representative if applicable, and personal legal counsel regarding specific situations. All submissions are the nurse's own professional documentation. PRISMqd does not submit anything on your behalf without your explicit, confirmed authorization.`;

const TIER_CITATIONS: Record<string, string[]> = {
  low: ['ANA Code of Ethics, Provisions 3 and 6 (2015)'],
  moderate: ['CRF doi:10.5281/zenodo.18237155', 'ANA Code of Ethics, Provisions 3 and 6 (2015)'],
  high: [
    'CMDS doi:10.5281/zenodo.18985075',
    'CMS Conditions of Participation, 42 CFR § 482',
    'OSHA General Duty Clause, 29 U.S.C. § 654(a)(1)',
    'OSHA Whistleblower Protection, 29 CFR Part 1977',
  ],
  critical: [
    'EMTALA, 42 U.S.C. § 1395dd',
    'CMS Conditions of Participation, 42 CFR § 482',
    'OSHA General Duty Clause, 29 U.S.C. § 654(a)(1)',
    'AHRQ Patient Safety Primer: Failure to Rescue (2023)',
  ],
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function escalationResponseLabel(r: EscalationEntry['response']): string {
  const map: Record<EscalationEntry['response'], string> = {
    resolved: 'Resolved',
    deferred: 'Deferred',
    denied: 'Denied',
    no_response: 'No Response Received',
  };
  return map[r];
}

export function buildTranslatedReport(record: ShiftRecord): string {
  const { classification, escalations, timestamp, nurseRole, shiftType, unitType, state } = record;
  const tier = classification?.severityTier ?? 'low';
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  let out = '';

  out += `SAFECHART PROFESSIONAL DOCUMENTATION RECORD\n`;
  out += `PRISMqd | safechart.prismqd.com\n`;
  out += `Generated: ${formatDateTime(timestamp)}\n\n`;

  out += `DOCUMENTATION CONTEXT\n`;
  if (nurseRole) out += `Role: ${nurseRole}\n`;
  if (shiftType) out += `Shift: ${shiftType}\n`;
  if (unitType) out += `Unit Type: ${unitType}\n`;
  if (state) out += `State: ${state}\n`;
  out += `Severity Classification: ${tierLabel}\n\n`;

  if (classification && classification.matches.length > 0) {
    out += `CLINICAL SIGNAL CLASSIFICATION (CRF/CMDS Framework)\n`;
    out += `Source: CRF doi:10.5281/zenodo.18237155; CMDS doi:10.5281/zenodo.18985075\n\n`;

    for (const match of classification.matches) {
      out += `${match.category.name}\n`;
      out += `  CRF Stages Implicated: ${match.category.crfStages.join(', ')}\n`;
      out += `  CMDS Mechanisms Active: ${match.category.cmdsMechanisms.join(', ')}\n`;
      out += `  Risk Category: ${match.category.riskCategory}\n`;
      if (match.category.autoHighRisk) {
        out += `  FLAG: AUTOMATIC HIGH-RISK — Non-removable. Continuity violation equivalent to handoff failure.\n`;
      }
      out += `\n`;
    }
  }

  out += `TRANSLATED PROFESSIONAL RECORD\n\n`;

  if (classification?.matches && classification.matches.length > 0) {
    for (const match of classification.matches) {
      out += `[${match.category.name}]\n`;
      out += match.category.translationFraming + '\n\n';
    }
  } else {
    out += `The nurse has documented a professional concern regarding workplace safety conditions. `;
    out += `This record is a contemporaneous professional document created at the time of the event.\n\n`;
  }

  if (escalations && escalations.length > 0) {
    out += `ESCALATION TIMELINE\n`;
    for (const esc of escalations) {
      out += `  ${esc.attemptTime} — Reported to: ${esc.reportedTo}\n`;
      out += `  Response: ${escalationResponseLabel(esc.response)}\n`;
      if (esc.details) out += `  Details: ${esc.details}\n`;

      if (esc.response === 'denied' || esc.response === 'no_response') {
        out += `  CMDS M6 FLAG: This escalation attempt received ${escalationResponseLabel(esc.response).toLowerCase()}. `;
        out += `This pattern is documented in published safety science as escalation suppression, `;
        out += `a recognized organizational mechanism that increases failure-to-rescue risk. `;
        out += `Source: CMDS doi:10.5281/zenodo.18985075\n`;
      }
      out += `\n`;
    }
  }

  out += `APPLICABLE AUTHORITIES\n`;
  const citations = TIER_CITATIONS[tier] ?? TIER_CITATIONS.low;
  for (const cite of citations) {
    out += `  • ${cite}\n`;
  }
  out += `\n`;

  out += `REQUIRED DISCLOSURE\n`;
  out += REQUIRED_DISCLOSURE + '\n';

  return out;
}

export function buildNurseAccountSummary(freeText: string, classification: ClassificationResult | undefined): string {
  if (!freeText && (!classification || classification.matches.length === 0)) {
    return 'No narrative entered.';
  }
  return freeText || '(No free text narrative entered. Classification derived from structured inputs.)';
}
