import Card from '../components/ui/Card';

const TERMS = [
  { term: 'Functional Unfamiliarity', definition: 'The clinical state in which a nurse is assigned to provide care in a unit, specialty, or patient population outside their established scope of unit-specific competency. Functional unfamiliarity impairs recognition speed, assessment accuracy, and intervention capacity.', citation: 'CRF Stage 2; CMDS M5' },
  { term: 'Recognition Speed Impairment', definition: 'A reduction in the speed at which a nurse can accurately identify a clinically significant change in patient condition, typically caused by surveillance dilution, continuity disruption, or functional unfamiliarity.', citation: 'CRF Stage 1-3' },
  { term: 'Surveillance Dilution', definition: 'The progressive reduction in the quality and frequency of individual patient observation that occurs as nurse-to-patient ratios exceed safe clinical threshold or as acuity-adjusted load increases beyond manageable capacity.', citation: 'CRF Stage 1-2; CMDS M1' },
  { term: 'Residual Risk Load', definition: 'The accumulated, unresolved patient safety risk that remains at the end of a shift or following an institutional non-response to escalation. Residual risk load represents the delta between what was escalated and what was resolved.', citation: 'CRF Stage 5-6; CMDS S5' },
  { term: 'Staffing Debt', definition: "The cumulative accrual of workload, fatigue, and unresolved patient care demands that exceeds the nurse's clinical capacity over the course of a shift or across consecutive shifts. Staffing debt is compounding and systemic, not individual.", citation: 'CMDS M1; CRF Stage 8-9' },
  { term: 'New to Unit', definition: 'A nurse who is assigned to a patient care unit in which they have not previously established clinical familiarity, regardless of their overall nursing experience. New-to-unit status is a functional unfamiliarity risk factor independent of competency level.', citation: 'CRF Stage 2; CMDS M5' },
  { term: 'Mid-Shift Reassignment', definition: 'The reassignment of a nurse to a different patient, patient population, or unit during an active shift, after care continuity has been established. Mid-shift reassignment is an automatic high-risk flag under the CRF framework regardless of clinical justification provided.', citation: 'CRF Stage 2; CMDS M4/M6; AUTO HIGH-RISK' },
  { term: 'Surveillance Downgrade', definition: 'An administrative or supervisory decision to reduce the level of patient observation or monitoring — such as sitter removal or telemetry discontinuation — without meeting the clinical criteria established by protocol or physician order.', citation: 'CRF Stage 1-2; CMDS M6' },
  { term: 'Compounded Risk', definition: 'The amplification of patient safety risk that occurs when two or more concurrent risk factors are present simultaneously — such as float assignment combined with mandatory overtime, or surveillance dilution combined with escalation failure. Compounded risk is non-additive and should be treated as a distinct risk category.', citation: 'CRF All Stages; CMDS M1+M5' },
];

export default function Glossary() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Glossary of Terms</h1>
        <p className="text-gray-600 mt-1 font-body">Locked definitions from the SafeChart Source of Truth. These terms carry specific clinical and regulatory meaning.</p>
      </div>

      <div className="space-y-4">
        {TERMS.map(t => (
          <Card key={t.term}>
            <h2 className="font-heading font-bold text-navy text-lg">{t.term}</h2>
            <p className="text-sm text-gray-700 mt-2 font-body leading-relaxed">{t.definition}</p>
            <p className="text-xs text-teal mt-3 font-semibold">{t.citation}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
