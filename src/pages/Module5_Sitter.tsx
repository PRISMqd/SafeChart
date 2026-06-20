import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { logAudit } from '../lib/auditTrail';
import { SITTER_NEEDS, type SitterNeed } from '../types';

const INTERNAL_CHAIN = [
  'Charge RN',
  'Shift Supervisor / House Supervisor',
  'Nurse Manager / Unit Director',
  'Administrator on Call',
  'Chief Nursing Officer (CNO)',
];

const RESPONSE_LABELS: Record<string, string> = {
  acknowledged: 'Acknowledged — action taken',
  deferred: 'Deferred — no action taken',
  denied: 'Denied',
  no_response: 'No Response',
};

export default function Module5_Sitter() {
  const navigate = useNavigate();
  const sessionStart = useState(() => new Date().toISOString())[0];

  const [monitoringNeeds, setMonitoringNeeds] = useState<SitterNeed[]>([]);
  const [monitoringNeedOther, setMonitoringNeedOther] = useState('');
  const [sitterAssignedAtStart, setSitterAssignedAtStart] = useState<boolean | null>(null);
  const [sitterRemovedOrDenied, setSitterRemovedOrDenied] = useState<boolean | null>(null);
  const [removalTime, setRemovalTime] = useState('');
  const [removedByRole, setRemovedByRole] = useState('');
  const [reasonGiven, setReasonGiven] = useState('');
  const [timeWithoutCoverage, setTimeWithoutCoverage] = useState('');
  const [nurseObjection, setNurseObjection] = useState('');
  const [patientOutcome, setPatientOutcome] = useState('');
  const [internalChain, setInternalChain] = useState<Record<string, { response: string; details: string }>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sc_sitter');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.monitoringNeeds) setMonitoringNeeds(d.monitoringNeeds);
        if (d.monitoringNeedOther) setMonitoringNeedOther(d.monitoringNeedOther);
        setSitterAssignedAtStart(d.sitterAssignedAtStart ?? null);
        setSitterRemovedOrDenied(d.sitterRemovedOrDenied ?? null);
        if (d.removalTime) setRemovalTime(d.removalTime);
        if (d.removedByRole) setRemovedByRole(d.removedByRole);
        if (d.reasonGiven) setReasonGiven(d.reasonGiven);
        if (d.timeWithoutCoverage) setTimeWithoutCoverage(d.timeWithoutCoverage);
        if (d.nurseObjection) setNurseObjection(d.nurseObjection);
        if (d.patientOutcome) setPatientOutcome(d.patientOutcome);
        if (d.internalChain) setInternalChain(d.internalChain);
      } catch { /* */ }
    }
  }, []);

  const toggleNeed = (need: SitterNeed) => {
    setMonitoringNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const updateChain = (level: string, field: 'response' | 'details', value: string) => {
    setInternalChain(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value },
    }));
  };

  const handleSave = () => {
    const record = {
      completedAt: new Date().toISOString(),
      monitoringNeeds,
      monitoringNeedOther,
      sitterAssignedAtStart,
      sitterRemovedOrDenied,
      removalTime,
      removedByRole,
      reasonGiven,
      timeWithoutCoverage,
      nurseObjection,
      patientOutcome,
      internalChain,
    };
    localStorage.setItem('sc_sitter', JSON.stringify(record));
    setSavedAt(new Date().toISOString());
    logAudit('MODULE5_SAVED', `Needs: ${monitoringNeeds.join(', ')}`);
  };

  const handleContinue = () => {
    handleSave();
    navigate('/module6');
  };

  const removalConcern = sitterRemovedOrDenied === true;
  const canSave = monitoringNeeds.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 5: Sitter / Safety Attendant</h1>
        <p className="text-gray-600 mt-1 font-body">
          Document safety attendant assignment, removal, or denial. Sitter removal without adequate alternative safeguards is a documented patient safety risk.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 bg-teal bg-opacity-10 border border-teal rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-teal">CONTEMPORANEOUS RECORD</span>
          <span className="text-xs text-gray-600">Created: {new Date(sessionStart).toLocaleString()}</span>
        </div>
      </div>

      {/* Monitoring needs */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-1">Patient Monitoring Need(s)</h2>
        <p className="text-xs text-gray-500 mb-3">Select all that apply. Do not include patient names or room numbers.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SITTER_NEEDS.map(need => (
            <label key={need} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${monitoringNeeds.includes(need) ? 'border-teal bg-teal bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="checkbox"
                checked={monitoringNeeds.includes(need)}
                onChange={() => toggleNeed(need)}
                className="accent-teal"
              />
              <span className="text-sm">{need}</span>
            </label>
          ))}
        </div>
        {monitoringNeeds.includes('Other') && (
          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-600 block mb-1">Specify Other Need</label>
            <input
              type="text"
              value={monitoringNeedOther}
              onChange={e => setMonitoringNeedOther(e.target.value)}
              placeholder="Describe the monitoring need"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        )}
      </Card>

      {/* Assignment status */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-4">Safety Attendant Assignment Status</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Was a safety attendant assigned at the start of your shift?</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <label key={String(val)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${sitterAssignedAtStart === val ? 'border-teal bg-teal bg-opacity-5 font-semibold' : 'border-gray-200'}`}>
                  <input type="radio" checked={sitterAssignedAtStart === val} onChange={() => setSitterAssignedAtStart(val)} className="accent-teal" />
                  <span className="text-sm">{val ? 'Yes' : 'No'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Was the safety attendant removed, or was your request for one denied?</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <label key={String(val)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${sitterRemovedOrDenied === val ? (val ? 'border-red-300 bg-red-50 font-semibold' : 'border-teal bg-teal bg-opacity-5 font-semibold') : 'border-gray-200'}`}>
                  <input type="radio" checked={sitterRemovedOrDenied === val} onChange={() => setSitterRemovedOrDenied(val)} className="accent-teal" />
                  <span className="text-sm">{val ? 'Yes — removed or denied' : 'No'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Removal details — only shown if removed/denied */}
      {removalConcern && (
        <Card>
          <div className="flex gap-2 items-center mb-4">
            <Badge variant="red">SAFETY CONCERN</Badge>
            <span className="text-sm text-red-800 font-medium">Safety attendant removed or denied — document details</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Time of Removal / Denial</label>
                <input
                  type="text"
                  placeholder="e.g. 1430"
                  value={removalTime}
                  onChange={e => setRemovalTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Decision Made By (role)</label>
                <input
                  type="text"
                  placeholder="e.g. Charge RN, House Supervisor, Nurse Manager"
                  value={removedByRole}
                  onChange={e => setRemovedByRole(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Reason Given for Removal / Denial</label>
              <input
                type="text"
                placeholder="e.g. 'Sitters are not available tonight' / 'Patient doesn't meet criteria'"
                value={reasonGiven}
                onChange={e => setReasonGiven(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Estimated Time Patient Was Without Coverage</label>
              <input
                type="text"
                placeholder="e.g. 2 hours / remainder of shift / ongoing"
                value={timeWithoutCoverage}
                onChange={e => setTimeWithoutCoverage(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>

            {/* Internal escalation chain */}
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Internal Escalation Chain</p>
              <p className="text-xs text-gray-500 mb-3">Document each level of the internal chain you reported to regarding this sitter removal/denial.</p>
              <div className="space-y-3">
                {INTERNAL_CHAIN.map(level => (
                  <div key={level} className="p-3 bg-warm rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-navy mb-2">{level}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={internalChain[level]?.response || ''}
                        onChange={e => updateChain(level, 'response', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal"
                      >
                        <option value="">-- Not reported / N/A --</option>
                        {Object.entries(RESPONSE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={internalChain[level]?.details || ''}
                        onChange={e => updateChain(level, 'details', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Your Documented Objection</label>
              <textarea
                placeholder="Example: I verbally objected to the sitter removal to the charge RN at 1435, stating that the patient had a documented fall risk and was ambulatory and confused. No alternative safety measures were provided."
                value={nurseObjection}
                onChange={e => setNurseObjection(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal min-h-24 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">Document your objection in detail. This is an ANA Code of Ethics Provision 3 professional obligation.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Patient outcome */}
      <Card>
        <h2 className="font-heading font-bold text-navy text-base mb-1">Patient Outcome (optional)</h2>
        <p className="text-xs text-gray-500 mb-3">Note any change in patient condition related to this staffing condition. Do not include identifying information.</p>
        <textarea
          placeholder="Example: Patient was found ambulating without assistance at 1615 and sustained a fall. Fall documented per facility protocol."
          value={patientOutcome}
          onChange={e => setPatientOutcome(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal min-h-20 resize-y"
        />
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
        <p className="font-semibold">Applicable Authority</p>
        <p>42 CFR § 482.13 — Patient rights: the hospital must protect and promote each patient's rights, including freedom from neglect. Removal of a safety attendant from a patient with documented monitoring needs without adequate alternative safeguards may constitute a Conditions of Participation violation.</p>
      </div>

      {savedAt && (
        <p className="text-xs text-gray-500 bg-warm border border-gray-200 rounded px-3 py-2">
          Saved {new Date(savedAt).toLocaleString()}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleContinue} disabled={!canSave}>Continue to Module 6</Button>
        <Button variant="ghost" onClick={handleSave} disabled={!canSave}>Save Draft</Button>
        <Button variant="ghost" onClick={() => navigate('/module4')}>Back to Module 4</Button>
      </div>
    </div>
  );
}
