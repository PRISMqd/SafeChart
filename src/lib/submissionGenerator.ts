import type { ClassificationResult, EscalationRecord } from '../types';

export interface SubmissionData {
  freeText: string;
  translated: string;
  classification: ClassificationResult | null;
  escalations: EscalationRecord[];
  checklistItems: string[];
  eventType: string;
  sessionTimestamp: string;
  // Phase 2
  residualRisk: Record<string, string> | null;
  sitter: Record<string, unknown> | null;
  ari: Record<string, unknown> | null;
  retaliation: Record<string, unknown> | null;
  internalChain: Record<string, { response: string; reportedAt?: string; details?: string }> | null;
}

export function loadSubmissionData(): SubmissionData {
  const freeText = localStorage.getItem('sc_freetext') || '';
  const translated = localStorage.getItem('sc_translated') || '';
  const eventType = localStorage.getItem('sc_event_type') || '';
  const sessionTimestamp = localStorage.getItem('sc_session_start') || new Date().toISOString();

  let classification: ClassificationResult | null = null;
  let escalations: EscalationRecord[] = [];
  let checklistItems: string[] = [];
  let residualRisk: Record<string, string> | null = null;
  let sitter: Record<string, unknown> | null = null;
  let ari: Record<string, unknown> | null = null;
  let retaliation: Record<string, unknown> | null = null;
  let internalChain: Record<string, { response: string; reportedAt?: string; details?: string }> | null = null;

  const tryParse = (key: string) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };

  escalations = tryParse('sc_escalations') || [];
  checklistItems = tryParse('sc_checklist_text') || [];
  residualRisk = tryParse('sc_residual_risk');
  sitter = tryParse('sc_sitter');
  ari = tryParse('sc_ari');
  retaliation = tryParse('sc_retaliation');
  internalChain = tryParse('sc_internal_chain');

  return { freeText, translated, classification, escalations, checklistItems, eventType, sessionTimestamp, residualRisk, sitter, ari, retaliation, internalChain };
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
}

function escalationSummary(escalations: EscalationRecord[]): string {
  if (!escalations.length) return 'No formal escalation attempts were documented.';
  return escalations.map(e => {
    const resp = { resolved: 'Resolved', deferred: 'Deferred without resolution', denied: 'DENIED — institutional non-response', no_response: 'NO RESPONSE — escalation unacknowledged' }[e.response] || e.response;
    const witness = (e as unknown as Record<string, unknown>).witness ? `\n    Witness: ${(e as unknown as Record<string, unknown>).witness}` : '';
    return `  • ${e.attemptTime} — Reported to: ${e.reportedTo} — Response: ${resp}${e.details ? `\n    Details: ${e.details}` : ''}${witness}`;
  }).join('\n');
}

function checklistSummary(items: string[]): string {
  if (!items.length) return '';
  return items.map(i => `  • ${i}`).join('\n');
}

function internalChainSummary(chain: Record<string, { response: string; reportedAt?: string; details?: string }>): string {
  const levels = Object.entries(chain).filter(([, v]) => v.response);
  if (!levels.length) return '';
  return levels.map(([level, v]) => {
    const resp = { acknowledged: 'Acknowledged', deferred: 'Deferred', denied: 'DENIED', no_response: 'NO RESPONSE' }[v.response] || v.response;
    return `  • ${level}${v.reportedAt ? ` (${v.reportedAt})` : ''}: ${resp}${v.details ? ` — ${v.details}` : ''}`;
  }).join('\n');
}

function residualRiskSection(rr: Record<string, string>): string {
  const lines: string[] = ['RESIDUAL RISK DOCUMENTATION'];
  lines.push(`Risk Level: ${(rr.residualRiskLevel || '').toUpperCase()}`);
  if (rr.outstandingConcerns) lines.push(`Outstanding Concerns: ${rr.outstandingConcerns}`);
  if (rr.patientsAffected) lines.push(`Patients Affected: ${rr.patientsAffected}`);
  if (rr.conditionStartTime) lines.push(`Unsafe Condition Began: ${rr.conditionStartTime}`);
  if (rr.interimSafeguards) lines.push(`Interim Safeguards Implemented: ${rr.interimSafeguards}`);
  if (rr.anticipatedResolution) lines.push(`Anticipated Resolution: ${rr.anticipatedResolution}`);
  return lines.join('\n');
}

