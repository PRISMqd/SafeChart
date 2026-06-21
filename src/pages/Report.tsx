import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import PeerResources from '../components/ui/PeerResources';
import { classifyText } from '../lib/nlpClassifier';
import { translateReport } from '../lib/reportTranslator';
import { exportPDF } from '../lib/pdfExport';
import { logAudit, getSessionLog } from '../lib/auditTrail';
import type { EscalationRecord, ClassificationResult, EventType } from '../types';

const ARI_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-50 border-green-300 text-green-800',
  moderate: 'bg-amber-50 border-amber-300 text-amber-800',
  high: 'bg-red-50 border-red-300 text-red-800',
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-50 border-green-200 text-green-800',
  moderate: 'bg-amber-50 border-amber-200 text-amber-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  unresolved: 'bg-red-50 border-red-200 text-red-800',
};

const CITATION_EXPLANATIONS = [
  { pattern: /29 U\.S\.C\. §654/, label: '29 U.S.C. §654(a)(1)', plain: 'The federal workplace safety law — employers must provide a workplace free from recognized hazards that cause or are likely to cause serious harm.' },
  { pattern: /42 C\.F\.R\. §482/, label: '42 C.F.R. §482', plain: 'Medicare Conditions of Participation — hospitals must meet these standards to receive Medicare and Medicaid reimbursement. Includes patient rights and safety requirements.' },
  { pattern: /NPA|Nursing Practice Act/, label: 'Nursing Practice Act', plain: 'Your state\'s law governing nursing licensure. Nurses have a legal and ethical duty to refuse unsafe assignments and report unsafe conditions.' },
  { pattern: /ANA Code/, label: 'ANA Code of Ethics', plain: 'The American Nurses Association Code of Ethics, Provision 3 — nurses must protect patients from incompetent, unethical, or illegal practices.' },
  { pattern: /29 C\.F\.R\. §1904/, label: '29 C.F.R. §1904', plain: 'OSHA recordkeeping — employers must log and report workplace injuries and illnesses. Failing to do so is a separate violation.' },
];

