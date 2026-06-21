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
    id: 'hhs',
    label: 'HHS OIG Whistleblower',
    icon: '🛡️',
    description: 'Report fraud, abuse, or patient rights violations to the HHS Office of Inspector General. Covers federal healthcare fraud and patient safety violations in federally funded facilities.',
    citations: ['WHISTLEBLOWER'],
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

const QUAL_SITUATIONS = [
  {
    id: 'unsafe_told_charge',
    label: 'My assignment was unsafe and I told my charge nurse or supervisor.',
    destinations: ['bon'],
    note: 'This establishes a documented escalation — the foundation of a Board of Nursing complaint.',
  },
  {
    id: 'supervisor_ignored',
    label: 'My supervisor refused or ignored my concern about the unsafe assignment.',
    destinations: ['bon', 'osha'],
    note: 'Supervisor refusal is a key element of both NPA complaints and OSHA General Duty Clause filings.',
  },
  {
    id: 'patient_harmed',
    label: 'A patient was harmed, or was at serious risk of being harmed.',
    destinations: ['bon', 'cms'],
    note: 'CMS Conditions of Participation require hospitals to protect patients from foreseeable harm. Patient harm or risk of harm triggers mandatory reporting obligations.',
  },
  {
    id: 'sitter_removed',
    label: 'A safety attendant (sitter) was removed or my request for one was denied.',
    destinations: ['bon', 'cms'],
    note: 'Removal of a sitter from a high-risk patient is a patient safety event that CMS and the Board of Nursing track.',
  },
  {
    id: 'retaliation',
    label: 'I\'m being punished, threatened, or treated differently because I spoke up.',
    destinations: ['osha', 'hhs'],
    note: 'This is workplace retaliation. OSHA\'s Whistleblower Protection Program and HHS OIG both cover retaliation for reporting unsafe conditions.',
  },
  {
    id: 'pattern',
    label: 'This isn\'t a one-time event — unsafe staffing is an ongoing pattern at my facility.',
    destinations: ['legislature', 'cms'],
    note: 'Patterns of unsafe staffing are exactly what legislators and CMS need to hear about. Your documentation becomes part of a systemic record.',
  },
  {
    id: 'medicare_facility',
    label: 'My facility receives Medicare or Medicaid funding.',
    destinations: ['cms'],
    note: 'Federally certified facilities must meet CMS Conditions of Participation. Non-compliance can trigger a CMS survey or investigation.',
  },
  {
    id: 'physical_injury',
    label: 'I was physically injured, or my health was endangered, by the unsafe workload.',
    destinations: ['osha'],
    note: 'OSHA\'s General Duty Clause protects workers from recognized hazards — including injury from unsafe nurse-to-patient ratios and physical overload.',
  },
  {
    id: 'written_objection_denied',
    label: 'I submitted a written objection or assignment under protest and management denied it.',
    destinations: ['bon', 'osha'],
    note: 'A denied written objection is a documented refusal to mitigate a known hazard — strengthens both BON and OSHA filings significantly.',
  },
  {
    id: 'legislature_contact',
    label: 'I want my lawmakers to know what\'s happening in hospitals in their district.',
    destinations: ['legislature'],
    note: 'Constituent communication is protected speech. Your documentation becomes a constituent letter — factual, professional, and addressed to the people writing the laws.',
  },
];

