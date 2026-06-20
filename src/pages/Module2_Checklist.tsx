import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const CHECKLIST_SECTIONS = [
  {
    id: 'continuity',
    title: 'Continuity Violations',
    items: [
      { id: 'cv1', text: 'Float or cross-unit assignment without competency verification', basis: 'Functional unfamiliarity impairs recognition speed (CRF Stage 2)', citation: '42 CFR § 482.23(b)(5)', crfStage: 'Stage 2', autoRisk: false },
      { id: 'cv2', text: 'Mid-shift patient reassignment without clinical justification', basis: 'Auto High-Risk flag: CMDS M4/M6 — continuity disruption during active care', citation: 'CRF Framework, Stage 2', crfStage: 'Stage 2', autoRisk: true },
      { id: 'cv3', text: 'Assignment of patient outside established scope of competency', basis: 'Competency boundary violation (CMDS M5)', citation: 'ANA Code of Ethics, Provision 3', crfStage: 'Stage 2', autoRisk: false },
      { id: 'cv4', text: 'No orientation or handoff provided on float unit', basis: 'Recognition speed impairment without baseline familiarity', citation: '42 CFR § 482.23(b)', crfStage: 'Stage 2-3', autoRisk: false },
    ],
  },
  {
    id: 'recognition',
    title: 'Recognition Impairment',
    items: [
      { id: 'ri1', text: 'Clinical concern was dismissed without clinical rationale', basis: 'Perception destabilization (CMDS M3) — erodes clinical decision authority', citation: 'ANA Code of Ethics, Provision 6', crfStage: 'Stage 3', autoRisk: false },
      { id: 'ri2', text: 'Nurse was told to "figure it out" or concern was minimized', basis: 'Institutional non-response to professional escalation (CMDS M6)', citation: '29 U.S.C. § 654(a)(1)', crfStage: 'Stage 6', autoRisk: false },
      { id: 'ri3', text: 'Assessment finding was not accepted by charge nurse or supervisor', basis: 'Clinical authority undermining — impairs escalation pathway integrity', citation: 'ANA Code of Ethics, Provision 3', crfStage: 'Stage 3', autoRisk: false },
    ],
  },
  {
    id: 'surveillance',
    title: 'Surveillance Overload',
    items: [
      { id: 'so1', text: 'Unable to complete timely assessments across all assigned patients', basis: 'Surveillance dilution — ratio-induced recognition delay risk', citation: '42 CFR § 482.23(b)', crfStage: 'Stage 1-2', autoRisk: false },
      { id: 'so2', text: 'Sitter or safety attendant removed without documented clinical criteria', basis: 'Safety downgrade — increases adverse event probability for monitored patients', citation: '42 CFR § 482.13', crfStage: 'Stage 1-2', autoRisk: false },
      { id: 'so3', text: 'Patient monitoring frequency reduced without physician order', basis: 'Surveillance protocol deviation under unsafe staffing conditions', citation: '42 CFR § 482.23(c)', crfStage: 'Stage 1', autoRisk: false },
    ],
  },
  {
    id: 'fatigue',
    title: 'Fatigue and Compounding Risk',
    items: [
      { id: 'fc1', text: 'Mandatory overtime or back-to-back shift assignment', basis: 'Staffing debt accumulation — fatigue elevates vulnerability across all CRF stages', citation: '29 U.S.C. § 654(a)(1)', crfStage: 'All stages', autoRisk: false },
      { id: 'fc2', text: 'Unable to take meal or rest break during shift', basis: 'Compounded physiological risk impairs clinical judgment and recognition', citation: 'OSHA GDC — 29 U.S.C. § 654(a)(1)', crfStage: 'All stages', autoRisk: false },
      { id: 'fc3', text: 'Third or greater consecutive shift worked', basis: 'Cumulative fatigue creates systemic risk amplification', citation: 'ANA Position Statement on Nurse Fatigue', crfStage: 'All stages', autoRisk: false },
      { id: 'fc4', text: 'Census increase without proportional staffing increase', basis: 'Workload compression (CMDS M1) — acuity-adjusted threshold breach', citation: '42 CFR § 482.23(b)(1)', crfStage: 'Stage 1-2', autoRisk: false },
    ],
  },
  {
    id: 'escalation',
    title: 'Escalation Impairment',
    items: [
      { id: 'ei1', text: 'Escalation attempt resulted in no response or deferral', basis: 'Institutional non-response (CMDS M6 / CMDS S4) — escalation pathway failure', citation: '29 U.S.C. § 654(a)(1)', crfStage: 'Stage 6', autoRisk: false },
      { id: 'ei2', text: 'Nurse was discouraged or warned against formal documentation', basis: 'Signal suppression (CMDS S2 / M7) — may constitute obstruction', citation: '42 CFR § 482.24', crfStage: 'Stage 7', autoRisk: false },
      { id: 'ei3', text: 'Incident report was not submitted due to perceived institutional pressure', basis: 'Documentation interference — undermines QAPI reporting requirements', citation: '42 CFR § 482.21', crfStage: 'Stage 7-8', autoRisk: false },
    ],
  },
];

