import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { classifyText } from '../lib/nlpClassifier';
import { logAudit } from '../lib/auditTrail';
import type { EscalationRecord, EventType } from '../types';

type ResponseType = 'resolved' | 'deferred' | 'denied' | 'no_response';

const RESPONSE_LABELS: Record<ResponseType, string> = {
  resolved: 'Resolved',
  deferred: 'Deferred (no timeline given)',
  denied: 'Denied',
  no_response: 'No Response',
};

const RCA_PROMPTS = [
  'What time did the concerning condition begin?',
  'What was the patient\'s clinical status at that time?',
  'What specific safety concern did you identify?',
  'Who did you notify and at what time?',
  'What exact response did you receive?',
  'What action was taken (or not taken) as a result?',
  'Was there any change in patient condition following this event?',
];

const emptyEsc = (): EscalationRecord => ({
  attemptTime: '',
  reportedTo: '',
  response: '' as ResponseType,
  details: '',
  loggedAt: new Date().toISOString(),
});

export default function Module3_Escalation() {
  const navigate = useNavigate();
  const [freeText, setFreeText] = useState('');
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [current, setCurrent] = useState<EscalationRecord>(emptyEsc());
  const [showPrompts, setShowPrompts] = useState(false);
  const [draftSaved, setDraftSaved] = useState<string | null>(null);
  const [denialTimerStart, setDenialTimerStart] = useState<number | null>(null);
  const [denialElapsed, setDenialElapsed] = useState(0);
  const [eventType, setEventType] = useState<EventType | ''>('');
  const sessionStart = useState(() => new Date().toISOString())[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('sc_freetext');
    const e = localStorage.getItem('sc_escalations');
    const et = localStorage.getItem('sc_event_type');
    if (t) setFreeText(t);
    if (e) setEscalations(JSON.parse(e));
    if (et) setEventType(et as EventType);
  }, []);

  // Denial timer: check elapsed every 60 seconds
  useEffect(() => {
    if (!denialTimerStart) return;
    const interval = setInterval(() => {
      setDenialElapsed(Math.floor((Date.now() - denialTimerStart) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [denialTimerStart]);

  const classification = freeText.trim().length > 10 ? classifyText(freeText) : null;
  const m6Triggered = escalations.some(e => e.response === 'denied' || e.response === 'no_response');

  const addEscalation = () => {
    if (!current.attemptTime || !current.reportedTo || !current.response) return;
    const entry = { ...current, loggedAt: new Date().toISOString() };
    setEscalations(prev => [...prev, entry]);
    // Start denial timer on first denied/no_response
    if ((current.response === 'denied' || current.response === 'no_response') && !denialTimerStart) {
      setDenialTimerStart(Date.now());
      setDenialElapsed(0);
    }
    logAudit('ESCALATION_ADDED', `Response: ${current.response}`);
    setCurrent(emptyEsc());
    setShowForm(false);
  };

  const removeEscalation = (idx: number) => {
    setEscalations(prev => prev.filter((_, i) => i !== idx));
  };

  const appendPrompt = (prompt: string) => {
    const prefix = freeText.trim() ? '\n\n' : '';
    setFreeText(prev => prev + prefix + prompt + ' ');
    textareaRef.current?.focus();
  };

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    localStorage.setItem('sc_freetext', freeText);
    localStorage.setItem('sc_escalations', JSON.stringify(escalations));
    setDraftSaved(now);
    logAudit('MODULE3_DRAFT_SAVED');
  };

  const handleContinue = () => {
    localStorage.setItem('sc_freetext', freeText);
    localStorage.setItem('sc_escalations', JSON.stringify(escalations));
    logAudit('MODULE3_COMPLETED', `Escalations: ${escalations.length}`);
    navigate('/report');
  };

  const showDenialPrompt = denialTimerStart !== null && denialElapsed >= 30;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 3: Escalation Record</h1>
        <p className="text-gray-600 mt-1 font-body">Document your narrative and any escalation attempts made during this shift.</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Created: {new Date(sessionStart).toLocaleString()}</span>
        </div>
      </div>

      {eventType && (
        <div className="p-3 bg-warm border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Event Type</p>
          <p className="text-sm font-medium text-navy">{eventType}</p>
        </div>
      )}

      {draftSaved && (
        <div className="text-xs text-gray-500 bg-warm border border-gray-200 rounded-lg px-3 py-2">
          Draft saved {new Date(draftSaved).toLocaleString()}
        </div>
      )}

      {showDenialPrompt && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 font-medium">Has there been any update on this escalation?</p>
          <p className="text-xs text-amber-700 mt-1">It has been approximately 30 minutes since a denied or unanswered escalation was documented. You may add an update to your escalation log if the situation has changed.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowForm(true)}>Add Update</Button>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-navy text-lg">Your Narrative</h2>
          <button
            onClick={() => setShowPrompts(s => !s)}
            className="text-xs text-teal underline font-medium"
          >
            {showPrompts ? 'Hide prompts' : 'Show guided prompts'}
          </button>
        </div>

        {showPrompts && (
          <div className="mb-4 p-3 bg-warm rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">CRF Narrative Prompts — click to add to your narrative</p>
            <div className="space-y-1">
              {RCA_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => appendPrompt(p)}
                  className="block text-xs text-left text-teal hover:text-navy w-full py-1 border-b border-gray-100 last:border-0"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-3">Describe what happened in your own words. No clinical terminology required. Be specific about times, assignments, and concerns raised.</p>
        <textarea
          ref={textareaRef}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm font-body text-gray-700 min-h-40 focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Example: During my shift on 3 North, I was floated mid-shift to ICU at 1400 without orientation. I had not worked ICU in 6 months and was unfamiliar with the patients. I reported my concern to the charge nurse at 1420 and was told to 'figure it out'..."
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
        />
        {classification && classification.matches.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Signals Detected in Narrative</p>
            {classification.matches.map((m, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center">
                <Badge variant={classification.severityTier === 'critical' || classification.severityTier === 'high' ? 'red' : classification.severityTier === 'moderate' ? 'yellow' : 'teal'}>
                  {m.riskCategory}
                </Badge>
                {m.crfStages.map(s => <Badge key={s} variant="navy">{s}</Badge>)}
                {m.cmdsMechanisms.map(s => <Badge key={s} variant="sage">{s}</Badge>)}
              </div>
            ))}
            <div className="mt-2">
              <Badge variant={classification.severityTier === 'critical' || classification.severityTier === 'high' ? 'red' : classification.severityTier === 'moderate' ? 'yellow' : 'green'}>
                {classification.severityTier.toUpperCase()} SEVERITY
              </Badge>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-heading font-bold text-navy text-lg mb-3">Escalation Log</h2>
        {m6Triggered && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <Badge variant="red">CMDS M6</Badge>
            <p className="text-sm text-red-800">Institutional non-response documented. One or more escalation attempts resulted in denial or no response. CRF Stage 6 — escalation failure pathway engaged.</p>
          </div>
        )}

        {escalations.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 mb-3">No escalation attempts logged yet.</p>
        )}

        {escalations.map((esc, idx) => (
          <div key={idx} className={`p-3 rounded-lg border mb-2 ${esc.response === 'denied' || esc.response === 'no_response' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-warm'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-navy">{esc.attemptTime} — {esc.reportedTo}</p>
                <Badge variant={esc.response === 'denied' || esc.response === 'no_response' ? 'red' : esc.response === 'deferred' ? 'yellow' : 'green'}>
                  {RESPONSE_LABELS[esc.response as ResponseType] || esc.response}
                </Badge>
                {esc.details && <p className="text-xs text-gray-600 mt-1">{esc.details}</p>}
                {(esc.response === 'denied' || esc.response === 'no_response') && (
                  <p className="text-xs text-red-700 mt-1 font-medium">CRF Stage 6 · CMDS M6 — Institutional Non-Response</p>
                )}
                {esc.loggedAt && (
                  <p className="text-xs text-gray-400 mt-1">Logged: {new Date(esc.loggedAt).toLocaleString()}</p>
                )}
              </div>
              <button onClick={() => removeEscalation(idx)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
            </div>
          </div>
        ))}

        {showForm && (
          <div className="mt-3 p-4 bg-warm rounded-lg border border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Time of Attempt</label>
                <input
                  type="text"
                  placeholder="e.g. 14:20"
                  value={current.attemptTime}
                  onChange={e => setCurrent(p => ({ ...p, attemptTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Reported To</label>
                <input
                  type="text"
                  placeholder="e.g. Charge Nurse, House Supervisor"
                  value={current.reportedTo}
                  onChange={e => setCurrent(p => ({ ...p, reportedTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Response</label>
              <select
                value={current.response}
                onChange={e => setCurrent(p => ({ ...p, response: e.target.value as ResponseType }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="">-- Select response --</option>
                {(Object.keys(RESPONSE_LABELS) as ResponseType[]).map(k => (
                  <option key={k} value={k}>{RESPONSE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Details (optional)</label>
              <textarea
                placeholder="Describe the specific response received..."
                value={current.details}
                onChange={e => setCurrent(p => ({ ...p, details: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal min-h-16"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="teal" size="sm" onClick={addEscalation} disabled={!current.attemptTime || !current.reportedTo || !current.response}>
                Add Entry
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setCurrent(emptyEsc()); }}>Cancel</Button>
            </div>
          </div>
        )}

        {!showForm && (
          <Button variant="teal-outline" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
            + Add Escalation Attempt
          </Button>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleContinue}>Continue to Report</Button>
        <Button variant="ghost" onClick={handleSaveDraft}>Save Draft</Button>
        <Button variant="ghost" onClick={() => navigate('/module2')}>Back</Button>
      </div>
    </div>
  );
}
