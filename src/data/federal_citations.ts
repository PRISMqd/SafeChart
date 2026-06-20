import type { FederalCitation } from '../types';

export const federalCitations: FederalCitation[] = [
  {
    id: 'EMTALA',
    name: 'Emergency Medical Treatment and Labor Act',
    citation: '42 U.S.C. § 1395dd',
    source_url: 'https://www.cms.gov/medicare/emergency-medical-treatment-labor-act',
    neutral_citation_phrase: 'EMTALA requires medical screening and stabilization before transfer or discharge.',
    requires_for_submissions: ['CMS', 'BON'],
    key_duties: [
      'Medical screening exam for anyone presenting to the ED',
      'Stabilization before transfer or discharge',
      'No delay based on ability to pay, custody status, or law enforcement presence',
    ],
    common_violations: [
      'Delayed screening due to overcrowding or diversion',
      'Transfer without stabilization',
      'Interference by law enforcement before medical clearance',
    ],
  },
  {
    id: 'CMS_CoP',
    name: 'CMS Conditions of Participation for Hospitals',
    citation: '42 CFR § 482',
    source_url: 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482',
    neutral_citation_phrase: 'CMS Conditions of Participation require adequate staffing and timely care.',
    requires_for_submissions: ['CMS'],
    key_duties: [
      'Adequate staffing to meet patient needs',
      'Nursing services organized to ensure patient safety',
      'Timely response to changes in patient condition',
    ],
    common_violations: [
      'Chronic understaffing normalized as routine',
      'Delayed interventions due to unsafe ratios',
      'Reliance on unpaid workarounds',
    ],
  },
  {
    id: 'OSHA_GDC',
    name: 'OSHA General Duty Clause',
    citation: '29 U.S.C. § 654(a)(1)',
    source_url: 'https://www.osha.gov/laws-regs/oshact/section5-duties',
    neutral_citation_phrase: 'The OSHA General Duty Clause requires mitigation of recognized safety hazards.',
    requires_for_submissions: ['OSHA'],
    key_duties: [
      'Workplace free from recognized hazards likely to cause serious harm',
    ],
    common_violations: [
      'Forced acceptance of unsafe assignments',
      'Lack of PPE or violence prevention measures',
      'Retaliation for raising safety concerns',
    ],
  },
  {
    id: 'ANA_CODE',
    name: 'ANA Code of Ethics for Nurses',
    citation: 'American Nurses Association Code of Ethics, 2015, Provisions 3 and 6',
    source_url: 'https://www.nursingworld.org/practice-policy/nursing-excellence/ethics/code-of-ethics-for-nurses/',
    neutral_citation_phrase: 'ANA Code of Ethics Provisions 3 and 6 require nurses to advocate for patient safety and maintain an ethical work environment.',
    requires_for_submissions: ['BON', 'PRISMqd'],
    key_duties: [
      'Provision 3: Nurses promote, advocate for, and protect the rights, health, and safety of the patient',
      'Provision 6: The nurse, through individual and collective effort, establishes, maintains, and improves the ethical environment of the work setting',
    ],
    common_violations: [
      'Pressure to accept unsafe assignments',
      'Threats or retaliation for raising concerns',
      'Documentation that masks understaffing harm',
    ],
  },
  {
    id: 'NLRA_S7',
    name: 'National Labor Relations Act Section 7',
    citation: '29 U.S.C. § 157',
    source_url: 'https://www.nlrb.gov/guidance/key-reference-materials/national-labor-relations-act',
    neutral_citation_phrase: 'NLRA Section 7 protects collective action by employees to improve working conditions.',
    requires_for_submissions: ['OSHA', 'legislator'],
    key_duties: [
      'Employees have the right to act collectively to improve working conditions',
      'Employers may not retaliate for protected concerted activity',
    ],
    common_violations: [],
  },
  {
    id: 'WHISTLEBLOWER',
    name: 'OSHA Whistleblower Protection Program',
    citation: '29 CFR Part 1977',
    source_url: 'https://www.whistleblowers.gov',
    neutral_citation_phrase: 'Federal whistleblower protections prohibit retaliation for reporting unsafe workplace conditions.',
    requires_for_submissions: ['OSHA', 'BON'],
    key_duties: [
      'Employees protected from retaliation for reporting unsafe conditions',
      'Retaliation includes termination, demotion, suspension, harassment, or reduction in hours',
    ],
    common_violations: [],
  },
];

export const submissionDestinationCitationMap: Record<string, string[]> = {
  PRISMqd: ['CMS_CoP', 'OSHA_GDC'],
  BON: ['ANA_CODE', 'WHISTLEBLOWER'],
  CMS: ['CMS_CoP', 'EMTALA'],
  OSHA: ['OSHA_GDC', 'NLRA_S7', 'WHISTLEBLOWER'],
  legislator: ['CMS_CoP', 'OSHA_GDC', 'NLRA_S7'],
  download: [],
  email: [],
};

export function getCitationsForDestination(destination: string): FederalCitation[] {
  const ids = submissionDestinationCitationMap[destination];
  if (!ids) return [];
  return federalCitations.filter(c => ids.includes(c.id));
}
