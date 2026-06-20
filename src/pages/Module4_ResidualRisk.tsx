import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { logAudit } from '../lib/auditTrail';
import type { EscalationRecord, ResidualRiskLevel } from '../types';

const RISK_LEVEL_LABELS: Record<ResidualRiskLevel, string> = {
  low: 'Low — Condition is monitored with adequate safeguards',
  moderate: 'Moderate — Condition is unresolved with partial safeguards',
  high: 'High — Condition is unresolved with no adequate safeguards',
  unresolved: 'UNRESOLVED — No safeguards in place; escalation denied or unanswered',
};

const RISK_LEVEL_COLORS: Record<ResidualRiskLevel, string> = {
  low: 'bg-green-50 border-green-200 text-green-800',
  moderate: 'bg-amber-50 border-amber-200 text-amber-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  unresolved: 'bg-red-50 border-red-200 text-red-800',
};

function deriveRiskLevel(escalations: EscalationRecord[]): ResidualRiskLevel {
  const hasDenied = escalations.some(e => e.response === 'denied');
  const hasNoResponse = escalations.some(e => e.response === 'no_response');
  const hasDeferred = escalations.some(e => e.response === 'deferred');
  if (hasDenied && hasNoResponse) return 'unresolved';
  if (hasDenied || hasNoResponse) return 'high';
  if (hasDeferred) return 'moderate';
  return 'low';
}