export default function Module8_Routing() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState('');
  const [zip, setZip] = useState('');
  const [qualAnswers, setQualAnswers] = useState<Set<string>>(new Set());
  const [qualDone, setQualDone] = useState(false);
  const [skipQual, setSkipQual] = useState(false);

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

  const toggleQual = (id: string) => {
    setQualAnswers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const applyQualGuide = () => {
    const destSet = new Set<string>();
    for (const sit of QUAL_SITUATIONS) {
      if (qualAnswers.has(sit.id)) {
        sit.destinations.forEach(d => destSet.add(d));
      }
    }
    setSelected(destSet);
    setQualDone(true);
  };

  const selectedSituations = QUAL_SITUATIONS.filter(s => qualAnswers.has(s.id));
  const suggestedDestIds = [...new Set(selectedSituations.flatMap(s => s.destinations))];

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
        <h1 className="font-heading text-3xl font-bold text-navy">Route Your Documentation</h1>
        <p className="text-gray-600 mt-1 font-body">
          Tell us what happened and we'll show you where your documentation can go. Your record is already formatted — nothing is sent without your action.
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
            No narrative found in this session. Complete Module 1–3 or Quick Entry before routing.
          </p>
        )}
      </Card>

      {/* Qualification Guide (UX-11/17/18) */}
      {!skipQual && !qualDone && (
        <Card>
          <div className="mb-4">
            <h2 className="font-heading font-bold text-navy text-lg">Which of these apply to your situation?</h2>
            <p className="text-sm text-gray-600 mt-1">Select everything that fits. We'll show you what your documentation can be used for.</p>
          </div>
          <div className="space-y-3">
            {QUAL_SITUATIONS.map(sit => {
              const isChecked = qualAnswers.has(sit.id);
              const sitDests = sit.destinations.map(d => DESTINATIONS.find(x => x.id === d)?.label).filter(Boolean);
              return (
                <label key={sit.id} className={`flex gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${isChecked ? 'border-teal bg-teal bg-opacity-5' : 'border-gray-200 hover:border-teal hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleQual(sit.id)}
                    className="mt-0.5 w-5 h-5 accent-teal shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-navy">{sit.label}</p>
                    {isChecked && (
                      <p className="text-xs text-gray-600 mt-1">{sit.note}</p>
                    )}
                    {isChecked && sitDests.length > 0 && (
                      <p className="text-xs text-teal font-semibold mt-1">→ {sitDests.join(', ')}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {qualAnswers.size > 0 && (
            <div className="mt-4 p-3 bg-warm rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Based on your answers</p>
              <p className="text-sm text-navy">Your documentation is relevant to: <strong>{suggestedDestIds.map(d => DESTINATIONS.find(x => x.id === d)?.label).filter(Boolean).join(', ')}</strong></p>
            </div>
          )}

          <div className="flex gap-3 mt-4 flex-wrap">
            <Button variant="teal" onClick={applyQualGuide} disabled={qualAnswers.size === 0}>
              Show Me Where to Send This →
            </Button>
            <button onClick={() => setSkipQual(true)} className="text-xs text-gray-500 underline">
              Skip — I know where I'm filing
            </button>
          </div>
        </Card>
      )}

      {qualDone && (
        <div className="bg-teal bg-opacity-10 border border-teal rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-navy">Destinations selected based on your answers</p>
            <p className="text-xs text-gray-600 mt-1">
              {[...selected].map(id => DESTINATIONS.find(d => d.id === id)?.label).filter(Boolean).join(', ')}
            </p>
          </div>
          <button onClick={() => { setQualDone(false); setSkipQual(false); }} className="text-xs text-teal underline shrink-0">Change answers</button>
        </div>
      )}

      {/* Destination cards */}
      {(skipQual || qualDone) && (
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3">{qualDone ? 'Review and adjust your destinations:' : 'Select destinations:'}</p>
      </div>
      )}
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

                  {/* State-specific law notes */}
                  {bon.stateCode === 'CA' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                      <p className="font-semibold">California — SB 553 (Workplace Violence Prevention, 2023)</p>
                      <p>California SB 553 requires hospitals to maintain workplace violence prevention plans. Unsafe staffing that creates a workplace violence risk may be cited under this statute. Include SB 553 context in your constituent letter to California legislators.</p>
                      <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB553" target="_blank" rel="noreferrer" className="text-amber-700 underline font-medium block">SB 553 Legislative Text →</a>
                    </div>
                  )}
                  {bon.stateCode === 'NY' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                      <p className="font-semibold">New York — S5294-B (Safe Staffing for Quality Care Act)</p>
                      <p>S5294-B establishes mandatory nurse-to-patient staffing ratios in New York hospitals. Cite this legislation in your constituent letter to NY legislators to connect your documentation to the pending legislative framework.</p>
                      <a href="https://www.nysenate.gov/legislation/bills/2023/S5294" target="_blank" rel="noreferrer" className="text-amber-700 underline font-medium block">S5294-B Legislative Text →</a>
                    </div>
                  )}

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

          {/* HHS OIG */}
          {selected.has('hhs') && (
            <Card>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">🛡️ HHS Office of Inspector General — Whistleblower Complaint</h2>
              <div className="space-y-4">
                <div className="bg-warm rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-navy">U.S. Department of Health & Human Services — Office of Inspector General</p>
                  <p className="text-gray-700">OIG Hotline: <span className="font-medium">1-800-HHS-TIPS (1-800-447-8477)</span></p>
                  <a href="https://oig.hhs.gov/fraud/report-fraud/" target="_blank" rel="noreferrer" className="text-teal underline font-semibold block">File HHS OIG Complaint Online →</a>
                  <a href="https://oig.hhs.gov/compliance/patient-safety-resources/" target="_blank" rel="noreferrer" className="text-teal underline block">HHS OIG Patient Safety Resources →</a>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                  <p className="font-semibold">When to use HHS OIG</p>
                  <p>HHS OIG investigates fraud, waste, and abuse in federally funded healthcare programs (Medicare, Medicaid). File here if your facility's unsafe conditions involve: billing fraud related to inadequate services delivered, improper financial relationships affecting care, or patient rights violations in a federally certified facility.</p>
                  <p className="mt-2 font-medium">Retaliation Protection: Section 1128A(h) of the Social Security Act protects individuals who report fraud or abuse to OIG.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Documentation (for reference when completing OIG form)</p>
                    <div className="flex items-center gap-2">
                      {data.freeText && <CopyButton text={data.freeText} label="Copy Narrative" />}
                    </div>
                  </div>
                  {data.freeText && (
                    <textarea
                      readOnly
                      value={data.freeText}
                      rows={6}
                      className="w-full text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono resize-y focus:outline-none"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://oig.hhs.gov/fraud/report-fraud/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logAudit('HHS_FORM_OPENED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 border-navy text-navy text-sm font-semibold hover:bg-warm"
                  >
                    Open HHS OIG Complaint Form →
                  </a>
                </div>

                <AnonymityStatement destination="pdf" />
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

                {/* OSHA 300/301 note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                  <p className="font-semibold">OSHA Recordkeeping — 300 Log & 301 Incident Report</p>
                  <p>If this incident resulted in a work-related injury or illness (physical harm to a nurse, needle stick, assault, musculoskeletal injury from inadequate staffing), the employer may have a legal obligation to record it on the OSHA 300 Log and complete an OSHA 301 Incident Report within 7 days.</p>
                  <p className="font-medium mt-1">If the employer has failed to record a work-related injury or illness, this failure may itself be an OSHA violation. Include this in your OSHA complaint if applicable.</p>
                  <a href="https://www.osha.gov/recordkeeping" target="_blank" rel="noreferrer" className="text-blue-700 underline block">OSHA Recordkeeping Requirements →</a>
                </div>

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
