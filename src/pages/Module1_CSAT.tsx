import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { csatDomains, evaluateCSATFlags } from '../lib/csatScoring';
import { useShiftRecord } from '../lib/store';
import type { CSATScore, CSATDomainScore } from '../types';

export function Module1_CSAT() {
  const navigate = useNavigate();
  const [record, update] = useShiftRecord();
  const [showCharge, setShowCharge] = useState(record.showChargeRN);

  const scores = record.csatScores;

  function getScore(domainId: string): CSATScore {
    return scores.find(s => s.domainId === domainId) ?? { domainId, primaryRN: 0 };
  }

  function setPrimaryScore(domainId: string, val: CSATDomainScore) {
    const updated = scores.filter(s => s.domainId !== domainId);
    const existing = getScore(domainId);
    update({ csatScores: [...updated, { ...existing, domainId, primaryRN: val }] });
  }

  function setChargeScore(domainId: string, val: CSATDomainScore) {
    const updated = scores.filter(s => s.domainId !== domainId);
    const existing = getScore(domainId);
    update({ csatScores: [...updated, { ...existing, domainId, chargeRN: val }] });
  }

  function toggleCharge() {
    setShowCharge(v => {
      update({ showChargeRN: !v });
      return !v;
    });
  }

  const flagResult = evaluateCSATFlags(scores);

  const flagBg = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }[flagResult.status];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">Module 1</div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Acuity Assessment (CSAT)</h1>
          <p className="text-sm text-gray-600">
            CRF Standardized Acuity Tool — Source: Nurse Risk Assessment doc, Tab 17.
            Score each domain 0–2. Primary RN completes Bedside Acuity. Charge RN entry optional.
          </p>
        </div>

        {/* Context fields */}
        <Card className="mb-6">
          <h2 className="font-heading font-semibold text-navy mb-4">Shift Context</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { id: 'nurseRole', label: 'Your Role', placeholder: 'RN, Charge RN, etc.' },
              { id: 'shiftType', label: 'Shift Type', placeholder: 'Day, Night, Evening, etc.' },
              { id: 'unitType', label: 'Unit Type', placeholder: 'Med-Surg, ICU, ED, L&D, etc.' },
              { id: 'state', label: 'State', placeholder: 'e.g. Texas' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-xs font-semibold text-navy mb-1">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={(record[f.id as keyof typeof record] as string) ?? ''}
                  onChange={e => update({ [f.id]: e.target.value } as Partial<typeof record>)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Charge RN toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={toggleCharge}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCharge ? 'bg-teal' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showCharge ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-navy">Include Charge RN parallel scores</span>
          {showCharge && (
            <span className="text-xs text-gray-500">(variance auto-flagged when scores differ)</span>
          )}
        </div>

        {/* Domain cards */}
        <div className="space-y-5">
          {csatDomains.map(domain => {
            const score = getScore(domain.id);
            const hasVariance = flagResult.varianceDomains.includes(domain.id);

            return (
              <Card key={domain.id} className={hasVariance ? 'border-red-200 bg-red-50/30' : ''}>
                <div className="flex items-start gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-navy">{domain.name}</h3>
                      {domain.isFTRPredictor && (
                        <Badge variant="red">Strongest FTR Predictor</Badge>
                      )}
                      {hasVariance && (
                        <Badge variant="red">Variance Detected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{domain.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {[0, 1, 2].map(val => (
                    <label key={val} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={`${domain.id}-primary`}
                        checked={score.primaryRN === val}
                        onChange={() => setPrimaryScore(domain.id, val as CSATDomainScore)}
                        className="mt-0.5 accent-teal"
                      />
                      <div>
                        <span className={`text-xs font-bold mr-1.5 ${val === 0 ? 'text-green-600' : val === 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {val}
                        </span>
                        <span className="text-sm text-gray-700">
                          {val === 0 ? domain.score0 : val === 1 ? domain.score1 : domain.score2}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {showCharge && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Charge RN Score</p>
                    <div className="flex gap-4">
                      {[0, 1, 2].map(val => (
                        <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name={`${domain.id}-charge`}
                            checked={score.chargeRN === val}
                            onChange={() => setChargeScore(domain.id, val as CSATDomainScore)}
                            className="accent-sage"
                          />
                          <span className={`font-medium ${val === 0 ? 'text-green-600' : val === 1 ? 'text-yellow-600' : 'text-red-600'}`}>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3 italic">Examples: {domain.examples}</p>
              </Card>
            );
          })}
        </div>

        {/* Flag result */}
        {scores.length > 0 && (
          <div className={`mt-6 p-4 rounded-xl border ${flagBg}`}>
            <p className="font-semibold text-sm mb-1">{flagResult.label}</p>
            <p className="text-sm">{flagResult.explanation}</p>
            {flagResult.hasVariance && flagResult.varianceDomains.length > 0 && (
              <p className="text-xs mt-2">
                Variance domains: {flagResult.varianceDomains.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
          <div className="flex gap-3">
            <Button variant="light" onClick={() => navigate('/module/8')}>Skip to Report</Button>
            <Button variant="teal" onClick={() => navigate('/module/2')}>Continue to Module 2 →</Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Source: Nurse Risk Assessment doc, Tab 17 · CRF doi:10.5281/zenodo.18237155
        </p>
      </div>
    </Layout>
  );
}
