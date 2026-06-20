import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { scoreCSAT } from '../lib/csatScoring';
import type { CSATScore } from '../types';

const DOMAINS = [
  { id: 'complexity', name: 'Complexity', description: 'Patient acuity, comorbidities, care complexity', score0: 'Stable, single-problem patient', score1: 'Moderate complexity, 2-3 active issues', score2: 'High acuity, multiple system involvement' },
  { id: 'surveillance', name: 'Surveillance', description: 'Observation requirements, monitoring frequency', score0: 'Routine monitoring', score1: 'Frequent checks required (every 30-60 min)', score2: 'Continuous surveillance needed' },
  { id: 'continuity', name: 'Continuity', description: 'Familiarity with patient, assignment continuity', score0: 'Established nurse-patient relationship', score1: 'Some familiarity; second or third assignment', score2: 'New patient, float assignment, or mid-shift transfer' },
  { id: 'communication', name: 'Communication', description: 'Interdisciplinary demands, family/patient communication load', score0: 'Routine communication load', score1: 'Elevated needs: family questions, frequent team contact', score2: 'Complex family dynamics or active conflict' },
  { id: 'escalation', name: 'Escalation Risk', description: 'Likelihood of needing rapid escalation', score0: 'Stable, no escalation anticipated', score1: 'Monitoring for possible changes', score2: 'Active deterioration risk or recent rapid response' },
];

export default function Module1_CSAT() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<CSATScore[]>(
    DOMAINS.map(d => ({ domain: d.id, primaryRN: 0 as 0 | 1 | 2 }))
  );
  const [showCharge, setShowCharge] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sc_csat');
    if (saved) setScores(JSON.parse(saved));
  }, []);

  const updateScore = (domainId: string, field: 'primaryRN' | 'chargeRN', value: 0 | 1 | 2) => {
    setScores(prev => prev.map(s => s.domain === domainId ? { ...s, [field]: value } : s));
  };

  const result = scoreCSAT(scores);

  const flagColors = { green: 'green', yellow: 'yellow', red: 'red' } as const;

  const handleContinue = () => {
    localStorage.setItem('sc_csat', JSON.stringify(scores));
    navigate('/module2');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 1: Acuity Assessment</h1>
        <p className="text-gray-600 mt-1 font-body">Score each domain from 0 (lowest concern) to 2 (highest concern).</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant={flagColors[result.flag]}>{result.flag.toUpperCase()} FLAG</Badge>
            <p className="text-sm text-gray-600 mt-2">{result.explanation}</p>
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
            <p className="text-xs text-gray-500 mb-4">{domain.description}</p>
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

      <div className="flex gap-4">
        <Button variant="teal" onClick={handleContinue}>Continue to Safe Assignment Checklist</Button>
        <Button variant="ghost" onClick={() => navigate('/report')}>Skip to Report</Button>
      </div>
    </div>
  );
}
