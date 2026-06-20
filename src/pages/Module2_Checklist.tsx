import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useShiftRecord } from '../lib/store';
import { AlertCircle } from 'lucide-react';

interface ChecklistEntry {
  id: string;
  label: string;
  safetyBasis: string;
  crfStage?: string;
  citation?: string;
  compoundFlag?: string;
}

interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  items: ChecklistEntry[];
}

const categories: ChecklistCategory[] = [
  {
    id: 'continuity',
    name: '1. Continuity Violations',
    description: 'Mid-shift floating is characterized as closer to handoff failure than staffing flexibility.',
    items: [
      {
        id: 'cont_midshift',
        label: 'Mid-shift reassignment after report',
        safetyBasis: 'Mid-shift floating is closer to handoff failure than staffing flexibility. If floating occurs after report, the unit was already understaffed.',
        crfStage: 'CRF Recognition (Stage 2) — Automatic High-Risk Flag, non-removable',
        citation: 'Nurse Risk Assessment doc, Float Instability Index, Intra-Shift Floating subsection',
        compoundFlag: 'AUTOMATIC HIGH-RISK FLAG',
      },
      {
        id: 'cont_multi',
        label: 'Multiple unit assignments in one shift',
        safetyBasis: 'Each additional assignment change adds coordination overhead and disrupts situational awareness.',
        crfStage: 'CRF Recognition (Stage 2); Detection (Stage 1)',
        citation: 'Nurse Risk Assessment doc, Float Instability Index section',
      },
      {
        id: 'cont_handoff',
        label: 'Incomplete handoff or forced incomplete charting',
        safetyBasis: 'Incomplete handoff is a recognized failure mode in the CRF Communication stage. Forced incomplete charting creates documentation debt and trend invisibility.',
        crfStage: 'CRF Communication (Stage 5); Action (Stage 7)',
        citation: 'Nurse Risk Assessment doc, Residual Risk Categories section',
      },
      {
        id: 'cont_baseline',
        label: 'No access to baseline patient data',
        safetyBasis: 'Absence of baseline data impairs recognition speed and trajectory interpretation.',
        crfStage: 'CRF Recognition (Stage 2); Interpretation (Stage 3)',
        citation: 'Endsley, M.R. (1995). Situational Awareness. Human Factors, 37(1), 32-64.',
      },
    ],
  },
  {
    id: 'recognition',
    name: '2. Recognition Impairment',
    description: 'Recognition speed = time from signal emergence to correct meaning assignment (Endsley, 1995).',
    items: [
      {
        id: 'rec_new',
        label: 'New to unit without stabilization window',
        safetyBasis: 'A clinician who has not worked 3 or more full shifts on the unit in the prior 30 days is functionally unfamiliar. This produces recognition speed impairment — not a competence deficit, but a systems-created cognitive condition.',
        crfStage: 'CRF Recognition (Stage 2)',
        citation: 'Nurse Risk Assessment doc, Float Instability Index, Evidence-Based Definition of Unit Familiarity; Endsley (1995)',
      },
      {
        id: 'rec_interruption',
        label: 'High interruption density during assessment',
        safetyBasis: 'High interruption rate or task saturation is scored as 2 in the CSAT Care Complexity domain, triggering a red flag.',
        crfStage: 'CRF Recognition (Stage 2); Prioritization (Stage 4)',
        citation: 'Sweller, J. (1988). Cognitive load during problem solving. Cognitive Science, 12(2), 257-285.',
      },
      {
        id: 'rec_noorient',
        label: 'No unit orientation in prior 30 days',
        safetyBasis: 'Functional unfamiliarity with unit-specific workflows, equipment layout, and informal safety practices is a recognized patient safety risk.',
        crfStage: 'CRF Detection (Stage 1); Recognition (Stage 2)',
        citation: 'Nurse Risk Assessment doc, Float Instability Index section',
      },
    ],
  },
  {
    id: 'surveillance',
    name: '3. Surveillance Overload',
    description: 'Surveillance dilution = observation demand exceeds observation capacity (Sweller, 1988).',
    items: [
      {
        id: 'surv_acuity',
        label: 'High-acuity or high-turnover assignment',
        safetyBasis: 'High patient acuity combined with low ARI (organizational accountability) = elevated probability of uncorrected deterioration. Source: Nurse Risk Assessment doc, ARI section.',
        crfStage: 'CRF Detection (Stage 1); Recognition (Stage 2)',
        citation: 'AHRQ (2023). Patient safety primer: Failure to rescue. psnet.ahrq.gov',
      },
      {
        id: 'surv_monitoring',
        label: 'Monitoring-heavy or behavioral assignment',
        safetyBasis: 'Near-continuous observation or titration needs score a 2 on the CSAT Monitoring Intensity domain, triggering automatic red flag.',
        crfStage: 'CRF Detection (Stage 1)',
        citation: 'Nurse Risk Assessment doc, Tab 17, Monitoring Intensity domain',
      },
      {
        id: 'surv_equipment',
        label: 'Unfamiliar equipment on this unit',
        safetyBasis: 'Equipment unfamiliarity is listed as a surveillance overload factor in the Safe Assignment Refusal Support Checklist and contributes to surveillance dilution.',
        crfStage: 'CRF Detection (Stage 1); Recognition (Stage 2)',
        citation: 'Nurse Risk Assessment doc, Safe Assignment Refusal Support Checklist',
      },
    ],
  },
  {
    id: 'fatigue',
    name: '4. Fatigue and Compounding Risk',
    description: 'Risk increases multiplicatively, not additively, when float + OT + unfamiliar unit conditions combine.',
    items: [
      {
        id: 'fat_ot_float',
        label: 'Overtime combined with float in this shift',
        safetyBasis: 'Float combined with overtime in the same shift triggers a compound risk flag. Risk increases multiplicatively, not additively.',
        crfStage: 'All CRF stages elevated',
        citation: 'Nurse Risk Assessment doc, Float and OT Interaction Effect section; Rogers et al. (2004), Health Affairs, 23(4), 202-212.',
        compoundFlag: 'COMPOUND RISK FLAG — Multiplicative risk interaction',
      },
      {
        id: 'fat_consec',
        label: 'Consecutive float assignments this week',
        safetyBasis: 'Same nurse floated more than once in a 7-day window triggers a compound float flag.',
        crfStage: 'CRF Recognition (Stage 2); Detection (Stage 1)',
        citation: 'Nurse Risk Assessment doc, Float Instability Index section',
        compoundFlag: 'COMPOUND FLOAT FLAG',
      },
      {
        id: 'fat_hours',
        label: 'Working or approaching 12.5+ hours this shift',
        safetyBasis: 'Nurses working more than 12.5 hours are approximately 3 times more likely to report at least one error (medication error, near miss, or adverse event).',
        crfStage: 'All CRF stages elevated',
        citation: 'Rogers, A.E., et al. (2004). Health Affairs, 23(4), 202-212.',
      },
      {
        id: 'fat_travel',
        label: 'Extended commute, weather exposure, or driving between facilities',
        safetyBasis: 'Sleep disruption or weather travel exposure is a listed fatigue and compounding risk indicator. Risk interaction is multiplicative.',
        crfStage: 'All CRF stages elevated',
        citation: 'Nurse Risk Assessment doc, Safe Assignment Refusal Support Checklist, Fatigue and compounding risk section',
      },
    ],
  },
  {
    id: 'escalation_imp',
    name: '5. Escalation Impairment',
    description: 'Structural or cultural barriers to activating appropriate response pathways.',
    items: [
      {
        id: 'esc_nocharge',
        label: 'No charge nurse support available',
        safetyBasis: 'Absence of charge support is a recognized escalation impairment condition under the Safe Assignment Refusal Support Checklist.',
        crfStage: 'CRF Escalation (Stage 6)',
        citation: 'CMDS doi:10.5281/zenodo.18985075; Nurse Risk Assessment doc, Safe Assignment Refusal Support Checklist',
      },
      {
        id: 'esc_noresponse',
        label: 'No resource nurse or supervisor available',
        safetyBasis: 'Absence of resource support correlates with CMDS M6 Escalation Suppression — structural blocking of escalation pathways.',
        crfStage: 'CRF Escalation (Stage 6); Communication (Stage 5)',
        citation: 'CMDS doi:10.5281/zenodo.18985075',
      },
      {
        id: 'esc_culture',
        label: 'Documented history of delayed or absent response at this facility',
        safetyBasis: 'Documented delayed-response culture contributes to ARI Impact Visibility score = 0 (Absent) and CMDS Stage S2 Signal Suppression.',
        crfStage: 'CRF Escalation (Stage 6)',
        citation: 'Nurse Risk Assessment doc, ARI section; CMDS doi:10.5281/zenodo.18985075',
      },
    ],
  },
];

