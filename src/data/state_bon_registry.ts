export interface StateBON {
  state: string;
  stateCode: string;
  boardName: string;
  website: string;
  phone: string;
  email?: string;
  complaintUrl: string;
  npaNotes: string;
}

export const STATE_BON_REGISTRY: StateBON[] = [
  {
    state: 'Alabama',
    stateCode: 'AL',
    boardName: 'Alabama Board of Nursing',
    website: 'https://www.abn.alabama.gov',
    phone: '(334) 293-5200',
    complaintUrl: 'https://www.abn.alabama.gov/complaint/',
    npaNotes: 'Alabama Nurse Practice Act — Title 34, Chapter 21. Nurses have a duty to report unsafe conditions.',
  },
  {
    state: 'Alaska',
    stateCode: 'AK',
    boardName: 'Alaska Board of Nursing',
    website: 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/BoardofNursing.aspx',
    phone: '(907) 465-2550',
    complaintUrl: 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/FilingaComplaint.aspx',
    npaNotes: 'Alaska Nurse Practice Act — AS 08.68. Safe assignment rights protected.',
  },
  {
    state: 'Arizona',
    stateCode: 'AZ',
    boardName: 'Arizona State Board of Nursing',
    website: 'https://www.azbn.gov',
    phone: '(602) 771-7800',
    email: 'arizona@azbn.gov',
    complaintUrl: 'https://www.azbn.gov/complaints/',
    npaNotes: 'Arizona Nurse Practice Act — ARS Title 32, Chapter 15. Staffing concerns are reportable.',
  },
  {
    state: 'Michigan',
    stateCode: 'MI',
    boardName: 'Michigan Board of Nursing',
    website: 'https://www.michigan.gov/lara/bureau-list/bpl/occ/health/nursing',
    phone: '(517) 335-0918',
    complaintUrl: 'https://www.michigan.gov/lara/bureau-list/bpl/occ/health/nursing/nursing-complaints',
    npaNotes: 'Michigan Public Health Code — Act 368 of 1978, Part 172. Nurses may document and report unsafe conditions.',
  },
  {
    state: 'California',
    stateCode: 'CA',
    boardName: 'California Board of Registered Nursing',
    website: 'https://www.rn.ca.gov',
    phone: '(916) 322-3350',
    complaintUrl: 'https://www.rn.ca.gov/enforcement/complaint.shtml',
    npaNotes: 'California Nursing Practice Act — BPC 2700 et seq. California has mandatory nurse-to-patient ratio laws (Title 22, CCR § 70217).',
  },
  {
    state: 'New York',
    stateCode: 'NY',
    boardName: 'New York State Board of Nursing',
    website: 'https://www.op.nysed.gov/professions/registered-professional-nursing',
    phone: '(518) 474-3817',
    complaintUrl: 'https://www.op.nysed.gov/complaints',
    npaNotes: 'New York Education Law Article 139. NY requires hospitals to have staffing committees with nurse participation.',
  },
  {
    state: 'Texas',
    stateCode: 'TX',
    boardName: 'Texas Board of Nursing',
    website: 'https://www.bon.texas.gov',
    phone: '(512) 305-7400',
    complaintUrl: 'https://www.bon.texas.gov/complaints_and_investigations_overview.asp',
    npaNotes: 'Texas Nursing Practice Act — Occupations Code, Chapter 301. Texas has a nurse staffing law (Health & Safety Code, Chapter 257).',
  },
  {
    state: 'Florida',
    stateCode: 'FL',
    boardName: 'Florida Board of Nursing',
    website: 'https://floridasnursing.gov',
    phone: '(850) 488-0595',
    complaintUrl: 'https://floridasnursing.gov/complaints/',
    npaNotes: 'Florida Nurse Practice Act — Chapter 464, Florida Statutes. Nurses have mandatory reporting obligations for unsafe conditions.',
  },
];

export const BUILD_NOTE = 'Registry seeded with 8 states for Phase 1. Full 50-state expansion in Phase 2.';
