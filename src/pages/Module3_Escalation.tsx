import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useShiftRecord } from '../lib/store';
import { classifyText } from '../lib/nlpClassifier';
import type { EscalationEntry } from '../types';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

function generateId() {
  return `esc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const responseLabels: Record<EscalationEntry['response'], string> = {
  resolved: 'Resolved',
  deferred: 'Deferred — not yet acted upon',
  denied: 'Denied',
  no_response: 'No Response Received',
};

const responseColors: Record<EscalationEntry['response'], string> = {
  resolved: 'green',
  deferred: 'yellow',
  denied: 'red',
  no_response: 'red',
};

export function Module3_Escalation() {
  const navigate = useNavigate();
  const [record, update] = useShiftRecord();

  const [newEntry, setNewEntry] = useState<Partial<EscalationEntry>>({
    response: 'resolved',
  });

  function addEntry() {
    if (!newEntry.attemptTime || !newEntry.reportedTo || !newEntry.response) return;
    const entry: EscalationEntry = {
      id: generateId(),
      attemptTime: newEntry.attemptTime!,
      reportedTo: newEntry.reportedTo!,
      response: newEntry.response as EscalationEntry['response'],
      details: newEntry.details ?? '',
    };
    update({ escalations: [...record.escalations, entry] });
    setNewEntry({ response: 'resolved' });
  }

  function removeEntry(id: string) {
    update({ escalations: record.escalations.filter(e => e.id !== id) });
  }

  function handleFreeTextChange(text: string) {
    const classification = classifyText(text);
    update({ freeText: text, classification });
  }

  const hasUnresolvedEscalations = record.escalations.some(
    e => e.response === 'denied' || e.response === 'no_response'
  );

  const m6Flag = hasUnresolvedEscalations;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">Module 3</div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Escalation Record</h1>
          <p className="text-sm text-gray-600">
            Source: CRF Stage 6 doi:10.5281/zenodo.18237155; CMDS M6 doi:10.5281/zenodo.18985075.
            Document your narrative and any escalation attempts made during this shift.
          </p>
        </div>

        {/* Narrative */}
        <Card className="mb-6">
          <h2 className="font-heading font-semibold text-navy mb-2">Your Narrative</h2>
          <p className="text-xs text-gray-500 mb-3">
            Describe what happened in your own words. No clinical terminology required. This text will appear verbatim in the left column of your translated report.
          </p>
          <textarea
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 resize-y"
            placeholder="I was floated to the ICU at the start of my shift. I've never worked that unit and wasn't given an orientation. My patient looked like they were declining but the charge nurse told me I was overreacting..."
            value={record.freeText}
            onChange={e => handleFreeTextChange(e.target.value)}
          />
          {record.classification && record.classification.matches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {record.classification.matches.map(m => (
                <Badge key={m.category.id} variant="teal">{m.category.name}</Badge>
              ))}
              <Badge
                variant={
                  record.classification.severityTier === 'critical' ? 'red' :
                  record.classification.severityTier === 'high' ? 'red' :
                  record.classification.severityTier === 'moderate' ? 'yellow' : 'gray'
                }
              >
                {record.classification.severityTier.charAt(0).toUpperCase() + record.classification.severityTier.slice(1)} Severity
              </Badge>
              {record.classification.autoHighRisk && (
                <Badge variant="red">Auto High-Risk</Badge>
              )}
            </div>
          )}
        </Card>

        {/* M6 flag */}
        {m6Flag && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">CMDS M6 — Escalation Suppression Flagged</p>
              <p className="text-xs text-red-700 mt-1">
                "Your escalation attempt was not acted upon. This pattern is documented in published safety science as escalation suppression, a recognized organizational mechanism that increases failure-to-rescue risk."
                Source: CMDS doi:10.5281/zenodo.18985075
              </p>
              <p className="text-xs text-red-600 mt-2 font-medium">
                BON and OSHA routing are available in Module 8.
              </p>
            </div>
          </div>
        )}

        {/* Escalation log */}
        <Card className="mb-6">
          <h2 className="font-heading font-semibold text-navy mb-4">Escalation Attempt Log</h2>

          {record.escalations.length === 0 && (
            <p className="text-sm text-gray-400 mb-4 italic">No escalation attempts logged yet.</p>
          )}

          <div className="space-y-3 mb-6">
            {record.escalations.map(esc => (
              <div
                key={esc.id}
                className={`rounded-lg p-3 border ${
                  esc.response === 'resolved' ? 'bg-green-50 border-green-200' :
                  esc.response === 'deferred' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-navy">{esc.attemptTime}</span>
                      <span className="text-xs text-gray-600">→ {esc.reportedTo}</span>
                      <Badge variant={responseColors[esc.response] as 'green' | 'yellow' | 'red'}>
                        {responseLabels[esc.response]}
                      </Badge>
                    </div>
                    {esc.details && <p className="text-xs text-gray-600">{esc.details}</p>}
                    {(esc.response === 'denied' || esc.response === 'no_response') && (
                      <p className="text-xs text-red-700 font-medium mt-1">CMDS M6 Escalation Suppression flagged</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEntry(esc.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new entry */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-heading font-semibold text-sm text-navy mb-3">Log New Escalation Attempt</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Time of Attempt</label>
                <input
                  type="time"
                  value={newEntry.attemptTime ?? ''}
                  onChange={e => setNewEntry(n => ({ ...n, attemptTime: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Reported To</label>
                <input
                  type="text"
                  placeholder="Charge RN, Supervisor, MD, etc."
                  value={newEntry.reportedTo ?? ''}
                  onChange={e => setNewEntry(n => ({ ...n, reportedTo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-navy mb-1">Response Received</label>
              <select
                value={newEntry.response ?? 'resolved'}
                onChange={e => setNewEntry(n => ({ ...n, response: e.target.value as EscalationEntry['response'] }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 bg-white"
              >
                <option value="resolved">Resolved — action taken</option>
                <option value="deferred">Deferred — not yet acted upon</option>
                <option value="denied">Denied</option>
                <option value="no_response">No Response Received</option>
              </select>
              {(newEntry.response === 'denied' || newEntry.response === 'no_response') && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  CMDS M6 Escalation Suppression will be auto-flagged on this entry.
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-navy mb-1">Details (optional)</label>
              <textarea
                rows={2}
                placeholder="What was said, what action was or was not taken..."
                value={newEntry.details ?? ''}
                onChange={e => setNewEntry(n => ({ ...n, details: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 resize-none"
              />
            </div>
            <Button
              variant="teal-outline"
              size="sm"
              onClick={addEntry}
              disabled={!newEntry.attemptTime || !newEntry.reportedTo}
              className="flex items-center gap-2"
            >
              <Plus size={14} />
              Add Escalation Entry
            </Button>
          </div>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="ghost" onClick={() => navigate('/module/2')}>← Module 2</Button>
          <Button variant="teal" onClick={() => navigate('/module/8')}>Continue to Report →</Button>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Source: CRF doi:10.5281/zenodo.18237155 · CMDS doi:10.5281/zenodo.18985075
        </p>
      </div>
    </Layout>
  );
}
