import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useShiftRecord } from '../lib/store';
import { buildTranslatedReport, buildNurseAccountSummary, REQUIRED_DISCLOSURE } from '../lib/reportTranslator';
import { exportToPDF } from '../lib/pdfExport';
import { severityColors } from '../lib/nlpClassifier';
import { Download, Mail, ArrowRight, Edit2, Check } from 'lucide-react';

export function Report() {
  const navigate = useNavigate();
  const [record, update] = useShiftRecord();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const nurseAccount = buildNurseAccountSummary(record.freeText, record.classification);
  const translatedReport = record.editedTranslation ?? buildTranslatedReport(record);

  useEffect(() => {
    setEditText(translatedReport);
  }, []);

  function handleSaveEdit() {
    update({ editedTranslation: editText });
    setIsEditing(false);
  }

  function handleDownloadPDF() {
    exportToPDF(record);
  }

  function handleEmailToSelf() {
    const subject = encodeURIComponent('SafeChart Professional Documentation Record');
    const body = encodeURIComponent(
      `SafeChart Professional Documentation Record\n` +
      `Generated: ${new Date(record.timestamp).toLocaleString()}\n\n` +
      `NURSE'S ACCOUNT:\n${nurseAccount}\n\n` +
      `TRANSLATED RECORD:\n${translatedReport}\n\n` +
      `REQUIRED DISCLOSURE:\n${REQUIRED_DISCLOSURE}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const { classification } = record;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">
            Clinical Signal Conversion Pathway — Step 3 & 4
          </div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Translated Report</h1>
          <p className="text-sm text-gray-600">
            Left column: your account, verbatim and unedited. Right column: professional translation.
            Every field in the translated record is editable. Nothing is submitted until you explicitly approve.
          </p>
        </div>

        {/* Classification summary */}
        {classification && (
          <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-navy uppercase tracking-wide mb-3">Classification Summary</p>
            <div className="flex flex-wrap gap-2">
              {classification.matches.map(m => (
                <Badge key={m.category.id} variant="teal">{m.category.name}</Badge>
              ))}
              <Badge className={severityColors[classification.severityTier]}>
                {classification.severityTier.charAt(0).toUpperCase() + classification.severityTier.slice(1)} Severity
              </Badge>
              {classification.autoHighRisk && <Badge variant="red">Auto High-Risk Flag</Badge>}
              {classification.hasEscalationFailure && <Badge variant="red">Escalation Failure (CRF Stage 6)</Badge>}
              {classification.hasPatientDeterioration && <Badge variant="red">Patient Deterioration Signal</Badge>}
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {/* Left: nurse account */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-navy/5 border-b border-gray-100 px-5 py-3">
              <h2 className="font-heading font-bold text-sm text-navy">Your Account</h2>
              <p className="text-xs text-gray-400">Verbatim — unedited</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {nurseAccount}
              </p>

              {record.escalations.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-navy mb-3">Escalation Attempts Logged</p>
                  {record.escalations.map(esc => (
                    <div key={esc.id} className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">{esc.attemptTime}</span> → {esc.reportedTo}:{' '}
                      <span className={esc.response === 'resolved' ? 'text-green-600' : 'text-red-600'}>
                        {esc.response === 'no_response' ? 'No response' :
                         esc.response === 'denied' ? 'Denied' :
                         esc.response === 'deferred' ? 'Deferred' : 'Resolved'}
                      </span>
                      {esc.details && <span className="text-gray-500"> — {esc.details}</span>}
                    </div>
                  ))}
                </div>
              )}

              {record.csatScores.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-navy mb-2">CSAT Scores</p>
                  {record.csatScores.map(s => (
                    <div key={s.domainId} className="text-xs text-gray-600 flex gap-2 mb-1">
                      <span className="text-gray-400">{s.domainId.replace(/_/g, ' ')}:</span>
                      <span className={s.primaryRN === 2 ? 'text-red-600 font-medium' : s.primaryRN === 1 ? 'text-yellow-600' : 'text-green-600'}>
                        {s.primaryRN}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: translated record */}
          <div className="bg-white border border-teal/20 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-teal/5 border-b border-teal/10 px-5 py-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-sm text-navy">Translated Record</h2>
                <p className="text-xs text-gray-400">Professional documentation — editable</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => { setEditText(translatedReport); setIsEditing(true); }}
                  className="text-xs text-teal flex items-center gap-1 hover:underline"
                >
                  <Edit2 size={12} /> Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="text-xs text-green-600 flex items-center gap-1 hover:underline font-medium"
                >
                  <Check size={12} /> Save
                </button>
              )}
            </div>
            <div className="p-5">
              {isEditing ? (
                <textarea
                  className="w-full text-sm text-gray-700 leading-relaxed border border-teal/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal/30 resize-y min-h-[400px] font-mono text-xs"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
              ) : (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {translatedReport}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Disclosure */}
        <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-8">
          <p className="text-xs text-gray-500 leading-relaxed">{REQUIRED_DISCLOSURE}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download size={15} />
              Download PDF
            </Button>
            <Button variant="teal-outline" onClick={handleEmailToSelf} className="flex items-center gap-2">
              <Mail size={15} />
              Email to Self
            </Button>
          </div>
          <Button variant="teal" onClick={() => navigate('/module/8')} className="flex items-center gap-2">
            Continue to Routing
            <ArrowRight size={15} />
          </Button>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Source: CSCP — PRISMqd original · CRF doi:10.5281/zenodo.18237155 · CMDS doi:10.5281/zenodo.18985075
        </p>
      </div>
    </Layout>
  );
}
