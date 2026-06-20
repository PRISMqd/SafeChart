import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { logAudit } from '../lib/auditTrail';
import type { ARILevel } from '../types';

interface ARIDomainDef {
  id: string;
  name: string;
  description: string;
  label0: string;
  label1: string;
  label2: string;
}

const ARI_DOMAINS: ARIDomainDef[] = [
  {
    id: 'cognitive_load',
    name: 'Cognitive Load',
    description: 'Ability to track all assigned patients\' conditions, manage competing tasks, and avoid errors under current assignment.',
    label0: '0 — No impairment. I can track all patients and manage tasks effectively.',
    label1: '1 — Mild. I am managing but with elevated cognitive effort and increased risk of error.',
    label2: '2 — Significant. Current load exceeds safe cognitive capacity. Risk of missed or delayed critical tasks.',
  },
  {
    id: 'fatigue',
    name: 'Fatigue Status',
    description: 'Alertness and physical endurance given hours worked, consecutive shifts, and rest before this shift.',
    label0: '0 — Rested. Adequate sleep and recovery before shift.',
    label1: '1 — Tired but functional. Fatigue is present; not yet impairing critical decision-making.',
    label2: '2 — Significantly fatigued. Impaired response time, concentration, or recall. Patient safety risk.',
  },
  {
    id: 'moral_distress',
    name: 'Moral Distress',
    description: 'The gap between what you know is professionally and ethically required and what current conditions allow you to deliver.',
    label0: '0 — No distress. Assignment conditions allow me to meet professional and ethical standards.',
    label1: '1 — Mild distress. I am making compromises I would not make in adequate conditions.',
    label2: '2 — Significant distress. I cannot meet what I know is safe professional practice. ANA Code of Ethics Provision 3 conflict.',
  },
  {
    id: 'retaliation_fear',
    name: 'Fear of Retaliation',
    description: 'Concern that fully documenting this incident, refusing the assignment, or escalating will result in professional consequences.',
    label0: '0 — None. I feel professionally supported in documenting and escalating freely.',
    label1: '1 — Mild concern. Present but not affecting my documentation or decision-making.',
    label2: '2 — Significant. Fear of consequences is affecting my willingness to fully document or refuse.',
  },
  {
    id: 'physical_capacity',
    name: 'Physical Capacity',
    description: 'Ability to safely perform required tasks — response speed, physical mobility, sustained intervention — given current assignment load.',
    label0: '0 — Full capacity. I can safely respond to all anticipated patient needs.',
    label1: '1 — Mild limitation. Manageable but with elevated risk of delayed response.',
    label2: '2 — Significant limitation. Physical capacity is a patient safety risk in current conditions.',
  },
];

function computeARILevel(scores: Record<string, number | undefined>): ARILevel {
  const vals = Object.values(scores).filter((v): v is number => v !== undefined);
  if (vals.length === 0) return 'low';
  const high = vals.filter(v => v === 2).length;
  const mid = vals.filter(v => v === 1).length;
  if (high >= 2) return 'high';
  if (high >= 1 || mid >= 3) return 'moderate';
  return 'low';
}

const ARI_LEVEL_STYLES: Record<ARILevel, string> = {
  low: 'bg-green-50 border-green-300 text-green-800',
  moderate: 'bg-amber-50 border-amber-300 text-amber-800',
  high: 'bg-red-50 border-red-300 text-red-800',
};

const ARI_LEVEL_MESSAGES: Record<ARILevel, string> = {
  low: 'LOW: No significant impairment indicators identified. Continue standard documentation practice.',
  moderate: 'MODERATE: One or more adverse response indicators present. Professional documentation of conditions is warranted. Consider escalation if not already completed.',
  high: 'HIGH: Multiple significant adverse response indicators present. Conditions represent a documented professional impairment risk. Escalation and contemporaneous documentation are strongly indicated.',
};

