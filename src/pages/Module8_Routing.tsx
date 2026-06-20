import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useShiftRecord } from '../lib/store';
import { stateBONRegistry } from '../data/state_bon_registry';
import { getCitationsForDestination } from '../data/federal_citations';
import { REQUIRED_DISCLOSURE } from '../lib/reportTranslator';
import { exportToPDF } from '../lib/pdfExport';
import { Download, Mail, Lock, ExternalLink, AlertCircle, CheckSquare } from 'lucide-react';

interface Destination {
  id: string;
  label: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
  icon?: React.ReactNode;
}

const destinations: Destination[] = [
  {
    id: 'download',
    label: 'PDF Download',
    description: 'Complete record saved to your device only. No server storage.',
    icon: <Download size={16} />,
  },
  {
    id: 'email',
    label: 'Email to Self',
    description: 'Complete record sent via your email client. No PRISMqd server involvement.',
    icon: <Mail size={16} />,
  },
  {
    id: 'BON',
    label: 'State Board of Nursing',
    description: 'NPA-compliant structured complaint. Nurse name optional; state and facility type required by agency.',
    icon: <ExternalLink size={16} />,
  },
  {
    id: 'CMS',
    label: 'CMS — Centers for Medicare & Medicaid Services',
    description: 'CoP-aligned complaint under 42 CFR § 482. Facility name required by agency.',
    icon: <ExternalLink size={16} />,
  },
  {
    id: 'OSHA',
    label: 'OSHA — Occupational Safety and Health Administration',
    description: 'General Duty Clause complaint, 29 U.S.C. § 654(a)(1). Whistleblower protections apply.',
    icon: <ExternalLink size={16} />,
  },
  {
    id: 'legislator',
    label: 'State Legislature',
    description: 'Constituent communication with pattern summary. Nurse name and facility name both optional.',
    icon: <ExternalLink size={16} />,
  },
  {
    id: 'PRISMqd',
    label: 'PRISMqd Anonymized Research Dataset',
    description: 'Aggregated, de-identified record contributed to nurse safety research. Facility name replaced by state/type/size tier.',
    disabled: true,
    disabledReason: 'Privacy policy attorney review pending — available in Phase 2.',
    icon: <Lock size={16} />,
  },
];

