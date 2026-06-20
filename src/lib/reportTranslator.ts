import type { ClassificationResult, EscalationRecord } from '../types';
import { FEDERAL_CITATIONS } from '../data/federal_citations';

const DISCLOSURE = `SafeChart is a professional documentation support tool. It does not constitute legal advice. Use of this tool does not guarantee protection from employment consequences. Nurses should consult their Nurse Practice Act, union representative if applicable, and personal legal counsel regarding specific situations. All submissions are the nurse's own professional documentation. PRISMqd does not submit anything on your behalf without your explicit, confirmed authorization.`;

export function translateReport(
  _freeText: string,
  classification: ClassificationResult,
  escalations: EscalationRecord[],
  checklistItems: string[],
): string {
  const sections: string[] = [];

  sections.push('PROFESSIONAL DOCUMENTATION RECORD');
  sections.push(`Generated: ${new Date().toLocaleString()}`);
  sections.push('');

  sections.push('CLINICAL CONTEXT SUMMARY');
  sections.push('This record constitutes a professional documentation of nursing conditions and safety-relevant events as experienced by the reporting nurse. All observations and concerns herein reflect contemporaneous clinical assessment.');
  sections.push('');

  if (classification.matches.length > 0) {
    sections.push('DOCUMENTED SAFETY SIGNALS');
    for (const match of classification.matches) {
      sections.push(`\n[${match.riskCategory}]`);
      sections.push(match.translationFraming);
      if (match.crfStages.length > 0) {
        sections.push(`CRF Mapping: ${match.crfStages.join(', ')}`);
      }
      if (match.cmdsMechanisms.length > 0) {
        sections.push(`CMDS Mechanism(s): ${match.cmdsMechanisms.join(', ')}`);
      }
    }
    sections.push('');
  }

  if (escalations.length > 0) {
    sections.push('ESCALATION LOG');
    for (const esc of escalations) {
      const responseLabel = {
        resolved: 'Resolved',
        deferred: 'Deferred without resolution',
        denied: 'DENIED — institutional non-response documented',
        no_response: 'NO RESPONSE — escalation unacknowledged',
      }[esc.response];
      sections.push(`${esc.attemptTime} — Reported to: ${esc.reportedTo} — Response: ${responseLabel}`);
      if (esc.details) sections.push(`  Details: ${esc.details}`);
    }
    sections.push('');
  }

  if (checklistItems.length > 0) {
    sections.push('SAFETY CHECKLIST FLAGS');
    for (const item of checklistItems) {
      sections.push(`• ${item}`);
    }
    sections.push('');
  }

  sections.push('SEVERITY CLASSIFICATION');
  sections.push(`Tier: ${classification.severityTier.toUpperCase()}`);
  if (classification.autoHighRisk) {
    sections.push('AUTO HIGH-RISK FLAG: Mid-shift reassignment documented — non-removable flag per CRF framework.');
  }
  sections.push('');

  sections.push('APPLICABLE REGULATORY FRAMEWORK');
  const citationsToInclude = (() => {
    if (classification.severityTier === 'critical' || classification.severityTier === 'high') {
      return FEDERAL_CITATIONS;
    }
    if (classification.severityTier === 'moderate') {
      return FEDERAL_CITATIONS.filter(c => ['CMS_CoP', 'OSHA_GDC', 'ANA_CODE'].includes(c.id));
    }
    return FEDERAL_CITATIONS.filter(c => ['ANA_CODE'].includes(c.id));
  })();

  for (const citation of citationsToInclude) {
    sections.push(`${citation.label} (${citation.citation}): ${citation.description}`);
  }
  sections.push('');

  sections.push('DISCLOSURE');
  sections.push(DISCLOSURE);

  return sections.join('\n');
}
