import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import { classifyText } from '../lib/nlpClassifier';
import { translateReport } from '../lib/reportTranslator';
import { exportPDF } from '../lib/pdfExport';
import type { EscalationRecord, ClassificationResult } from '../types';

export default function Report() {
  const navigate = useNavigate();
  const [freeText, setFreeText] = useState('');
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [editedTranslated, setEditedTranslated] = useState('');

  useEffect(() => {
    const ft = localStorage.getItem('sc_freetext') || '';
    const esc = localStorage.getItem('sc_escalations');
    const cl = localStorage.getItem('sc_checklist_text');
    setFreeText(ft);
    if (esc) setEscalations(JSON.parse(esc));
    if (cl) setChecklistItems(JSON.parse(cl));

    if (ft.trim().length > 5) {
      const cls = classifyText(ft);
      setClassification(cls);
      const escArr = esc ? JSON.parse(esc) : [];
      const clArr = cl ? JSON.parse(cl) : [];
      const report = translateReport(ft, cls, escArr, clArr);
      setEditedTranslated(report);
    }
  }, []);

  const handleDownloadPDF = () => {
    exportPDF(freeText || '(No narrative entered)', editedTranslated, new Date().toLocaleString());
  };

  const mailto = `mailto:?subject=SafeChart Documentation Record&body=${encodeURIComponent(editedTranslated)}`;

  const tierColor = (tier: string): 'red' | 'yellow' | 'green' => {
    if (tier === 'critical' || tier === 'high') return 'red';
    if (tier === 'moderate') return 'yellow';
    return 'green';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Documentation Report</h1>
        <p className="text-gray-600 mt-1 font-body">Two-column view: your account alongside the professionally translated record.</p>
      </div>

      {classification && (
        <Card>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={tierColor(classification.severityTier)}>
              {classification.severityTier.toUpperCase()} SEVERITY
            </Badge>
            {classification.autoHighRisk && <Badge variant="red">AUTO HIGH-RISK</Badge>}
            {classification.hasEscalationFailure && <Badge variant="red">ESCALATION FAILURE</Badge>}
            {classification.hasPatientDeterioration && <Badge variant="red">PATIENT DETERIORATION</Badge>}
            {classification.matches.flatMap(m => m.crfStages).filter((v, i, a) => a.indexOf(v) === i).map(s => (
              <Badge key={s} variant="navy">{s}</Badge>
            ))}
            {classification.matches.flatMap(m => m.cmdsMechanisms).filter((v, i, a) => a.indexOf(v) === i).map(s => (
              <Badge key={s} variant="sage">{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading font-bold text-navy text-lg mb-3">Your Account</h2>
          <Card className="h-full">
            <p className="text-sm text-gray-700 whitespace-pre-wrap font-body">
              {freeText || <span className="text-gray-400 italic">No narrative entered.</span>}
            </p>
            {checklistItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Checklist Flags</p>
                {checklistItems.map((item, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1">• {item}</p>
                ))}
              </div>
            )}
            {escalations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Escalation Attempts</p>
                {escalations.map((esc, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1">{esc.attemptTime} → {esc.reportedTo}: {esc.response.replace('_', ' ')}</p>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <h2 className="font-heading font-bold text-navy text-lg mb-3">Translated Record</h2>
          <Card className="h-full">
            <textarea
              className="w-full text-sm font-body text-gray-700 min-h-80 focus:outline-none resize-y border-none outline-none"
              value={editedTranslated}
              onChange={e => setEditedTranslated(e.target.value)}
              placeholder="Translated documentation will appear here after narrative is entered in Module 3."
            />
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleDownloadPDF}>Download PDF</Button>
        <a href={mailto}>
          <Button variant="teal-outline">Email to Self</Button>
        </a>
        <Button variant="primary" onClick={() => navigate('/module8')}>Continue to Routing</Button>
        <Button variant="ghost" onClick={() => navigate('/module3')}>Back to Escalation</Button>
      </div>

      <RequiredDisclosure />
    </div>
  );
}
