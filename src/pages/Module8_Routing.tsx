import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import AnonymityStatement from '../components/ui/AnonymityStatement';
import { STATE_BON_REGISTRY } from '../data/state_bon_registry';
import { FEDERAL_CITATIONS } from '../data/federal_citations';
import { exportPDF } from '../lib/pdfExport';
import { logAudit } from '../lib/auditTrail';

const DESTINATIONS = [
  {
    id: 'bon',
    label: 'State Board of Nursing',
    icon: '🏛️',
    description: 'Submit a concern to your State Board of Nursing. Each BON has jurisdiction over safe practice standards under your state Nurse Practice Act.',
    citations: ['ANA_CODE'],
  },
  {
    id: 'legislature',
    label: 'State Legislature',
    icon: '📜',
    description: 'Contact your state legislators as a constituent regarding unsafe nurse staffing conditions. Legislators respond to constituent documentation.',
    citations: ['NLRA_S7'],
  },
  {
    id: 'cms',
    label: 'CMS Complaint',
    icon: '🏥',
    description: 'File a complaint with the Centers for Medicare and Medicaid Services regarding Conditions of Participation violations at your facility.',
    citations: ['CMS_CoP', 'EMTALA'],
  },
  {
    id: 'osha',
    label: 'OSHA Complaint',
    icon: '⚠️',
    description: 'File a complaint with OSHA under the General Duty Clause regarding recognized workplace hazards from unsafe staffing conditions.',
    citations: ['OSHA_GDC', 'WHISTLEBLOWER'],
  },
  {
    id: 'prismqd',
    label: 'PRISMqd Dataset',
    icon: '🔬',
    description: 'Submit anonymized data to the PRISMqd nurse safety dataset for aggregated research.',
    disabled: true,
    disabledNote: 'Privacy policy review pending — available in Phase 2',
    citations: [] as string[],
  },
];

