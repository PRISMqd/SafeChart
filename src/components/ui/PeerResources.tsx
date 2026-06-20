interface PeerResourcesProps {
  severity: 'high' | 'critical';
}

export default function PeerResources({ severity }: PeerResourcesProps) {
  return (
    <div className="p-4 bg-sage bg-opacity-10 border border-sage rounded-xl space-y-3">
      <p className="font-heading font-bold text-navy text-sm">Professional and Legal Support Resources</p>
      <p className="text-xs text-gray-600">
        {severity === 'critical'
          ? 'Critical severity documentation has been generated. The following resources are available to support you professionally and legally.'
          : 'High severity documentation has been generated. Professional and legal support resources are available to you.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">Occupational Health</p>
          <p className="text-xs text-gray-600">Contact your facility's Employee Health / Occupational Health department for confidential support.</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">ANA Nurse Advocacy</p>
          <p className="text-xs text-gray-600">American Nurses Association workplace advocacy resources.</p>
          <a href="https://www.nursingworld.org/practice-policy/work-environment/" target="_blank" rel="noreferrer" className="text-teal text-xs underline">nursingworld.org →</a>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">Nurse Attorney Referral</p>
          <p className="text-xs text-gray-600">The American Association of Nurse Attorneys provides nurse attorney referrals.</p>
          <a href="https://www.taana.org/" target="_blank" rel="noreferrer" className="text-teal text-xs underline">taana.org →</a>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">Union / Labor Representation</p>
          <p className="text-xs text-gray-600">If your facility is unionized, contact your union representative. They can advise on grievance procedures and protected activity rights.</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">OSHA Whistleblower Program</p>
          <p className="text-xs text-gray-600">Workers have 30 days from a retaliatory action to file an OSHA complaint. Free. Confidential.</p>
          <a href="https://www.whistleblowers.gov" target="_blank" rel="noreferrer" className="text-teal text-xs underline">whistleblowers.gov →</a>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-navy mb-1">Crisis Line</p>
          <p className="text-xs text-gray-600">If you are in distress: 988 Suicide and Crisis Lifeline — call or text 988. Available 24/7.</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">These resources are offered as professional and legal support. This is not a mental health referral and does not imply clinical concern about you.</p>
    </div>
  );
}