function sitterSection(s: Record<string, unknown>): string {
  const lines: string[] = ['SAFETY ATTENDANT DOCUMENTATION'];
  if (Array.isArray(s.monitoringNeeds) && s.monitoringNeeds.length) {
    lines.push(`Monitoring Need(s): ${s.monitoringNeeds.join(', ')}${s.monitoringNeedOther ? ` — ${s.monitoringNeedOther}` : ''}`);
  }
  lines.push(`Sitter Assigned at Start of Shift: ${s.sitterAssignedAtStart === true ? 'Yes' : s.sitterAssignedAtStart === false ? 'No' : 'Not documented'}`);
  if (s.sitterRemovedOrDenied) {
    lines.push(`Safety Attendant Removed or Request Denied: YES`);
    if (s.removalTime) lines.push(`  Time of Removal/Denial: ${s.removalTime}`);
    if (s.removedByRole) lines.push(`  Decision Made By: ${s.removedByRole}`);
    if (s.reasonGiven) lines.push(`  Reason Given: ${s.reasonGiven}`);
    if (s.timeWithoutCoverage) lines.push(`  Time Without Coverage: ${s.timeWithoutCoverage}`);
    if (s.nurseObjection) lines.push(`  Nurse's Documented Objection: ${s.nurseObjection}`);
  }
  if (s.patientOutcome) lines.push(`Patient Outcome: ${s.patientOutcome}`);
  return lines.join('\n');
}

function ariSection(a: Record<string, unknown>): string {
  const lines: string[] = ['ADVERSE RESPONSE INDEX (ARI) — Professional Conditions Assessment'];
  lines.push(`ARI Level: ${(a.ariLevel as string || '').toUpperCase()}`);
  if (a.scores && typeof a.scores === 'object') {
    const LABELS = ['None', 'Mild', 'Significant'];
    const DOMAIN_NAMES: Record<string, string> = {
      cognitive_load: 'Cognitive Load',
      fatigue: 'Fatigue Status',
      moral_distress: 'Moral Distress',
      retaliation_fear: 'Fear of Retaliation',
      physical_capacity: 'Physical Capacity',
    };
    for (const [id, score] of Object.entries(a.scores as Record<string, number>)) {
      if (score !== undefined) {
        lines.push(`  ${DOMAIN_NAMES[id] || id}: ${LABELS[score] || score}`);
      }
    }
  }
  if (a.additionalContext) lines.push(`Additional Context: ${a.additionalContext}`);
  lines.push('NOTE: ARI documents assignment conditions at the time of documentation, not a clinical fitness determination.');
  return lines.join('\n');
}

function retaliationSection(r: Record<string, unknown>): string {
  const lines: string[] = ['RETALIATION DOCUMENTATION'];
  if (r.flaggedAt) lines.push(`Flagged: ${formatDate(r.flaggedAt as string)}`);
  if (Array.isArray(r.indicators) && r.indicators.length) {
    lines.push('Indicators:');
    r.indicators.forEach((i: string) => lines.push(`  • ${i}`));
  }
  if (r.details) lines.push(`Details: ${r.details}`);
  lines.push('Whistleblower Protection: 29 CFR Part 1977 — Report retaliation to OSHA within 30 days. Call 1-800-321-6742.');
  return lines.join('\n');
}

// ─── BON ────────────────────────────────────────────────────────────────────

