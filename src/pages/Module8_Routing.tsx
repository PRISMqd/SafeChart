import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import { STATE_BON_REGISTRY } from '../data/state_bon_registry';
import { FEDERAL_CITATIONS } from '../data/federal_citations';
import { exportPDF } from '../lib/pdfExport';

const DESTINATIONS = [
  {
    id: 'prismqd',
    label: 'PRISMqd Dataset',
    icon: '🔬',
    description: 'Submit anonymized data to the PRISMqd nurse safety dataset for aggregated research.',
    disabled: true,
    disabledNote: 'Privacy review pending — available in Phase 2',
    citations: [] as string[],
  },
  {
    id: 'bon',
    label: 'State Board of Nursing',
    icon: '🏛️',
    description: 'Submit a concern to your State Board of Nursing. Each BON has jurisdiction over safe practice standards.',
    disabled: false,
    disabledNote: '',
    citations: ['ANA_CODE'],
  },
  {
    id: 'legislature',
    label: 'State Legislature',
    icon: '📜',
    description: 'Contact your state legislators as a constituent regarding unsafe nurse staffing conditions.',
    disabled: false,
    disabledNote: '',
    citations: ['NLRA_S7'],
  },
  {
    id: 'cms',
    label: 'CMS Complaint',
    icon: '🏥',
    description: 'File a complaint with the Centers for Medicare and Medicaid Services regarding Conditions of Participation violations.',
    disabled: false,
    disabledNote: '',
    citations: ['CMS_CoP', 'EMTALA'],
  },
  {
    id: 'osha',
    label: 'OSHA Complaint',
    icon: '⚠️',
    description: 'File a complaint with OSHA under the General Duty Clause regarding recognized workplace hazards.',
    disabled: false,
    disabledNote: '',
    citations: ['OSHA_GDC', 'WHISTLEBLOWER'],
  },
];

export default function Module8_Routing() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState('');

  const toggle = (id: string) => {
    if (DESTINATIONS.find(d => d.id === id)?.disabled) return;
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
  };

  const mailtoSelf = `mailto:?subject=SafeChart Documentation&body=${encodeURIComponent(localStorage.getItem('sc_freetext') || '')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 8: Report &amp; Submission</h1>
        <p className="text-gray-600 mt-1 font-body">Select submission destinations. You control what is submitted and when.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DESTINATIONS.map(dest => (
          <div
            key={dest.id}
            onClick={() => toggle(dest.id)}
            className={`rounded-xl border-2 p-5 transition-all ${dest.disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : selected.has(dest.id) ? 'border-teal bg-teal bg-opacity-5 cursor-pointer' : 'border-gray-200 bg-white cursor-pointer hover:border-teal'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">{dest.icon}</span>
                <div>
                  <p className="font-heading font-bold text-navy text-base">{dest.label}</p>
                  <p className="text-sm text-gray-600 mt-1 font-body">{dest.description}</p>
                </div>
              </div>
              {!dest.disabled && (
                <input type="checkbox" checked={selected.has(dest.id)} readOnly className="mt-1 w-4 h-4 accent-teal" />
              )}
            </div>
            {dest.disabled && dest.disabledNote && (
              <p className="text-xs text-gray-500 mt-2 font-medium">{dest.disabledNote}</p>
            )}
            {dest.citations.length > 0 && selected.has(dest.id) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Applicable Citations</p>
                {dest.citations.map(cid => {
                  const citation = FEDERAL_CITATIONS.find(c => c.id === cid);
                  if (!citation) return null;
                  return (
                    <div key={cid} className="mb-2">
                      <Badge variant="navy">{citation.label}</Badge>
                      <p className="text-xs text-gray-600 mt-1">{citation.citation}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {selected.has('bon') && (
        <Card>
          <h2 className="font-heading font-bold text-navy text-lg mb-3">State Board of Nursing</h2>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 block mb-2">Select Your State</label>
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
            <p className="text-xs text-gray-400 mt-1">Phase 1 includes 8 states. Full registry in Phase 2.</p>
          </div>
          {bon && (
            <div className="bg-warm rounded-lg p-4 space-y-2">
              <p className="font-semibold text-navy">{bon.boardName}</p>
              <p className="text-sm text-gray-600">Phone: {bon.phone}</p>
              {bon.email && <p className="text-sm text-gray-600">Email: {bon.email}</p>}
              <a href={bon.website} target="_blank" rel="noreferrer" className="text-teal text-sm underline block">Board Website</a>
              <a href={bon.complaintUrl} target="_blank" rel="noreferrer" className="text-teal text-sm underline block">File a Complaint</a>
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">{bon.npaNotes}</p>
            </div>
          )}
        </Card>
      )}

      <Card>
        <h2 className="font-heading font-bold text-navy text-lg mb-4">Export Options</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="teal" onClick={handleDownloadPDF}>Download PDF</Button>
          <a href={mailtoSelf}><Button variant="teal-outline">Email to Self</Button></a>
        </div>
        <p className="text-xs text-gray-500 mt-3">PDF and email options are always available regardless of destination selection.</p>
      </Card>

      <RequiredDisclosure />
    </div>
  );
}