export default function Module6_ARI() {
  const navigate = useNavigate();
  const sessionStart = useState(() => new Date().toISOString())[0];

  const [scores, setScores] = useState<Record<string, 0 | 1 | 2 | undefined>>({});
  const [additionalContext, setAdditionalContext] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sc_ari');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.scores) setScores(d.scores);
        if (d.additionalContext) setAdditionalContext(d.additionalContext);
      } catch { /* */ }
    }
  }, []);

  const ariLevel = computeARILevel(scores);
  const allScored = ARI_DOMAINS.every(d => scores[d.id] !== undefined);

  const handleSave = () => {
    const record = {
      completedAt: new Date().toISOString(),
      scores,
      additionalContext,
      ariLevel,
    };
    localStorage.setItem('sc_ari', JSON.stringify(record));
    setSavedAt(new Date().toISOString());
    logAudit('MODULE6_SAVED', `ARI level: ${ariLevel}`);
  };

  const handleContinue = () => {
    handleSave();
    navigate('/report');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 6: Adverse Response Index</h1>
        <p className="text-gray-600 mt-1 font-body">
          The ARI is a professional self-assessment — not a mental health screen. It documents the conditions under which you are practicing, creating a contemporaneous record of practice impairment attributable to unsafe assignment.
        </p>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 font-medium">This is a professional documentation tool. It measures assignment conditions, not personal fitness. Your responses document the environment, not a clinical diagnosis. If you are in distress, see Peer Resources on the Report page.</p>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Created: {new Date(sessionStart).toLocaleString()}</span>
        </div>
      </div>

      {/* ARI level indicator */}
      {allScored && (
        <div className={`p-4 rounded-xl border-2 ${ARI_LEVEL_STYLES[ariLevel]}`}>
          <div className="flex gap-2 items-center mb-1">
            <Badge variant={ariLevel === 'high' ? 'red' : ariLevel === 'moderate' ? 'yellow' : 'green'}>
              ARI: {ariLevel.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm font-medium">{ARI_LEVEL_MESSAGES[ariLevel]}</p>
        </div>
      )}

      {/* Domain scoring */}
      <div className="space-y-4">
        {ARI_DOMAINS.map(domain => {
          const score = scores[domain.id];
          return (
            <Card key={domain.id}>
              <h3 className="font-heading font-bold text-navy text-base mb-1">{domain.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{domain.description}</p>
              <div className="space-y-2">
                {([0, 1, 2] as const).map(val => {
                  const label = val === 0 ? domain.label0 : val === 1 ? domain.label1 : domain.label2;
                  const isSelected = score === val;
                  const colors = val === 0 ? 'border-green-300 bg-green-50' : val === 1 ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50';
                  return (
                    <label
                      key={val}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? colors + ' border-2' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name={domain.id}
                        checked={isSelected}
                        onChange={() => setScores(prev => ({ ...prev, [domain.id]: val }))}
                        className="mt-0.5 accent-teal shrink-0"
                      />
                      <span className="text-sm text-gray-800">{label}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional context */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-1">Additional Context (optional)</h2>
        <p className="text-xs text-gray-500 mb-3">Note any factors not captured above that are relevant to your professional capacity during this assignment.</p>
        <textarea
          placeholder="Example: This is my third consecutive 12-hour shift. I was floated to a unit where I had not worked in 4 months. I have not received a meal break."
          value={additionalContext}
          onChange={e => setAdditionalContext(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal min-h-24 resize-y"
        />
      </Card>

      {/* Final ARI summary */}
      {allScored && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-2">
          <p className="font-semibold">ARI Summary — {ariLevel.toUpperCase()}</p>
          <div className="space-y-1">
            {ARI_DOMAINS.map(d => (
              <div key={d.id} className="flex justify-between items-center">
                <span>{d.name}</span>
                <span className={`font-semibold ${scores[d.id] === 2 ? 'text-red-700' : scores[d.id] === 1 ? 'text-amber-700' : 'text-green-700'}`}>
                  {scores[d.id] === 0 ? 'None' : scores[d.id] === 1 ? 'Mild' : 'Significant'}
                </span>
              </div>
            ))}
          </div>
          <p className="pt-2 border-t border-blue-200 text-blue-700">This ARI assessment will appear in your report and can be cited in any regulatory submission. It documents the conditions under which care was delivered — not a clinical judgment about your fitness.</p>
        </div>
      )}

      {savedAt && (
        <p className="text-xs text-gray-500 bg-warm border border-gray-200 rounded px-3 py-2">
          Saved {new Date(savedAt).toLocaleString()}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleContinue} disabled={!allScored}>Continue to Report</Button>
        <Button variant="ghost" onClick={handleSave} disabled={!allScored}>Save Draft</Button>
        <Button variant="ghost" onClick={() => navigate('/module5')}>Back to Module 5</Button>
      </div>
    </div>
  );
}
