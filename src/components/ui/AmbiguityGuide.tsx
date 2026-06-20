import { useState } from 'react';

interface AmbiguityGuideProps {
  onDismiss: () => void;
}

const REPORTABLE_ITEMS = [
  {
    category: 'Nurse Practice Act (NPA)',
    examples: [
      'Any assignment you believe places a patient at unreasonable risk given your competency, training, or current conditions.',
      'Assignments outside your documented scope of practice or specialty competency.',
      'Mid-shift reassignments that prevent adequate patient assessment and handoff.',
    ],
  },
  {
    category: 'CMS Conditions of Participation (42 CFR § 482)',
    examples: [
      'Staffing levels that prevent you from completing required assessments within required timeframes.',
      'Removal of safety attendants or monitors without documented clinical criteria being met.',
      'Inability to maintain minimum nursing services required under § 482.23.',
    ],
  },
  {
    category: 'OSHA General Duty Clause (29 U.S.C. § 654(a)(1))',
    examples: [
      'Staffing conditions that create a recognized hazard of patient deterioration or nurse injury.',
      'Float or overtime conditions that impair your ability to safely recognize and respond to patient changes.',
      'Near-miss events attributable to staffing conditions.',
    ],
  },
  {
    category: 'ANA Code of Ethics, Provisions 3 and 6',
    examples: [
      'Any condition where you believe patient safety is compromised and your professional judgment was dismissed.',
      'Pressure not to document, not to report, or not to refuse an unsafe assignment.',
      'Escalation attempts that resulted in no response, deferral, or denial without clinical justification.',
    ],
  },
];

export default function AmbiguityGuide({ onDismiss }: AmbiguityGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-warm border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading font-bold text-navy text-sm">Not sure if this is reportable?</p>
          <p className="text-xs text-gray-600 mt-1">Many nurses are uncertain whether a near-miss or borderline condition qualifies. Here is plain-language guidance on what is reportable under each authority.</p>
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-3">×</button>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-teal text-xs font-semibold underline"
        >
          Show what qualifies as reportable →
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          {REPORTABLE_ITEMS.map(item => (
            <div key={item.category}>
              <p className="text-xs font-semibold text-navy uppercase tracking-wide mb-1">{item.category}</p>
              <ul className="space-y-1">
                {item.examples.map((ex, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-2">
                    <span className="text-teal shrink-0">•</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            If you documented a condition, attempted an escalation, or observed a patient safety risk — it is reportable. Documentation protects patients and you.
          </p>
          <p className="text-xs text-gray-400">
            Sources: NPA (your state); 42 CFR § 482; 29 U.S.C. § 654(a)(1); ANA Code of Ethics (2015). See Glossary for definitions.
          </p>
          <button onClick={() => setOpen(false)} className="text-xs text-gray-400 underline">Collapse</button>
        </div>
      )}
    </div>
  );
}