export default function Module4_ResidualRisk() {
  const navigate = useNavigate();
  const sessionStart = useState(() => new Date().toISOString())[0];

  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [outstandingConcerns, setOutstandingConcerns] = useState('');
  const [patientsAffected, setPatientsAffected] = useState('');
  const [conditionStartTime, setConditionStartTime] = useState('');
  const [interimSafeguards, setInterimSafeguards] = useState('');
  const [anticipatedResolution, setAnticipatedResolution] = useState('');
  const [residualRiskLevel, setResidualRiskLevel] = useState<ResidualRiskLevel>('moderate');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [autoLevel, setAutoLevel] = useState<ResidualRiskLevel>('moderate');

  useEffect(() => {
    const e = localStorage.getItem('sc_escalations');
    if (e) {
      try {
        const parsed: EscalationRecord[] = JSON.parse(e);
        setEscalations(parsed);
        const derived = deriveRiskLevel(parsed);
        setAutoLevel(derived);
        setResidualRiskLevel(derived);
      } catch { /* */ }
    }
    const saved = localStorage.getItem('sc_residual_risk');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setOutstandingConcerns(d.outstandingConcerns || '');
        setPatientsAffected(d.patientsAffected || '');
        setConditionStartTime(d.conditionStartTime || '');
        setInterimSafeguards(d.interimSafeguards || '');
        setAnticipatedResolution(d.anticipatedResolution || '');
        setResidualRiskLevel(d.residualRiskLevel || 'moderate');
      } catch { /* */ }
    }
  }, []);

  const m6Triggered = escalations.some(e => e.response === 'denied' || e.response === 'no_response');

  const handleSave = () => {
    const record = {
      completedAt: new Date().toISOString(),
      outstandingConcerns,
      patientsAffected,
      conditionStartTime,
      interimSafeguards,
      anticipatedResolution,
      residualRiskLevel,
    };
    localStorage.setItem('sc_residual_risk', JSON.stringify(record));
    setSavedAt(new Date().toISOString());
    logAudit('MODULE4_SAVED', `Risk level: ${residualRiskLevel}`);
  };

  const handleContinue = () => {
    handleSave();
    navigate('/module5');
  };

  const canSave = outstandingConcerns.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 4: Residual Risk</h1>
        <p className="text-gray-600 mt-1 font-body">
          After an escalation attempt, document what patient safety risk remains unresolved. This creates a clear contemporaneous record that risk was reported and not remediated.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Created: {new Date(sessionStart).toLocaleString()}</span>
        </div>
      </div>

      {/* Escalation context */}
      {escalations.length > 0 && (
        <Card>
          <h2 className="font-heading font-bold text-navy text-base mb-3">Escalation History (from Module 3)</h2>
          {m6Triggered && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <Badge variant="red">CMDS M6</Badge>
              <p className="text-sm text-red-800">One or more escalation attempts resulted in denial or no response. Residual risk documentation is critical.</p>
            </div>
          )}
          <div className="space-y-2">
            {escalations.map((e, i) => (
              <div key={i} className={`p-2 rounded border text-xs ${e.response === 'denied' || e.response === 'no_response' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-warm'}`}>
                <span className="font-semibold">{e.attemptTime}</span> — {e.reportedTo} —{' '}
                <span className={e.response === 'denied' || e.response === 'no_response' ? 'text-red-700 font-semibold' : ''}>
                  {e.response === 'no_response' ? 'NO RESPONSE' : e.response.charAt(0).toUpperCase() + e.response.slice(1)}
                </span>
              </div>
            ))}
          </div>
          {autoLevel !== 'low' && (
            <p className="text-xs text-gray-500 mt-2">Risk level auto-set to <strong>{autoLevel.toUpperCase()}</strong> based on escalation outcomes. You may override below.</p>
          )}
        </Card>
      )}

      {/* Risk level */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-3">Current Residual Risk Level</h2>
        <div className="space-y-2">
          {(Object.keys(RISK_LEVEL_LABELS) as ResidualRiskLevel[]).map(level => (
            <label key={level} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${residualRiskLevel === level ? RISK_LEVEL_COLORS[level] + ' border-2' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="riskLevel"
                value={level}
                checked={residualRiskLevel === level}
                onChange={() => setResidualRiskLevel(level)}
                className="mt-0.5 accent-teal"
              />
              <div>
                <p className="text-sm font-semibold">{level.toUpperCase()}</p>
                <p className="text-xs mt-0.5 text-gray-700">{RISK_LEVEL_LABELS[level]}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Outstanding concerns */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-1">Outstanding Patient Safety Concerns</h2>
        <p className="text-xs text-gray-500 mb-3">Describe specifically what safety risk remains after your escalation attempt(s). Be factual and clinical.</p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm font-body text-gray-700 min-h-32 focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Example: Patient in room 8 with high fall risk had sitter removed at 1430. Escalation to charge RN was denied. Patient is confused, ambulatory, and had a fall during a prior admission. No alternative safety measures were implemented."
          value={outstandingConcerns}
          onChange={e => setOutstandingConcerns(e.target.value)}
        />
      </Card>

      {/* Details grid */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-4">Residual Risk Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Patients Affected (count/description — no names)</label>
              <input
                type="text"
                placeholder="e.g. 2 patients, one high acuity"
                value={patientsAffected}
                onChange={e => setPatientsAffected(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">When did the unsafe condition begin?</label>
              <input
                type="text"
                placeholder="e.g. 1400 — or start of shift"
                value={conditionStartTime}
                onChange={e => setConditionStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Interim Safeguards You Have Put in Place</label>
            <textarea
              placeholder="e.g. Repositioned patient, lowered bed, notified incoming nurse. No additional staffing support available."
              value={interimSafeguards}
              onChange={e => setInterimSafeguards(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal min-h-20 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Document all reasonable measures you took. This demonstrates professional due diligence.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Anticipated Resolution (or lack thereof)</label>
            <input
              type="text"
              placeholder="e.g. None provided / Shift change at 1900 / Manager stated 'check back in one hour'"
              value={anticipatedResolution}
              onChange={e => setAnticipatedResolution(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>
      </Card>

      {/* Regulatory note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
        <p className="font-semibold">Why this documentation matters</p>
        <p>A contemporaneous residual risk record establishes that: (1) you identified and reported an unsafe condition, (2) escalation was unsuccessful, and (3) you took reasonable interim measures. This satisfies ANA Code of Ethics Provision 3.4 (responsibility to report) and supports a General Duty Clause complaint under 29 U.S.C. § 654(a)(1).</p>
      </div>

      {savedAt && (
        <p className="text-xs text-gray-500 bg-warm border border-gray-200 rounded px-3 py-2">
          Saved {new Date(savedAt).toLocaleString()}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleContinue} disabled={!canSave}>Continue to Module 5</Button>
        <Button variant="ghost" onClick={handleSave} disabled={!canSave}>Save Draft</Button>
        <Button variant="ghost" onClick={() => navigate('/module3')}>Back to Module 3</Button>
      </div>
    </div>
  );
}
