import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const definitions = [
  {
    term: 'Functional Unfamiliarity',
    definition: 'A clinician who has not worked three or more full shifts on a unit in the prior 30 days, or who has not independently managed the typical patient population, common emergencies, and unit-specific workflows, is functionally unfamiliar. Time physically present on the unit does not substitute for full-shift independent practice.',
    source: 'Nurse Risk Assessment doc, Float Instability Index section, Evidence-Based Definition of Unit Familiarity',
  },
  {
    term: 'Recognition Speed Impairment',
    definition: 'Any condition reducing the time from signal emergence to correct meaning assignment. Occurs when floating, managing high task-switch density, working under documentation backlog, or operating in unfamiliar environments. Recognition speed impairment is not a competence deficit; it is a systems-created cognitive condition.',
    source: 'Nurse Risk Assessment doc, Recognition Speed section; Endsley, M.R. (1995). Human Factors, 37(1), 32-64.',
  },
  {
    term: 'Surveillance Dilution',
    definition: 'The condition in which observation demand exceeds observation capacity. Produced by any combination of high monitoring intensity, behavioral vigilance requirements, new admission processing, documentation backlog, or environmental unfamiliarity. Surveillance dilution is measurable, predictable, and preventable.',
    source: 'Nurse Risk Assessment doc, Surveillance Dilution Risk Score section; Sweller, J. (1988). Cognitive Science, 12(2), 257-285.',
  },
  {
    term: 'Residual Risk Load',
    definition: 'The cumulative set of unresolved patient safety conditions, incomplete care tasks, physiologic vulnerabilities, and environmental deficits that carry forward from one shift to the next.',
    source: 'Nurse Risk Assessment doc, Residual Risk Categories section',
  },
  {
    term: 'Staffing Debt',
    definition: 'The structural accumulation of unfilled care capacity across multiple shifts, producing compounding risk invisible on any single staffing grid. Staffing debt is a leading indicator of failure-to-rescue events and a documented contributor to nurse attrition.',
    source: 'Nurse Risk Assessment doc, Staffing Risk Indicators section',
  },
  {
    term: 'New to Unit',
    definition: 'A nurse assigned to a patient care unit on which they have not completed three or more full independent shifts in the prior 30 days.',
    source: 'Nurse Risk Assessment doc, Float Instability Index section',
  },
  {
    term: 'Mid-Shift Reassignment',
    definition: 'Any change to a nurse\'s patient assignment or unit assignment that occurs after shift report has been received and care has begun. Characterized as closer to handoff failure than staffing flexibility.',
    source: 'Nurse Risk Assessment doc, Float Instability Index, Intra-Shift Floating subsection',
  },
  {
    term: 'Surveillance Downgrade',
    definition: 'Any reduction in the level of direct observation or monitoring assigned to a patient without documented reassessment by an observing clinician confirming that the patient\'s clinical status supports the reduction.',
    source: 'Nurse Risk Assessment doc, Sitter Initiation and Discontinuation Framework',
  },
  {
    term: 'Compounded Risk',
    definition: 'The non-additive interaction of two or more simultaneous risk conditions producing an aggregate risk level exceeding the sum of the individual components. Float plus overtime plus unfamiliar unit does not triple risk — it multiplies through interaction effects on recognition speed and surveillance capacity.',
    source: 'Nurse Risk Assessment doc: "Risk increases multiplicatively, not additively." Float and OT Interaction Effect section.',
  },
  {
    term: 'Failure to Rescue (FTR)',
    definition: 'Failure to recognize and respond to patient deterioration in a timely and effective way, resulting in preventable death or harm. Failure-to-rescue emerges as a structural inevitability rather than individual moral lapse when all seven CMDS mechanisms operate simultaneously.',
    source: 'AHRQ (2023). Patient safety primer: Failure to rescue. psnet.ahrq.gov; CMDS doi:10.5281/zenodo.18985075',
  },
  {
    term: 'Clinical Moral Disengagement Scaffolding (CMDS)',
    definition: 'A neurobiologically-mediated process that produces escalation suppression through the predictable sequence of authority displacement → signal suppression → gaslighting → deviance conditioning → moral adaptation. Seven mechanisms (M1–M7) operate simultaneously; six stages (S0–S6) are sequential.',
    source: 'Torrez, J. (2026). doi:10.5281/zenodo.18985075',
  },
  {
    term: 'Continuity Risk Framework (CRF)',
    definition: 'A nine-stage framework (Detection through Validation) mapping the sequence of clinical recognition, communication, and response required to prevent failure-to-rescue. Maps onto the Three Rs: Failure to Recognize (Stages 1–4), Failure to Relay or Escalate (Stages 5–6), Failure to Respond (Stages 7–9).',
    source: 'Torrez, J. (2026). doi:10.5281/zenodo.18237155',
  },
  {
    term: 'Perception Destabilization / Gaslighting',
    definition: 'CMDS Mechanism 3. Systematic undermining of a clinician\'s confidence in their own clinical perception, memory, or judgment. In clinical documentation contexts: Perception Destabilization. In governance, legal, and regulatory contexts: Gaslighting. This dual naming is a rule, not a preference.',
    source: 'CMDS doi:10.5281/zenodo.18985075, M3 definition',
  },
  {
    term: 'Escalation Suppression',
    definition: 'CMDS Mechanism 6. Active or structural blocking of escalation pathways, including chain-of-command obstruction, retaliation signaling, and policy tripwires. Any escalation attempt that receives denial or no response auto-triggers M6 documentation in SafeChart.',
    source: 'CMDS doi:10.5281/zenodo.18985075, M6 definition',
  },
];

export function Glossary() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-1">Reference</div>
          <h1 className="font-heading font-bold text-2xl text-navy mb-2">Clinical Glossary</h1>
          <p className="text-sm text-gray-600">
            All definitions are locked per SOT v1.3 Section V. Each traces to its named source.
            No definition may be modified without a SOT version increment and written confirmation.
          </p>
        </div>

        <div className="space-y-4">
          {definitions.map(def => (
            <Card key={def.term}>
              <h2 className="font-heading font-bold text-navy mb-2">{def.term}</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{def.definition}</p>
              <p className="text-xs text-gray-400">
                <span className="font-semibold">Source:</span> {def.source}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </div>
    </Layout>
  );
}
