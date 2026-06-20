import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { scoreCSAT } from '../lib/csatScoring';
import { logAudit } from '../lib/auditTrail';
import type { CSATScore } from '../types';

const DOMAINS = [
  {
    id: 'physiologic',
    name: 'Physiologic Stability',
    description: 'Vital sign trends, active instability indicators',
    score0: 'Stable vitals, no concerning trends',
    score1: 'Abnormal or trending vitals',
    score2: 'Active instability, rapid change',
    note: null,
  },
  {
    id: 'monitoring',
    name: 'Monitoring Intensity',
    description: 'Reassessment frequency, alarm burden, titration requirements',
    score0: 'Routine reassessment',
    score1: 'Frequent reassessment or alarms',
    score2: 'Near-continuous observation or titration',
    note: null,
  },
  {
    id: 'complexity',
    name: 'Care Complexity',
    description: 'Intervention volume, service coordination, task saturation',
    score0: 'Standard care, predictable tasks',
    score1: 'Multiple interventions or services',
    score2: 'High interruption rate or task saturation',
    note: null,
  },
  {
    id: 'trajectory',
    name: 'Trajectory Uncertainty',
    description: 'Likelihood of clinical deterioration; pending results; instability trajectory',
    score0: 'Stable and predictable',
    score1: 'Recent change or pending results',
    score2: 'High likelihood of deterioration',
    note: 'Trajectory Uncertainty is the strongest failure-to-rescue predictor in the literature (Tab 17). Weight heavily.',
  },
  {
    id: 'safety',
    name: 'Safety / Behavioral Risk',
    description: 'Fall, elopement, self-harm, violence risk indicators',
    score0: 'No safety concerns',
    score1: 'Moderate fall, delirium, or agitation risk',
    score2: 'Active self-harm, violence, or elopement risk',
    note: null,
  },
];

export default function Module1_CSAT() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CSATScore[]>(
    DOMAINS.map(d => ({ domain: d.id, primaryRN: undefined }))
  );
  const [showCharge, setShowCharge] = useState(false);
  const [draftSaved, setDraftSaved] = useState<string | null>(null);
  const sessionStart = useState(() => new Date().toISOString())[0];

  useEffect(() => {
    const saved = localStorage.getItem('sc_csat');
    if (saved) {
      setScores(JSON.parse(saved));
      const ds = localStorage.getItem('sc_csat_draft_time');
      if (ds) setDraftSaved(ds);
    }
  }, []);

  const updateScore = (domainId: string, field: 'primaryRN' | 'chargeRN', value: 0 | 1 | 2) => {
    setScores(prev => prev.map(s => s.domain === domainId ? { ...s, [field]: value } : s));
  };

  const allScored = scores.every(s => s.primaryRN !== undefined);
  const result = scoreCSAT(scores.map(s => ({ ...s, primaryRN: s.primaryRN ?? 0 })));

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    localStorage.setItem('sc_csat', JSON.stringify(scores));
    localStorage.setItem('sc_csat_draft_time', now);
    setDraftSaved(now);
    logAudit('CSAT_DRAFT_SAVED');
  };

  const handleContinue = () => {
    const now = new Date().toISOString();
    localStorage.setItem('sc_csat', JSON.stringify(scores));
    localStorage.setItem('sc_csat_saved_at', now);
    logAudit('CSAT_COMPLETED', `Tier: ${result.flag}`);
    navigate('/module2');
  };

  const flagColors = { green: 'green', yellow: 'yellow', red: 'red' } as const;
  const sessionDate = new Date(sessionStart).toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 1: Acuity Assessment</h1>
        <p className="text-gray-600 mt-1 font-body">Score each domain from 0–2. No default selections — each domain requires your explicit assessment.</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Created: {sessionDate}</span>
        </div>
      </div>

      {draftSaved && (
        <div className="text-xs text-gray-500 bg-warm border border-gray-200 rounded-lg px-3 py-2">
          Draft saved {new Date(draftSaved).toLocaleString()}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            {allScored ? (
              <>
                <Badge variant={flagColors[result.flag]}>{result.flag.toUpperCase()} FLAG</Badge>
                <p className="text-sm text-gray-600 mt-2">{result.explanation}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Score all five domains to see your acuity flag.</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showCharge} onChange={e => setShowCharge(e.target.checked)} className="w-4 h-4 accent-teal" />
            Show Charge RN parallel scoring
          </label>
        </div>
        {result.varianceSignals.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Variance Signals Detected:</p>
            {result.varianceSignals.map((sig, i) => (
              <p key={i} className="text-xs text-yellow-700">{sig}</p>
            ))}
          </div>
        )}
      </Card>

      {DOMAINS.map(domain => {
        const score = scores.find(s => s.domain === domain.id)!;
        return (
          <Card key={domain.id}>
            <h3 className="font-heading font-bold text-navy text-lg">{domain.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{domain.description}</p>
            {domain.note && (
              <p className="text-xs text-teal font-medium mb-3 italic">{domain.note}</p>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary RN Score</p>
              {([0, 1, 2] as const).map(val => {
                const label = domain[`score${val}` as 'score0' | 'score1' | 'score2'];
                return (
                  <label key={val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${score.primaryRN === val ? 'border-teal bg-teal bg-opacity-5' : 'border-gray-200 hover:border-teal'}`}>
                    <input
                      type="radio"
                      name={`${domain.id}-primary`}
                      checked={score.primaryRN === val}
                      onChange={() => updateScore(domain.id, 'primaryRN', val)}
                      className="mt-0.5 accent-teal"
                    />
                    <div>
                      <span className="font-semibold text-navy text-sm">{val}</span>
                      <span className="text-gray-600 text-sm ml-2">{label}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {showCharge && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Charge RN Score</p>
                {([0, 1, 2] as const).map(val => {
                  const label = domain[`score${val}` as 'score0' | 'score1' | 'score2'];
                  return (
                    <label key={val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${score.chargeRN === val ? 'border-sage bg-sage bg-opacity-5' : 'border-gray-200 hover:border-sage'}`}>
                      <input
                        type="radio"
                        name={`${domain.id}-charge`}
                        checked={score.chargeRN === val}
                        onChange={() => updateScore(domain.id, 'chargeRN', val)}
                        className="mt-0.5 accent-sage"
                      />
                      <div>
                        <span className="font-semibold text-navy text-sm">{val}</span>
                        <span className="text-gray-600 text-sm ml-2">{label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleContinue} disabled={!allScored}>
          Continue to Safe Assignment Checklist
        </Button>
        <Button variant="ghost" onClick={handleSaveDraft}>Save Draft</Button>
        <Button variant="ghost" onClick={() => navigate('/report')}>Skip to Report</Button>
      </div>
      {!allScored && (
        <p className="text-xs text-gray-500">Score all five domains to continue. Each domain requires your explicit assessment — no defaults are pre-selected.</p>
      )}
    </div>
  );
}