export function generateBONComplaint(data: SubmissionData, boardName: string, _state: string, npaNotes: string): string {
  const date = formatDate(new Date().toISOString());
  const lines: string[] = [
    `NURSE PRACTICE ACT COMPLAINT`,
    `Submitted to: ${boardName}`,
    `Date: ${date}`,
    ``,
    `TO THE BOARD OF NURSING:`,
    ``,
    `I am a registered nurse submitting this formal complaint regarding unsafe assignment conditions that occurred during my nursing practice. This complaint is submitted pursuant to my professional and ethical obligations under the Nurse Practice Act and the ANA Code of Ethics.`,
    ``,
    `INCIDENT NARRATIVE`,
    data.freeText.trim() || '(Narrative not entered — see attached documentation)',
    ``,
  ];

  if (data.checklistItems.length > 0) {
    lines.push('DOCUMENTED SAFETY CONDITIONS');
    lines.push(checklistSummary(data.checklistItems));
    lines.push('');
  }

  if (data.internalChain) {
    const summary = internalChainSummary(data.internalChain);
    if (summary) {
      lines.push('INTERNAL CHAIN OF COMMAND REPORTING');
      lines.push(summary);
      lines.push('');
    }
  }

  if (data.escalations.length > 0) {
    lines.push('ESCALATION ATTEMPTS');
    lines.push(escalationSummary(data.escalations));
    lines.push('');
  }

  if (data.residualRisk) {
    lines.push(residualRiskSection(data.residualRisk));
    lines.push('');
  }

  if (data.sitter) {
    lines.push(sitterSection(data.sitter));
    lines.push('');
  }

  if (data.ari) {
    lines.push(ariSection(data.ari));
    lines.push('');
  }

  if (data.retaliation) {
    lines.push(retaliationSection(data.retaliation));
    lines.push('');
  }

  lines.push('APPLICABLE STATUTORY AUTHORITY');
  lines.push(npaNotes);
  lines.push('');
  lines.push('ANA Code of Ethics, Provisions 3 and 6: The nurse must promote, advocate for, and protect the rights and health of the patient. The nurse must practice ethically and must work to maintain patient safety and a safe practice environment.');
  lines.push('');
  lines.push('REQUESTED ACTION');
  lines.push('I respectfully request that the Board investigate the conditions documented herein, take appropriate action consistent with its statutory authority, and notify me of the outcome of this complaint.');
  lines.push('');
  lines.push('This documentation was created contemporaneously with the events described. All statements are accurate to the best of my professional knowledge and judgment.');
  lines.push('');
  lines.push(`Submitted: ${date}`);
  lines.push('');
  lines.push('DISCLOSURE: SafeChart is a professional documentation support tool. It does not constitute legal advice. This submission is the nurse\'s own professional documentation. PRISMqd did not submit this on the nurse\'s behalf.');

  return lines.join('\n');
}

// ─── Legislature ─────────────────────────────────────────────────────────────

