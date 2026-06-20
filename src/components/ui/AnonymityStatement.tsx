interface AnonymityStatementProps {
  destination: 'pdf' | 'email' | 'bon' | 'legislature' | 'cms' | 'osha' | 'prismqd';
}

const STATEMENTS: Record<AnonymityStatementProps['destination'], { sent: string; notSent: string; who: string }> = {
  pdf: {
    sent: 'Your complete documentation record.',
    notSent: 'Nothing is transmitted. The PDF is generated entirely on your device.',
    who: 'No one. The file goes directly to your device.',
  },
  email: {
    sent: 'Your documentation record, sent directly from your email client.',
    notSent: 'SafeChart never sees this email. It is sent from your own email account.',
    who: 'Only the recipient you address it to.',
  },
  bon: {
    sent: 'Your structured complaint, including the facility name (required by the agency) and your name if you choose to include it.',
    notSent: 'Patient names, dates of birth, MRNs, or any patient identifier.',
    who: 'Your State Board of Nursing only.',
  },
  legislature: {
    sent: 'Your constituent communication and documentation summary. Facility and nurse name are optional.',
    notSent: 'Patient names, dates of birth, MRNs, or any patient identifier.',
    who: 'The legislators you select.',
  },
  cms: {
    sent: 'A CoP-aligned complaint. Facility name is required by CMS. Nurse name is optional.',
    notSent: 'Patient names, dates of birth, MRNs, or any patient identifier.',
    who: 'The Centers for Medicare and Medicaid Services.',
  },
  osha: {
    sent: 'An OSHA General Duty Clause complaint. Facility name is required. Nurse name is optional.',
    notSent: 'Patient names, dates of birth, MRNs, or any patient identifier.',
    who: 'The Occupational Safety and Health Administration.',
  },
  prismqd: {
    sent: 'An anonymized record: state, facility type, bed-size tier, shift type, unit type, role, and experience tier. No names. No free text without your review and confirmation.',
    notSent: 'Your name, the facility name, patient names, or any patient identifier.',
    who: 'PRISMqd researchers only, for aggregated occupational safety research. Never sold. Never shared with employers.',
  },
};

export default function AnonymityStatement({ destination }: AnonymityStatementProps) {
  const s = STATEMENTS[destination];
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
      <p className="font-semibold">What is sent:</p>
      <p>{s.sent}</p>
      <p className="font-semibold mt-1">What is not sent:</p>
      <p>{s.notSent}</p>
      <p className="font-semibold mt-1">Who can see it:</p>
      <p>{s.who}</p>
    </div>
  );
}