export function Module2_Checklist() {
  const navigate = useNavigate();
  const [record, update] = useShiftRecord();
  const checked = record.checklistItems;

  function toggle(id: string) {
    if (checked.includes(id)) {
      update({ checklistItems: checked.filter(i => i !== id) });
    } else {
      update({ checklistItems: [...checked, id] });
    }
  }

  const hasAutoHighRisk = checked.includes('cont_midshift');
  const hasCompound = checked.includes('fat_ot_float') || checked.includes('fat_consec');
  const total = checked.length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">Module 2</div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Safe Assignment Checklist</h1>
          <p className="text-sm text-gray-600">
            Source: Nurse Risk Assessment doc, Safe Assignment Refusal Support Checklist.
            Check all conditions present during this shift or assignment.
          </p>
        </div>

        {/* Flags */}
        {hasAutoHighRisk && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Automatic High-Risk Flag Active</p>
              <p className="text-xs text-red-700 mt-1">Mid-shift reassignment after report constitutes a continuity violation equivalent to handoff failure. This flag is non-removable. Source: Nurse Risk Assessment doc, Float Instability Index.</p>
            </div>
          </div>
        )}

        {hasCompound && (
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">Compound Risk Flag Active</p>
              <p className="text-xs text-orange-700 mt-1">Float combined with overtime or consecutive float assignments compound risk multiplicatively, not additively. Source: Nurse Risk Assessment doc, Float and OT Interaction Effect section; Rogers et al. (2004).</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {categories.map(cat => (
            <Card key={cat.id}>
              <h2 className="font-heading font-bold text-navy mb-1">{cat.name}</h2>
              <p className="text-xs text-gray-500 mb-4 italic">{cat.description}</p>
              <div className="space-y-4">
                {cat.items.map(item => {
                  const isChecked = checked.includes(item.id);
                  return (
                    <div key={item.id}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 accent-teal h-4 w-4 shrink-0"
                        />
                        <span className={`text-sm font-medium ${isChecked ? 'text-navy' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </label>
                      {isChecked && (
                        <div className="ml-7 mt-2 bg-cream rounded-lg p-3 border border-gray-100">
                          {item.compoundFlag && (
                            <p className="text-xs font-bold text-red-700 mb-1">{item.compoundFlag}</p>
                          )}
                          <p className="text-xs text-gray-700 mb-1.5">{item.safetyBasis}</p>
                          {item.crfStage && (
                            <p className="text-xs text-teal font-medium">CRF: {item.crfStage}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">Source: {item.citation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {total > 0 && (
          <div className="mt-6 bg-navy/5 border border-navy/10 rounded-xl p-4">
            <p className="text-sm font-semibold text-navy">{total} condition{total !== 1 ? 's' : ''} documented</p>
            <p className="text-xs text-gray-500 mt-1">
              Each checked item generates supporting safety science citation in your report.
              Refusal documentation standard: state specific risk → request modifications → escalate → if unresolved, decline → document.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="ghost" onClick={() => navigate('/module/1')}>← Module 1</Button>
          <div className="flex gap-3">
            <Button variant="light" onClick={() => navigate('/module/8')}>Skip to Report</Button>
            <Button variant="teal" onClick={() => navigate('/module/3')}>Continue to Module 3 →</Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Source: Nurse Risk Assessment doc · CRF doi:10.5281/zenodo.18237155 · CMDS doi:10.5281/zenodo.18985075
        </p>
      </div>
    </Layout>
  );
}