export default function Module8_Routing() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState('');

  const toggle = (id: string) => {
    const dest = DESTINATIONS.find(d => d.id === id);
    if (dest && 'disabled' in dest && dest.disabled) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bon = STATE_BON_REGISTRY.find(s => s.stateCode === selectedState);

  const handleDownloadPDF = () => {
    const freeText = localStorage.getItem('sc_freetext') || '';
    const translated = localStorage.getItem('sc_translated') || freeText;
    exportPDF(freeText || '(No narrative)', translated || '(No translated record)', new Date().toLocaleString());
    logAudit('PDF_DOWNLOADED_MODULE8');
  };

  const mailtoSelf = `mailto:?subject=SafeChart Documentation&body=${encodeURIComponent(localStorage.getItem('sc_freetext') || '')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 8: Report &amp; Submission</h1>
        <p className="text-gray-600 mt-1 font-body">Select your submission destinations. Your documentation is only sent when you choose to send it.</p>
      </div>

      {/* Global state selector */}
      <Card>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Select Your State</label>
        <select
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">-- Select State --</option>
          {STATE_BON_REGISTRY.map(s => (
            <option key={s.stateCode} value={s.stateCode}>{s.state}</option>
          ))}
        </select>
      </Card>

      {/* Destination cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DESTINATIONS.map(dest => {
          const isDisabled = 'disabled' in dest && dest.disabled;
          const isSelected = selected.has(dest.id);
          return (
            <div
              key={dest.id}
              onClick={() => toggle(dest.id)}
              className={`rounded-xl border-2 p-5 transition-all ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'border-teal bg-teal bg-opacity-5 cursor-pointer'
                  : 'border-gray-200 bg-white cursor-pointer hover:border-teal'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">{dest.icon}</span>
                  <div>
                    <p className="font-heading font-bold text-navy text-base">{dest.label}</p>
                    <p className="text-sm text-gray-600 mt-1 font-body">{dest.description}</p>
                  </div>
                </div>
                {!isDisabled && (
                  <input type="checkbox" checked={isSelected} readOnly className="mt-1 w-4 h-4 accent-teal shrink-0" />
                )}
              </div>
              {'disabledNote' in dest && dest.disabledNote && (
                <p className="text-xs text-gray-500 mt-2 font-medium">{dest.disabledNote}</p>
              )}

              {dest.citations.length > 0 && isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicable Authority</p>
                  {dest.citations.map(cid => {
                    const citation = FEDERAL_CITATIONS.find(c => c.id === cid);
                    if (!citation) return null;
                    return (
                      <div key={cid}>
                        <Badge variant="navy">{citation.label}</Badge>
                        <p className="text-xs font-semibold text-gray-700 mt-1">{citation.citation}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{citation.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-destination contact panels */}
      {selected.size > 0 && (
        <div className="space-y-4">

          {selected.has('bon') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-3">🏛️ State Board of Nursing{bon ? ` — ${bon.state}` : ''}</h2>
              {bon ? (
                <div className="bg-warm rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-navy">{bon.boardName}</p>
                  <p className="text-sm text-gray-700">Phone: <span className="font-medium">{bon.phone}</span></p>
                  {bon.email && <p className="text-sm text-gray-700">Email: <a href={`mailto:${bon.email}`} className="text-teal underline">{bon.email}</a></p>}
                  <a href={bon.website} target="_blank" rel="noreferrer" className="text-teal text-sm underline block">Board Website →</a>
                  <a href={bon.complaintUrl} target="_blank" rel="noreferrer" className="text-teal text-sm underline block font-semibold">File a Complaint →</a>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applicable Statutory Authority</p>
                    <p className="text-xs text-gray-700">{bon.npaNotes}</p>
                  </div>
                  <AnonymityStatement destination="bon" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select your state above to see your Board of Nursing contact information.</p>
              )}
            </Card>
          )}

          {selected.has('legislature') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-3">📜 State Legislature{bon ? ` — ${bon.state}` : ''}</h2>
              {bon ? (
                <div className="bg-warm rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700">Contact your state legislators directly as a constituent. Constituent documentation of unsafe staffing conditions informs legislative action on nurse staffing ratios.</p>
                  <a href={bon.legislatureUrl} target="_blank" rel="noreferrer" className="text-teal text-sm underline block font-semibold">Find Your {bon.state} Legislators →</a>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applicable Authority</p>
                    <p className="text-xs text-gray-700">29 U.S.C. § 157 (NLRA Section 7) — Protects nurses' rights to engage in concerted activity for mutual aid and protection, including collective advocacy for safe staffing legislation.</p>
                  </div>
                  <AnonymityStatement destination="legislature" />
                </div>
              ) : (
                <div className="bg-warm rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">Contact your state legislators as a constituent regarding unsafe nurse staffing conditions.</p>
                  <p className="text-sm text-gray-500">Select your state above to find your legislators.</p>
                </div>
              )}
            </Card>
          )}

          {selected.has('cms') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-3">🏥 CMS Complaint</h2>
              <div className="bg-warm rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700">CMS complaints regarding hospital Conditions of Participation are filed through the CMS hotline or your state survey agency. CMS investigates all facilities receiving Medicare and Medicaid funding.</p>
                <a href="https://www.medicare.gov/care-compare/" target="_blank" rel="noreferrer" className="text-teal text-sm underline block">CMS Care Compare — facility lookup →</a>
                <a href="https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/Hospitals" target="_blank" rel="noreferrer" className="text-teal text-sm underline block font-semibold">File CMS Hospital Complaint →</a>
                <p className="text-sm text-gray-700 pt-1">CMS Hotline: <span className="font-medium">1-800-MEDICARE (1-800-633-4227)</span></p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applicable Authority</p>
                  <p className="text-xs text-gray-700">42 CFR § 482 (CMS Conditions of Participation) — Establishes staffing adequacy requirements for hospitals participating in Medicare/Medicaid, including nursing services standards under § 482.23. Facilities violating CoP requirements risk loss of Medicare/Medicaid certification. 42 U.S.C. § 1395dd (EMTALA) — Requires hospitals to provide stabilizing treatment in emergencies regardless of staffing conditions.</p>
                </div>
                <AnonymityStatement destination="cms" />
              </div>
            </Card>
          )}

          {selected.has('osha') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-3">⚠️ OSHA Complaint</h2>
              <div className="bg-warm rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700">OSHA complaints may be filed online, by phone, or by mail. Complaints regarding unsafe nurse staffing conditions may be filed under the General Duty Clause, which requires employers to maintain a workplace free from recognized hazards.</p>
                <a href="https://www.osha.gov/workers/file-complaint" target="_blank" rel="noreferrer" className="text-teal text-sm underline block font-semibold">File OSHA Complaint Online →</a>
                <p className="text-sm text-gray-700">OSHA Hotline: <span className="font-medium">1-800-321-OSHA (1-800-321-6742)</span></p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applicable Authority</p>
                  <p className="text-xs text-gray-700">29 U.S.C. § 654(a)(1) (OSHA General Duty Clause) — Requires employers to furnish a workplace free from recognized hazards that are causing or are likely to cause death or serious physical harm. Unsafe nurse staffing ratios constitute a recognized hazard under this clause. 29 CFR Part 1977 (OSHA Whistleblower Protection Program) — Protects healthcare workers from retaliation for reporting unsafe working conditions or patient safety concerns to OSHA.</p>
                </div>
                <AnonymityStatement destination="osha" />
              </div>
            </Card>
          )}

        </div>
      )}

      <Card>
        <h2 className="font-heading font-bold text-navy text-lg mb-4">Export Options</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="teal" onClick={handleDownloadPDF}>Download PDF</Button>
          <a href={mailtoSelf}><Button variant="teal-outline">Email to Self</Button></a>
        </div>
        <AnonymityStatement destination="pdf" />
        <p className="text-xs text-gray-500 mt-3">PDF and email are always available regardless of destination selection.</p>
      </Card>

      <RequiredDisclosure />
    </div>
  );
}