export default function Report() {
  const navigate = useNavigate();
  const [freeText, setFreeText] = useState('');
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [editedTranslated, setEditedTranslated] = useState('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [residualRisk, setResidualRisk] = useState<Record<string, string> | null>(null);
  const [sitter, setSitter] = useState<Record<string, unknown> | null>(null);
  const [ari, setAri] = useState<Record<string, unknown> | null>(null);
  const [retaliation, setRetaliation] = useState<Record<string, unknown> | null>(null);
  const [dismissFormal, setDismissFormal] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const sessionStart = useState(() => new Date().toISOString())[0];

  useEffect(() => {
    const ft = localStorage.getItem('sc_freetext') || '';
    const esc = localStorage.getItem('sc_escalations');
    const cl = localStorage.getItem('sc_checklist_text');
    const et = localStorage.getItem('sc_event_type');
    setFreeText(ft);
    if (esc) { try { setEscalations(JSON.parse(esc)); } catch { /* */ } }
    if (cl) { try { setChecklistItems(JSON.parse(cl)); } catch { /* */ } }
    if (et) setEventType(et as EventType);

    const tryParse = (key: string) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
    setResidualRisk(tryParse('sc_residual_risk'));
    setSitter(tryParse('sc_sitter'));
    setAri(tryParse('sc_ari'));
    setRetaliation(tryParse('sc_retaliation'));

    const escArr = esc ? JSON.parse(esc) : [];
    const clArr = cl ? JSON.parse(cl) : [];
    const cls = classifyText(ft);
    setClassification(cls);
    const report = translateReport(ft, cls, escArr, clArr);
    setEditedTranslated(report);
    localStorage.setItem('sc_translated', report);

    logAudit('REPORT_VIEWED');
  }, []);

  const handleEditFreeText = (val: string) => {
    setFreeText(val);
    localStorage.setItem('sc_freetext', val);
    const escArr = escalations;
    const clArr = checklistItems;
    const cls = classifyText(val);
    setClassification(cls);
    const report = translateReport(val, cls, escArr, clArr);
    setEditedTranslated(report);
    localStorage.setItem('sc_translated', report);
  };

  const handleEditTranslated = (val: string) => {
    setEditedTranslated(val);
    localStorage.setItem('sc_translated', val);
  };

  const submissionText = dismissFormal ? freeText : editedTranslated;

  const handleDownloadPDF = () => {
    exportPDF(freeText || '(No narrative entered)', submissionText, new Date().toLocaleString());
    logAudit('PDF_DOWNLOADED');
  };

  const mailto = `mailto:?subject=SafeChart Documentation Record&body=${encodeURIComponent(submissionText)}`;

  const tierColor = (tier: string): 'red' | 'yellow' | 'green' => {
    if (tier === 'critical' || tier === 'high') return 'red';
    if (tier === 'moderate') return 'yellow';
    return 'green';
  };

  const isHighSeverity = classification && (classification.severityTier === 'high' || classification.severityTier === 'critical');
  const sessionLog = getSessionLog();

  const ariLevel = ari?.ariLevel as string | undefined;
  const riskLevel = residualRisk?.residualRiskLevel;
  const sitterRemovedOrDenied = sitter?.sitterRemovedOrDenied === true;
  const retaliationCount = Array.isArray(retaliation?.indicators) ? (retaliation!.indicators as string[]).length : 0;

  const activeCitations = CITATION_EXPLANATIONS.filter(c => c.pattern.test(editedTranslated));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Your Record</h1>
        <p className="text-gray-600 mt-1 font-body">Everything you've documented, ready to review and use.</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Session: {new Date(sessionStart).toLocaleString()}</span>
        </div>
      </div>

      {eventType && (
        <div className="p-3 bg-warm border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Event Type</p>
          <p className="text-sm font-medium text-navy">{eventType}</p>
        </div>
      )}

      {/* Status badges — clinical flags only, no internal framework labels */}
      {(classification || ariLevel || riskLevel || sitterRemovedOrDenied || retaliationCount > 0) && (
        <Card>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documentation Status</p>
          <div className="flex flex-wrap gap-2 items-center">
            {classification && (
              <>
                <Badge variant={tierColor(classification.severityTier)}>
                  {classification.severityTier === 'critical' ? 'CRITICAL' : classification.severityTier === 'high' ? 'HIGH RISK' : classification.severityTier === 'moderate' ? 'MODERATE RISK' : 'DOCUMENTED'}
                </Badge>
                {classification.autoHighRisk && <Badge variant="red">AUTO HIGH-RISK</Badge>}
                {classification.hasEscalationFailure && <Badge variant="red">ESCALATION FAILURE DOCUMENTED</Badge>}
                {classification.hasPatientDeterioration && <Badge variant="red">PATIENT DETERIORATION DOCUMENTED</Badge>}
              </>
            )}
            {ariLevel && (
              <Badge variant={ariLevel === 'high' ? 'red' : ariLevel === 'moderate' ? 'yellow' : 'green'}>
                ADVERSE RESPONSE: {ariLevel.toUpperCase()}
              </Badge>
            )}
            {riskLevel && riskLevel !== 'low' && (
              <Badge variant={riskLevel === 'unresolved' || riskLevel === 'high' ? 'red' : 'yellow'}>
                RESIDUAL RISK: {riskLevel.toUpperCase()}
              </Badge>
            )}
            {sitterRemovedOrDenied && <Badge variant="red">SITTER REMOVED/DENIED</Badge>}
            {retaliationCount > 0 && <Badge variant="red">RETALIATION: {retaliationCount} INDICATOR{retaliationCount > 1 ? 'S' : ''}</Badge>}
          </div>
        </Card>
      )}

      {isHighSeverity && (
        <PeerResources severity={classification!.severityTier as 'high' | 'critical'} />
      )}

      {/* Two-panel CSCP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading font-bold text-navy text-lg mb-3">Your words</h2>
          <Card className="h-full">
            <textarea
              className="w-full text-sm font-body text-gray-700 min-h-64 focus:outline-none resize-y border-none outline-none"
              value={freeText}
              onChange={e => handleEditFreeText(e.target.value)}
              placeholder="Nothing entered yet. Your words from the documentation modules appear here."
            />
            {checklistItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Safety Flags</p>
                {checklistItems.map((item, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1">• {item}</p>
                ))}
              </div>
            )}
            {escalations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Escalation Attempts</p>
                {escalations.map((esc, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1">
                    {esc.attemptTime} → {esc.reportedTo}: {esc.response.replace('_', ' ')}
                    {(esc as unknown as Record<string, unknown>).witness ? ` (witness: ${(esc as unknown as Record<string, unknown>).witness})` : ''}
                  </p>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-navy text-lg">How this reads formally</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dismissFormal}
                onChange={e => setDismissFormal(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Use my words only</span>
            </label>
          </div>
          {dismissFormal ? (
            <Card className="h-full">
              <div className="text-center py-8 text-sm text-gray-500">
                <p className="font-medium text-navy mb-1">Formal version dismissed.</p>
                <p>Your words will be used for all exports and routing.</p>
                <button onClick={() => setDismissFormal(false)} className="mt-3 text-teal underline text-xs">Restore formal version</button>
              </div>
            </Card>
          ) : (
            <Card className="h-full">
              <textarea
                className="w-full text-sm font-body text-gray-700 min-h-64 focus:outline-none resize-y border-none outline-none"
                value={editedTranslated}
                onChange={e => handleEditTranslated(e.target.value)}
                placeholder="The formal version of your documentation appears here. You can edit it."
              />
              {activeCitations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowCitations(c => !c)}
                    className="text-xs text-teal font-semibold flex items-center gap-1"
                  >
                    {showCitations ? '▾' : '▸'} What these citations mean ({activeCitations.length})
                  </button>
                  {showCitations && (
                    <div className="mt-2 space-y-2">
                      {activeCitations.map((c, i) => (
                        <div key={i} className="p-2 bg-warm rounded border border-gray-200">
                          <p className="text-xs font-semibold text-navy">{c.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{c.plain}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Residual Risk */}
      {residualRisk && (
        <Card>
          <h2 className="font-heading font-bold text-navy text-base mb-3">Post-Escalation Risk</h2>
          <div className={`p-3 rounded-lg border mb-3 ${RISK_LEVEL_COLORS[riskLevel || 'moderate']}`}>
            <p className="text-sm font-semibold">Risk Level: {(riskLevel || '').toUpperCase()}</p>
          </div>
          {residualRisk.outstandingConcerns && (
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-semibold">Outstanding Concerns:</span> {residualRisk.outstandingConcerns}</p>
              {residualRisk.patientsAffected && <p><span className="font-semibold">Patients Affected:</span> {residualRisk.patientsAffected}</p>}
              {residualRisk.conditionStartTime && <p><span className="font-semibold">Condition Began:</span> {residualRisk.conditionStartTime}</p>}
              {residualRisk.interimSafeguards && <p><span className="font-semibold">Interim Safeguards:</span> {residualRisk.interimSafeguards}</p>}
              {residualRisk.anticipatedResolution && <p><span className="font-semibold">Anticipated Resolution:</span> {residualRisk.anticipatedResolution}</p>}
            </div>
          )}
        </Card>
      )}

      {/* Sitter */}
      {sitter && (
        <Card>
          <h2 className="font-heading font-bold text-navy text-base mb-3">Safety Attendant</h2>
          {sitterRemovedOrDenied && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3 flex gap-2 items-center">
              <Badge variant="red">SAFETY CONCERN</Badge>
              <span className="text-sm text-red-800 font-medium">Safety attendant removed or request denied</span>
            </div>
          )}
          <div className="space-y-1 text-sm text-gray-700">
            {Array.isArray(sitter.monitoringNeeds) && (sitter.monitoringNeeds as string[]).length > 0 && (
              <p><span className="font-semibold">Monitoring Needs:</span> {(sitter.monitoringNeeds as string[]).join(', ')}</p>
            )}
            <p><span className="font-semibold">Sitter Assigned at Start:</span> {sitter.sitterAssignedAtStart === true ? 'Yes' : sitter.sitterAssignedAtStart === false ? 'No' : 'Not documented'}</p>
            {sitterRemovedOrDenied && (
              <>
                {sitter.removalTime && <p><span className="font-semibold">Removal Time:</span> {String(sitter.removalTime)}</p>}
                {sitter.removedByRole && <p><span className="font-semibold">Decision By:</span> {String(sitter.removedByRole)}</p>}
                {sitter.reasonGiven && <p><span className="font-semibold">Reason Given:</span> {String(sitter.reasonGiven)}</p>}
                {sitter.timeWithoutCoverage && <p><span className="font-semibold">Time Without Coverage:</span> {String(sitter.timeWithoutCoverage)}</p>}
                {sitter.nurseObjection && <p><span className="font-semibold">Nurse Objection:</span> {String(sitter.nurseObjection)}</p>}
              </>
            )}
            {!!sitter.patientOutcome && <p><span className="font-semibold">Patient Outcome:</span> {String(sitter.patientOutcome)}</p>}
          </div>
        </Card>
      )}

      {/* ARI */}
      {ari && (
        <Card>
          <h2 className="font-heading font-bold text-navy text-base mb-3">Adverse Response Assessment</h2>
          <div className={`p-3 rounded-lg border mb-3 ${ARI_LEVEL_COLORS[ariLevel || 'low']}`}>
            <p className="text-sm font-semibold">Level: {(ariLevel || '').toUpperCase()}</p>
          </div>
          {!!ari.scores && typeof ari.scores === 'object' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(ari.scores as Record<string, number>).map(([id, score]) => {
                const NAMES: Record<string, string> = {
                  cognitive_load: 'Cognitive Load',
                  fatigue: 'Fatigue',
                  moral_distress: 'Moral Distress',
                  retaliation_fear: 'Fear of Retaliation',
                  physical_capacity: 'Physical Capacity',
                };
                const LABELS = ['None', 'Mild', 'Significant'];
                const color = score === 2 ? 'text-red-700' : score === 1 ? 'text-amber-700' : 'text-green-700';
                return (
                  <div key={id} className="p-2 bg-warm rounded border border-gray-200">
                    <p className="text-xs text-gray-500">{NAMES[id] || id}</p>
                    <p className={`text-xs font-semibold ${color}`}>{LABELS[score] ?? score}</p>
                  </div>
                );
              })}
            </div>
          )}
          {!!ari.additionalContext && (
            <p className="text-sm text-gray-700 mt-3"><span className="font-semibold">Additional Context:</span> {String(ari.additionalContext)}</p>
          )}
        </Card>
      )}

      {/* Retaliation */}
      {retaliation && retaliationCount > 0 && (
        <Card>
          <div className="flex gap-2 items-center mb-3">
            <h2 className="font-heading font-bold text-navy text-base">Retaliation Documentation</h2>
            <Badge variant="red">{retaliationCount} INDICATOR{retaliationCount > 1 ? 'S' : ''}</Badge>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-xs text-red-800">
            <p className="font-semibold mb-1">Whistleblower Protection</p>
            <p>File retaliation complaint at whistleblowers.gov or call 1-800-321-6742. Deadline is 30 days from adverse action under most healthcare statutes.</p>
          </div>
          <ul className="space-y-1">
            {(retaliation.indicators as string[]).map((ind, i) => (
              <li key={i} className="text-xs text-red-700 flex gap-2"><span>•</span><span>{ind}</span></li>
            ))}
          </ul>
          {!!retaliation.details && (
            <p className="text-sm text-gray-700 mt-3">{String(retaliation.details)}</p>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleDownloadPDF}>Download PDF</Button>
        <a href={mailto} onClick={() => logAudit('EMAIL_TO_SELF')}>
          <Button variant="teal-outline">Email to Self</Button>
        </a>
        <Button variant="primary" onClick={() => navigate('/module8')}>Route & Submit</Button>
        <Button variant="ghost" onClick={() => navigate('/module6')}>Back</Button>
      </div>

      {sessionLog.length > 0 && (
        <div className="p-3 bg-warm border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Session Audit Trail</p>
          <p className="text-xs text-gray-600">{sessionLog.length} action{sessionLog.length !== 1 ? 's' : ''} recorded this session.</p>
          <div className="mt-2 space-y-0.5 max-h-28 overflow-y-auto">
            {sessionLog.map((entry, i) => (
              <p key={i} className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()} — {entry.action}{entry.details ? ` (${entry.details})` : ''}</p>
            ))}
          </div>
        </div>
      )}

      <RequiredDisclosure />
    </div>
  );
}