export function Module8_Routing() {
  const navigate = useNavigate();
  const [record, update] = useShiftRecord();
  const [selected, setSelected] = useState<Set<string>>(new Set(['download']));
  const [selectedState, setSelectedState] = useState(record.state || '');
  const [confirmed, setConfirmed] = useState(false);

  function toggleDestination(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const bonEntry = stateBONRegistry.find(e => e.state === selectedState || e.abbreviation === selectedState);

  function handleDownloadPDF() {
    exportToPDF(record);
  }

  function handleEmailToSelf() {
    const subject = encodeURIComponent('SafeChart Professional Documentation Record');
    const body = encodeURIComponent(
      `SafeChart Professional Documentation Record\nGenerated: ${new Date(record.timestamp).toLocaleString()}\n\nThis record was generated via SafeChart, a PRISMqd professional documentation tool.\n\n${REQUIRED_DISCLOSURE}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function handleRoute() {
    if (selected.has('download')) handleDownloadPDF();
    if (selected.has('email')) handleEmailToSelf();
    // External routing (BON, CMS, OSHA, legislator) opens guidance — not auto-submitted
    if (selected.has('BON') && bonEntry) {
      window.open(bonEntry.bon_complaint_url, '_blank', 'noopener');
    }
    if (selected.has('CMS')) {
      window.open('https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/downloads/complaintbrochure.pdf', '_blank', 'noopener');
    }
    if (selected.has('OSHA')) {
      window.open('https://www.osha.gov/workers/file-complaint', '_blank', 'noopener');
    }
  }

  const selectedCount = Array.from(selected).filter(id => !destinations.find(d => d.id === id)?.disabled).length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">Module 8</div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Report Submission & Routing</h1>
          <p className="text-sm text-gray-600">
            Select one or more destinations for your documentation. Nothing is submitted without your explicit confirmation below.
          </p>
        </div>

        {/* Severity context */}
        {record.classification && (
          <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div>
              <p className="text-xs font-semibold text-navy">Your record classification:</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Badge
                  variant={
                    record.classification.severityTier === 'critical' || record.classification.severityTier === 'high' ? 'red' :
                    record.classification.severityTier === 'moderate' ? 'yellow' : 'gray'
                  }
                >
                  {record.classification.severityTier.charAt(0).toUpperCase() + record.classification.severityTier.slice(1)} Severity
                </Badge>
                {record.classification.hasEscalationFailure && <Badge variant="red">Escalation Failure</Badge>}
                {record.classification.autoHighRisk && <Badge variant="red">Auto High-Risk</Badge>}
              </div>
            </div>
          </div>
        )}

        {/* Review report first */}
        <div className="mb-6">
          <Button variant="light" size="sm" onClick={() => navigate('/report')} className="flex items-center gap-2">
            ← Review Translated Report First
          </Button>
        </div>

        {/* Destination cards */}
        <div className="space-y-3 mb-8">
          <h2 className="font-heading font-semibold text-navy mb-3">Select Destinations</h2>
          {destinations.map(dest => {
            const isSelected = selected.has(dest.id);
            const isDisabled = dest.disabled;
            const citations = getCitationsForDestination(dest.id);

            return (
              <div
                key={dest.id}
                className={`rounded-xl border p-4 transition-all ${
                  isDisabled
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : isSelected
                    ? 'bg-teal/5 border-teal/30 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-teal/20 cursor-pointer'
                }`}
                onClick={() => !isDisabled && toggleDestination(dest.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${isDisabled ? 'text-gray-400' : isSelected ? 'text-teal' : 'text-gray-400'}`}>
                    {isDisabled ? <Lock size={16} /> : dest.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-heading font-semibold text-sm ${isDisabled ? 'text-gray-400' : 'text-navy'}`}>
                        {dest.label}
                      </span>
                      {isSelected && !isDisabled && <Badge variant="teal">Selected</Badge>}
                      {isDisabled && <Badge variant="gray">Phase 2</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{dest.description}</p>
                    {isDisabled && dest.disabledReason && (
                      <p className="text-xs text-gray-400 mt-1 italic">{dest.disabledReason}</p>
                    )}

                    {/* BON state selector */}
                    {isSelected && dest.id === 'BON' && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-navy mb-1">Select Your State</label>
                        <select
                          value={selectedState}
                          onChange={e => { setSelectedState(e.target.value); update({ state: e.target.value }); }}
                          className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 bg-white"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="">Select state...</option>
                          {stateBONRegistry.map(s => (
                            <option key={s.abbreviation} value={s.state}>{s.state}</option>
                          ))}
                        </select>
                        {bonEntry && (
                          <div className="mt-3 bg-cream rounded-lg p-3 border border-gray-100 text-xs space-y-1">
                            <p className="font-semibold text-navy">{bonEntry.bon_name}</p>
                            <p className="text-gray-600">{bonEntry.npa_authority}</p>
                            <p className="text-gray-600">Phone: {bonEntry.bon_phone}</p>
                            {bonEntry.bon_email && <p className="text-gray-600">Email: {bonEntry.bon_email}</p>}
                            <p className="text-gray-600">
                              Anonymous complaints: {bonEntry.anonymous_complaint_accepted === 'yes' ? 'Accepted' : bonEntry.anonymous_complaint_accepted === 'no' ? 'Not accepted' : 'Conditional'}
                            </p>
                            {bonEntry.build_status === 'requires_verification' && (
                              <p className="text-orange-600 flex items-center gap-1">
                                <AlertCircle size={11} />
                                Verify current info at: {bonEntry.bon_complaint_url}
                              </p>
                            )}
                            <a
                              href={bonEntry.bon_complaint_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal hover:underline flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              File complaint <ExternalLink size={11} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Citations for selected destination */}
                    {isSelected && !isDisabled && citations.length > 0 && dest.id !== 'download' && dest.id !== 'email' && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-navy mb-1">Applicable Citations</p>
                        <div className="space-y-1">
                          {citations.map(c => (
                            <div key={c.id} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-teal mt-0.5">•</span>
                              <span><span className="font-medium">{c.citation}</span> — {c.neutral_citation_phrase}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation */}
        {selectedCount > 0 && (
          <Card className="mb-6 border-navy/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 accent-teal h-4 w-4 shrink-0"
              />
              <span className="text-sm text-gray-700">
                I confirm that this documentation represents my professional account of the events I witnessed and experienced. I authorize submission to the selected destinations. I understand this tool does not constitute legal advice.
              </span>
            </label>
          </Card>
        )}

        {/* Disclosure */}
        <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-8">
          <p className="text-xs text-gray-500 leading-relaxed">{REQUIRED_DISCLOSURE}</p>
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="ghost" onClick={() => navigate('/report')}>← Back to Report</Button>
          <Button
            variant="teal"
            onClick={handleRoute}
            disabled={selectedCount === 0 || !confirmed}
            className="flex items-center gap-2"
          >
            <CheckSquare size={15} />
            Submit Selected ({selectedCount})
          </Button>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Source: Federal citations monitored per SOT v1.3 Section X · Last verified: 2026-06-19
        </p>
      </div>
    </Layout>
  );
}
