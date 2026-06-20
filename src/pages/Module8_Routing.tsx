import { useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import AnonymityStatement from '../components/ui/AnonymityStatement';
import { STATE_BON_REGISTRY } from '../data/state_bon_registry';
import { FEDERAL_CITATIONS } from '../data/federal_citations';
import { exportPDF } from '../lib/pdfExport';
import { logAudit } from '../lib/auditTrail';
import {
  loadSubmissionData,
  generateBONComplaint,
  generateLegislatorLetter,
  generateCMSComplaint,
  generateOSHAComplaint,
  getRepFinderUrl,
} from '../lib/submissionGenerator';

const DESTINATIONS = [
  {
    id: 'bon',
    label: 'State Board of Nursing',
    icon: '🏛️',
    description: 'Submit a formal NPA complaint to your State Board of Nursing. Your narrative will be pre-formatted as a professional complaint letter.',
    citations: ['ANA_CODE'],
  },
  {
    id: 'legislature',
    label: 'State Legislature',
    icon: '📜',
    description: 'Contact your state legislators as a constituent. Your documentation will be formatted as a constituent letter — enter your zip code to find your reps directly.',
    citations: ['NLRA_S7'],
  },
  {
    id: 'cms',
    label: 'CMS Complaint',
    icon: '🏥',
    description: 'File a 42 CFR § 482 Conditions of Participation complaint. Your documentation will be pre-formatted for the CMS complaint process.',
    citations: ['CMS_CoP', 'EMTALA'],
  },
  {
    id: 'osha',
    label: 'OSHA Complaint',
    icon: '⚠️',
    description: 'File a General Duty Clause complaint with OSHA. Your documentation will be pre-formatted with the required 4-prong GDC framework.',
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

function CopyButton({ text, label = 'Copy to Clipboard' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-teal text-white hover:bg-opacity-90 border border-teal'
      }`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

function GeneratedTextBlock({ text, label }: { text: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <CopyButton text={text} />
      </div>
      <textarea
        readOnly
        value={text}
        rows={12}
        className="w-full text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono resize-y focus:outline-none focus:ring-1 focus:ring-teal"
      />
    </div>
  );
}

export default function Module8_Routing() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState('');
  const [zip, setZip] = useState('');

  const data = loadSubmissionData();
  const bon = STATE_BON_REGISTRY.find(s => s.stateCode === selectedState);

  const toggle = (id: string) => {
    const dest = DESTINATIONS.find(d => d.id === id);
    if (dest && 'disabled' in dest && dest.disabled) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDownloadPDF = useCallback(() => {
    const freeText = localStorage.getItem('sc_freetext') || '';
    const translated = localStorage.getItem('sc_translated') || freeText;
    exportPDF(freeText || '(No narrative)', translated || '(No translated record)', new Date().toLocaleString());
    logAudit('PDF_DOWNLOADED_MODULE8');
  }, []);

  const bonText = bon
    ? generateBONComplaint(data, bon.boardName, bon.state, bon.npaNotes)
    : '';

  const legislatureText = bon
    ? generateLegislatorLetter(data, bon.state)
    : '';

  const cmsText = generateCMSComplaint(data);
  const oshaText = generateOSHAComplaint(data);

  const bonMailto = bon?.email
    ? `mailto:${bon.email}?subject=${encodeURIComponent(`Nurse Practice Act Complaint — ${new Date().toLocaleDateString('en-US')}`)}&body=${encodeURIComponent(bonText)}`
    : null;

  const legMailtoBody = `${legislatureText}\n\n---\nContact information available upon request.`;
  const legMailto = `mailto:?subject=${encodeURIComponent(`Constituent Communication — Nurse Staffing Safety — ${bon?.state || selectedState}`)}&body=${encodeURIComponent(legMailtoBody)}`;

  const repFinderUrl = bon && zip.length >= 5
    ? getRepFinderUrl(bon.stateCode, zip)
    : null;

  const mailtoSelf = `mailto:?subject=${encodeURIComponent('SafeChart Documentation — ' + new Date().toLocaleDateString('en-US'))}&body=${encodeURIComponent(data.freeText || '(No narrative entered)')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 8: Submit Documentation</h1>
        <p className="text-gray-600 mt-1 font-body">
          Select your destinations. Your documentation is pre-formatted for each agency — copy, send by email, or open the filing form directly. Nothing is submitted without your action.
        </p>
      </div>

      {/* State selector */}
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
        {!data.freeText && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-3">
            No narrative found in this session. Complete Module 1–3 or Quick Entry before submitting.
          </p>
        )}
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
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicable Authority</p>
                  {dest.citations.map(cid => {
                    const citation = FEDERAL_CITATIONS.find(c => c.id === cid);
                    if (!citation) return null;
                    return (
                      <div key={cid}>
                        <Badge variant="navy">{citation.label}</Badge>
                        <p className="text-xs font-semibold text-gray-700 mt-1">{citation.citation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-destination submission panels */}
      {selected.size > 0 && (
        <div className="space-y-6">

          {/* BON */}
          {selected.has('bon') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">
                🏛️ State Board of Nursing{bon ? ` — ${bon.state}` : ''}
              </h2>
              {bon ? (
                <div className="space-y-4">
                  <div className="bg-warm rounded-lg p-4 space-y-1 text-sm">
                    <p className="font-semibold text-navy">{bon.boardName}</p>
                    <p className="text-gray-700">Phone: <span className="font-medium">{bon.phone}</span></p>
                    {bon.email && <p className="text-gray-700">Email: <a href={`mailto:${bon.email}`} className="text-teal underline">{bon.email}</a></p>}
                    <a href={bon.website} target="_blank" rel="noreferrer" className="text-teal underline block">Board Website →</a>
                    <a href={bon.complaintUrl} target="_blank" rel="noreferrer" className="text-teal underline font-semibold block">Open Complaint Form →</a>
                  </div>

                  <GeneratedTextBlock text={bonText} label="Pre-formatted NPA Complaint — copy and paste into the complaint form" />

                  <div className="flex flex-wrap gap-3">
                    {bonMailto && (
                      <a
                        href={bonMailto}
                        onClick={() => logAudit('BON_EMAIL_OPENED', bon.state)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-navy text-white text-sm font-semibold hover:bg-opacity-90"
                      >
                        ✉️ Open Pre-filled Email to BON
                      </a>
                    )}
                    <a
                      href={bon.complaintUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => logAudit('BON_FORM_OPENED', bon.state)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-navy text-navy text-sm font-semibold hover:bg-warm"
                    >
                      Open BON Complaint Form →
                    </a>
                  </div>

                  <AnonymityStatement destination="bon" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select your state above to generate your pre-formatted BON complaint.</p>
              )}
            </Card>
          )}

          {/* Legislature */}
          {selected.has('legislature') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">
                📜 State Legislature{bon ? ` — ${bon.state}` : ''}
              </h2>
              {bon ? (
                <div className="space-y-4">
                  {/* Zip finder */}
                  <div className="bg-warm rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-navy">Find Your Legislators by ZIP Code</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        value={zip}
                        onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter ZIP code"
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                      {repFinderUrl ? (
                        <a
                          href={repFinderUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => logAudit('REP_FINDER_OPENED', `${bon.state} zip=${zip}`)}
                          className="px-4 py-1.5 bg-teal text-white rounded text-sm font-semibold hover:bg-opacity-90"
                        >
                          Find My {bon.state} Reps →
                        </a>
                      ) : zip.length >= 5 ? (
                        <a
                          href={bon.legislatureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-1.5 bg-teal text-white rounded text-sm font-semibold hover:bg-opacity-90"
                        >
                          {bon.state} Legislature Directory →
                        </a>
                      ) : (
                        <a
                          href={bon.legislatureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal text-sm underline"
                        >
                          {bon.state} Legislature →
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Enter your ZIP code above to go directly to your representative's contact page. Your pre-formatted constituent letter is ready below.</p>
                  </div>

                  <GeneratedTextBlock text={legislatureText} label="Pre-formatted Constituent Letter — copy and paste into your rep's contact form" />

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={legMailto}
                      onClick={() => logAudit('LEGISLATURE_EMAIL_OPENED', bon.state)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-navy text-white text-sm font-semibold hover:bg-opacity-90"
                    >
                      ✉️ Open Pre-filled Email
                    </a>
                    {repFinderUrl && (
                      <a
                        href={repFinderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-navy text-navy text-sm font-semibold hover:bg-warm"
                      >
                        Go to Rep Finder →
                      </a>
                    )}
                  </div>

                  <AnonymityStatement destination="legislature" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select your state above to generate your pre-formatted constituent letter.</p>
              )}
            </Card>
          )}

          {/* CMS */}
          {selected.has('cms') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">🏥 CMS Conditions of Participation Complaint</h2>
              <div className="space-y-4">
                <div className="bg-warm rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-navy">Centers for Medicare & Medicaid Services</p>
                  <p className="text-gray-700">CMS Hotline: <span className="font-medium">1-800-MEDICARE (1-800-633-4227)</span></p>
                  <a href="https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/Hospitals" target="_blank" rel="noreferrer" className="text-teal underline font-semibold block">Open CMS Hospital Complaint Form →</a>
                  <a href="https://www.medicare.gov/care-compare/" target="_blank" rel="noreferrer" className="text-teal underline block">CMS Care Compare — facility lookup →</a>
                </div>

                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Complete the facility name and address fields in the generated text below before submitting. These fields are marked with [BRACKETS].
                </p>

                <GeneratedTextBlock text={cmsText} label="Pre-formatted 42 CFR § 482 Complaint — copy into the CMS complaint form or email" />

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:?subject=${encodeURIComponent('CMS Conditions of Participation Complaint — ' + new Date().toLocaleDateString('en-US'))}&body=${encodeURIComponent(cmsText)}`}
                    onClick={() => logAudit('CMS_EMAIL_OPENED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-navy text-white text-sm font-semibold hover:bg-opacity-90"
                  >
                    ✉️ Open Pre-filled Email
                  </a>
                  <a
                    href="https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/Hospitals"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logAudit('CMS_FORM_OPENED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-navy text-navy text-sm font-semibold hover:bg-warm"
                  >
                    Open CMS Complaint Form →
                  </a>
                </div>

                <AnonymityStatement destination="cms" />
              </div>
            </Card>
          )}

          {/* OSHA */}
          {selected.has('osha') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">⚠️ OSHA General Duty Clause Complaint</h2>
              <div className="space-y-4">
                <div className="bg-warm rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-navy">Occupational Safety and Health Administration</p>
                  <p className="text-gray-700">OSHA Hotline: <span className="font-medium">1-800-321-OSHA (1-800-321-6742)</span></p>
                  <a href="https://www.osha.gov/workers/file-complaint" target="_blank" rel="noreferrer" className="text-teal underline font-semibold block">File OSHA Complaint Online →</a>
                  <a href="https://www.whistleblowers.gov" target="_blank" rel="noreferrer" className="text-teal underline block">OSHA Whistleblower Protection Program →</a>
                </div>

                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Complete the employer/facility name and address fields in the generated text below before submitting. These fields are marked with [BRACKETS].
                </p>

                <GeneratedTextBlock text={oshaText} label="Pre-formatted OSHA GDC Complaint — copy into the OSHA online complaint form" />

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:?subject=${encodeURIComponent('OSHA General Duty Clause Complaint — ' + new Date().toLocaleDateString('en-US'))}&body=${encodeURIComponent(oshaText)}`}
                    onClick={() => logAudit('OSHA_EMAIL_OPENED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-navy text-white text-sm font-semibold hover:bg-opacity-90"
                  >
                    ✉️ Open Pre-filled Email
                  </a>
                  <a
                    href="https://www.osha.gov/workers/file-complaint"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logAudit('OSHA_FORM_OPENED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-navy text-navy text-sm font-semibold hover:bg-warm"
                  >
                    Open OSHA Complaint Form →
                  </a>
                </div>

                <AnonymityStatement destination="osha" />
              </div>
            </Card>
          )}

        </div>
      )}

      {/* Export */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-lg mb-4">Export Your Documentation</h2>
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