export function generateLegislatorLetter(data: SubmissionData, state: string): string {
  const date = formatDate(new Date().toISOString());
  const lines: string[] = [
    `CONSTITUENT COMMUNICATION REGARDING NURSE STAFFING SAFETY`,
    `Date: ${date}`,
    `State: ${state}`,
    ``,
    `Dear Representative / Senator,`,
    ``,
    `I am writing to you as your constituent and as a registered nurse to document unsafe staffing conditions I have experienced and to request your attention to this matter as it affects patient safety across our state.`,
    ``,
    `INCIDENT DOCUMENTATION`,
    data.freeText.trim() || '(See attached documentation)',
    ``,
  ];

  if (data.checklistItems.length > 0) {
    lines.push('DOCUMENTED SAFETY CONDITIONS');
    lines.push(checklistSummary(data.checklistItems));
    lines.push('');
  }

  if (data.escalations.length > 0) {
    lines.push('ESCALATION ATTEMPTS AND INSTITUTIONAL RESPONSE');
    lines.push(escalationSummary(data.escalations));
    lines.push('');
  }

  if (data.residualRisk) {
    lines.push(residualRiskSection(data.residualRisk));
    lines.push('');
  }

  lines.push('LEGAL CONTEXT');
  lines.push('Unsafe nurse staffing conditions implicate the following federal frameworks:');
  lines.push('  • 42 CFR § 482 (CMS Conditions of Participation) — hospitals must maintain adequate nursing staff');
  lines.push('  • 29 U.S.C. § 654(a)(1) (OSHA General Duty Clause) — employers must provide workplaces free from recognized hazards');
  lines.push('  • 29 U.S.C. § 157 (NLRA Section 7) — nurses have the right to engage in concerted activity for mutual aid and protection');
  lines.push('');
  lines.push('REQUEST');
  lines.push('I respectfully request that you:');
  lines.push('  1. Review this documentation as evidence of systemic unsafe staffing conditions in our state.');
  lines.push('  2. Consider legislative action to establish minimum nurse-to-patient staffing ratios.');
  lines.push('  3. Support funding and regulatory mechanisms that protect patients and nurses from unsafe assignment conditions.');
  lines.push('');
  lines.push('I am available to discuss this matter further and can provide additional documentation upon request. This record was created contemporaneously and is available to your office in its entirety.');
  lines.push('');
  lines.push(`Respectfully submitted,`);
  lines.push(`A constituent and registered nurse in ${state}`);
  lines.push(`(Contact information available upon request)`);

  return lines.join('\n');
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

export function generateCMSComplaint(data: SubmissionData): string {
  const date = formatDate(new Date().toISOString());
  const lines: string[] = [
    `CMS CONDITIONS OF PARTICIPATION COMPLAINT`,
    `Date: ${date}`,
    `Regulatory Basis: 42 CFR § 482 — Medicare Conditions of Participation`,
    ``,
    `TO: Centers for Medicare and Medicaid Services`,
    `RE: Hospital Conditions of Participation Complaint — Nursing Services`,
    ``,
    `I am submitting this complaint regarding conditions at my facility that I believe constitute violations of the Medicare Conditions of Participation (42 CFR § 482), specifically nursing services standards under § 482.23.`,
    ``,
    `FACILITY INFORMATION`,
    `Facility Name: [ENTER FACILITY NAME]`,
    `Facility Address: [ENTER FACILITY ADDRESS]`,
    `Facility Type: [ENTER TYPE: Hospital / Critical Access Hospital / etc.]`,
    ``,
    `INCIDENT DESCRIPTION`,
    data.freeText.trim() || '(Narrative not entered — see attached documentation)',
    ``,
  ];

  if (data.checklistItems.length > 0) {
    lines.push('SPECIFIC CONDITIONS DOCUMENTED');
    lines.push(checklistSummary(data.checklistItems));
    lines.push('');
  }

  if (data.internalChain) {
    const summary = internalChainSummary(data.internalChain);
    if (summary) {
      lines.push('INTERNAL CHAIN OF COMMAND REPORTING');
      lines.push(summary);
      lines.push('');
    }
  }

  if (data.escalations.length > 0) {
    lines.push('INTERNAL ESCALATION ATTEMPTS');
    lines.push(escalationSummary(data.escalations));
    lines.push('');
  }

  if (data.residualRisk) {
    lines.push(residualRiskSection(data.residualRisk));
    lines.push('');
  }

  if (data.sitter) {
    lines.push(sitterSection(data.sitter));
    lines.push('');
  }

  lines.push('APPLICABLE REGULATORY STANDARDS');
  lines.push('42 CFR § 482.23(b) — The nursing service must have adequate numbers of licensed registered nurses, licensed practical (vocational) nurses, and other personnel to provide nursing care to all patients as needed.');
  lines.push('42 CFR § 482.23(b)(5) — The hospital must ensure that the nursing staff is adequate for the care of all inpatients.');
  lines.push('42 CFR § 482.13 — Patient rights: the hospital must protect and promote each patient\'s rights.');
  lines.push('');
  lines.push('REQUESTED ACTION');
  lines.push('I request that CMS or the designated State Survey Agency investigate the above-described conditions for compliance with 42 CFR § 482 and take appropriate corrective action.');
  lines.push('');
  lines.push('CONTACT INFORMATION');
  lines.push('Complainant contact: [YOUR PREFERRED CONTACT METHOD — telephone complaint: 1-800-633-4227]');
  lines.push('');
  lines.push(`Date of this complaint: ${date}`);

  return lines.join('\n');
}

// ─── OSHA ─────────────────────────────────────────────────────────────────────

export function generateOSHAComplaint(data: SubmissionData): string {
  const date = formatDate(new Date().toISOString());
  const lines: string[] = [
    `OSHA GENERAL DUTY CLAUSE COMPLAINT`,
    `Date: ${date}`,
    `Regulatory Basis: 29 U.S.C. § 654(a)(1) — General Duty Clause`,
    ``,
    `TO: Occupational Safety and Health Administration`,
    ``,
    `I am submitting this complaint regarding workplace safety conditions at my facility. The conditions described below constitute a recognized hazard under the OSHA General Duty Clause (29 U.S.C. § 654(a)(1)), which requires employers to furnish a workplace free from recognized hazards that are causing or are likely to cause death or serious physical harm.`,
    ``,
    `EMPLOYER INFORMATION`,
    `Employer / Facility Name: [ENTER FACILITY NAME]`,
    `Facility Address: [ENTER ADDRESS]`,
    `Type of Work: Inpatient hospital nursing`,
    ``,
    `HAZARD DESCRIPTION`,
    `Hazard Type: Unsafe nurse staffing ratios — recognized hazard under OSHA guidelines and occupational health literature (Rogers et al. 2004, Health Affairs; Aiken et al. 2014, The Lancet)`,
    ``,
    data.freeText.trim() || '(Incident narrative not entered — see attached documentation)',
    ``,
  ];

  if (data.checklistItems.length > 0) {
    lines.push('SPECIFIC HAZARD CONDITIONS DOCUMENTED');
    lines.push(checklistSummary(data.checklistItems));
    lines.push('');
  }

  if (data.internalChain) {
    const summary = internalChainSummary(data.internalChain);
    if (summary) {
      lines.push('INTERNAL CHAIN OF COMMAND REPORTING');
      lines.push(summary);
      lines.push('');
    }
  }

  if (data.escalations.length > 0) {
    lines.push('INTERNAL REPORTING ATTEMPTS');
    lines.push('The following internal escalation attempts were made prior to this OSHA complaint:');
    lines.push(escalationSummary(data.escalations));
    lines.push('');
  }

  if (data.residualRisk) {
    lines.push(residualRiskSection(data.residualRisk));
    lines.push('');
  }

  if (data.ari) {
    lines.push(ariSection(data.ari));
    lines.push('');
  }

  if (data.retaliation) {
    lines.push(retaliationSection(data.retaliation));
    lines.push('');
  }

  lines.push('BASIS FOR COMPLAINT');
  lines.push('  • The hazard is recognized: Unsafe nurse staffing ratios are documented in peer-reviewed literature as a recognized hazard causing increased risk of patient harm and nurse injury.');
  lines.push('  • The employer had knowledge: Escalation attempts were made (see above) and were denied, deferred, or received no response.');
  lines.push('  • Feasible abatement exists: Adequate staffing ratios are feasible and practiced in compliant facilities.');
  lines.push('  • The hazard is causing or likely to cause serious harm: Staffing conditions documented above create conditions for failure-to-rescue events and nurse injury.');
  lines.push('');
  lines.push('WHISTLEBLOWER PROTECTIONS');
  lines.push('I am aware that 29 CFR Part 1977 protects employees from retaliation for filing OSHA complaints. Any adverse action taken against me within 30 days of this complaint should be reported immediately to OSHA.');
  lines.push('');
  lines.push(`Date of this complaint: ${date}`);
  lines.push('OSHA Hotline: 1-800-321-6742');

  return lines.join('\n');
}

// ─── Zip → Rep URL ────────────────────────────────────────────────────────────

const ZIP_REP_URLS: Partial<Record<string, (zip: string) => string>> = {
  AL: (z) => `https://www.legislature.state.al.us/aliswww/ISD/ALFindMyRep.aspx?zip=${z}`,
  AZ: (z) => `https://azleg.gov/find-my-legislator/?zip=${z}`,
  CA: (z) => `https://findyourrep.legislature.ca.gov/?zip=${z}`,
  CO: (z) => `https://leg.colorado.gov/find-my-legislators?zip=${z}`,
  FL: (z) => `https://www.flsenate.gov/Senators/Find?zipcode=${z}`,
  GA: (z) => `https://www.legis.ga.gov/api/members/district/findbyaddress?zip=${z}`,
  IL: (z) => `https://www.ilga.gov/mylegislator/mylegislator.asp?zip=${z}`,
  IN: (z) => `https://iga.in.gov/legislative/2024/legislators/find/?zipcode=${z}`,
  KY: (z) => `https://legislature.ky.gov/Legislators/Pages/legislator-directory.aspx?zip=${z}`,
  MD: (z) => `https://mgaleg.maryland.gov/mgawebsite/Members/Address?zip=${z}`,
  MI: (z) => `https://www.legislature.mi.gov/Tools/MyRepresentative?zip=${z}`,
  MN: (z) => `https://www.house.mn.gov/members/find?ZIP=${z}`,
  MO: (z) => `https://www.house.mo.gov/member.aspx?zip=${z}`,
  NJ: (z) => `https://www.njleg.state.nj.us/legislatorsweb/findmyrep.asp?zip=${z}`,
  NY: (z) => `https://www.nysenate.gov/find-my-senator?address=${z}`,
  NC: (z) => `https://www.ncleg.gov/Find?zip=${z}`,
  OH: (z) => `https://www.legislature.ohio.gov/legislators/find-a-legislator?zip=${z}`,
  OR: (z) => `https://www.oregonlegislature.gov/findyourlegislator/legislatorfinder.aspx?zip=${z}`,
  PA: (z) => `https://www.legis.state.pa.us/cfdocs/legis/home/findyourrep/findForm.cfm?zip=${z}`,
  TN: (z) => `https://www.capitol.tn.gov/legislators/find/?zip=${z}`,
  TX: (z) => `https://wrm.capitol.texas.gov/home?zip=${z}`,
  VA: (z) => `https://virginiageneralassembly.gov/house/members.php?zip=${z}`,
  WA: (z) => `https://app.leg.wa.gov/DistrictFinder/?zip=${z}`,
  WI: (z) => `https://legis.wisconsin.gov/findmylegislator/?zip=${z}`,
};

export function getRepFinderUrl(stateCode: string, zip: string): string | null {
  const fn = ZIP_REP_URLS[stateCode];
  return fn ? fn(zip.trim()) : null;
}

export function getFallbackRepUrl(legislatureUrl: string, _zip: string): string {
  return legislatureUrl;
}