export default function Module2_Checklist() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('sc_checklist');
    if (saved) setChecked(new Set(JSON.parse(saved)));
  }, []);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    const items = CHECKLIST_SECTIONS.flatMap(s => s.items).filter(i => checked.has(i.id)).map(i => i.text);
    localStorage.setItem('sc_checklist', JSON.stringify([...checked]));
    localStorage.setItem('sc_checklist_text', JSON.stringify(items));
    navigate('/module3');
  };

  const autoRiskFlagged = CHECKLIST_SECTIONS.flatMap(s => s.items).some(i => i.autoRisk && checked.has(i.id));
  const checkedCount = checked.size;

  const hasFloat = checked.has('cv1') || checked.has('cv3');
  const hasOT = checked.has('fc1') || checked.has('fc3');
  const compoundFlag = hasFloat && hasOT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Module 2: Safe Assignment Checklist</h1>
        <p className="text-gray-600 mt-1 font-body">Check all items that apply to this shift. Each carries a safety science basis and regulatory citation.</p>
      </div>

      {(autoRiskFlagged || compoundFlag) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          {autoRiskFlagged && (
            <div className="flex gap-2 items-start mb-2">
              <Badge variant="red">AUTO HIGH-RISK</Badge>
              <p className="text-sm text-red-800">Mid-shift reassignment flagged. This is a non-removable high-risk designation under the CRF framework.</p>
            </div>
          )}
          {compoundFlag && (
            <div className="flex gap-2 items-start">
              <Badge variant="red">COMPOUND FLAG</Badge>
              <p className="text-sm text-red-800">Float assignment combined with fatigue factor detected. Compounded risk elevates vulnerability across all CRF stages.</p>
            </div>
          )}
        </div>
      )}

      {checkedCount > 0 && (
        <div className="p-3 bg-warm border border-gray-200 rounded-lg">
          <p className="text-sm text-navy font-semibold">{checkedCount} safety flag{checkedCount !== 1 ? 's' : ''} documented</p>
        </div>
      )}

      {CHECKLIST_SECTIONS.map(section => (
        <Card key={section.id}>
          <h2 className="font-heading font-bold text-navy text-xl mb-4">{section.title}</h2>
          <div className="space-y-3">
            {section.items.map(item => (
              <div key={item.id}>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked.has(item.id) ? 'border-teal bg-teal bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="mt-1 w-4 h-4 accent-teal"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">{item.text}</p>
                    {item.autoRisk && <Badge variant="red">AUTO HIGH-RISK</Badge>}
                  </div>
                </label>
                {checked.has(item.id) && (
                  <div className="ml-7 mt-1 p-3 bg-warm rounded-lg border-l-4 border-teal">
                    <p className="text-xs text-gray-700 font-medium">{item.basis}</p>
                    <p className="text-xs text-teal mt-1">{item.citation} · CRF {item.crfStage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button variant="teal" onClick={handleContinue}>Continue to Escalation Record</Button>
        <Button variant="ghost" onClick={() => navigate('/report')}>Skip to Report</Button>
      </div>
    </div>
  );
}
