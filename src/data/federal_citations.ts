export interface FederalCitation {
  id: string;
  label: string;
  citation: string;
  description: string;
}

export const FEDERAL_CITATIONS: FederalCitation[] = [
  {
    id: "EMTALA",
    label: "EMTALA",
    citation: "42 U.S.C. § 1395dd",
    description: "Emergency Medical Treatment and Active Labor Act — requires hospitals to provide emergency care regardless of ability to pay; relevant to safe staffing in emergency contexts.",
  },
  {
    id: "CMS_CoP",
    label: "CMS Conditions of Participation",
    citation: "42 CFR § 482",
    description: "Medicare Conditions of Participation — establishes staffing adequacy requirements for hospitals participating in Medicare/Medicaid; includes nursing services standards.",
  },
  {
    id: "OSHA_GDC",
    label: "OSHA General Duty Clause",
    citation: "29 U.S.C. § 654(a)(1)",
    description: "OSHA General Duty Clause — requires employers to furnish a workplace free from recognized hazards; applicable to unsafe nurse staffing conditions.",
  },
  {
    id: "ANA_CODE",
    label: "ANA Code of Ethics",
    citation: "ANA Code of Ethics, Provisions 3 and 6",
    description: "American Nurses Association Code of Ethics — Provision 3 addresses protection of patient rights; Provision 6 addresses the nurse duty to maintain safe practice environments.",
  },
  {
    id: "NLRA_S7",
    label: "NLRA Section 7",
    citation: "29 U.S.C. § 157",
    description: "National Labor Relations Act Section 7 — protects nurses rights to engage in concerted activity for mutual aid and protection, including collective advocacy for safe staffing.",
  },
  {
    id: "WHISTLEBLOWER",
    label: "Whistleblower Protections",
    citation: "29 CFR Part 1977",
    description: "OSHA Whistleblower Protection Program — protects healthcare workers from retaliation for reporting unsafe working conditions or patient safety concerns.",
  },
];
