import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';

const modules = [
  {
    id: 1,
    title: 'Module 1: Acuity Assessment',
    subtitle: 'CSAT Scoring',
    description: 'Document patient acuity across five clinical domains. Identify red, yellow, and green flags for safe assignment thresholds.',
    path: '/module1',
    icon: '📊',
  },
  {
    id: 2,
    title: 'Module 2: Safe Assignment Checklist',
    subtitle: 'Safety Flags',
    description: 'Review continuity violations, surveillance impairment, fatigue factors, and escalation barriers. Each item carries a safety science basis.',
    path: '/module2',
    icon: '✅',
  },
  {
    id: 3,
    title: 'Module 3: Escalation Record',
    subtitle: 'Narrative & Escalations',
    description: 'Document your narrative account and any escalation attempts. CMDS M6 flags auto-trigger on denied or unanswered escalations.',
    path: '/module3',
    icon: '📋',
  },
  {
    id: 8,
    title: 'Module 8: Report & Submission',
    subtitle: 'Routing & Export',
    description: 'Review your translated professional documentation, download as PDF, and route to applicable regulatory or oversight bodies.',
    path: '/module8',
    icon: '📤',
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <div className="text-center py-10">
        <h1 className="font-heading text-4xl font-bold text-navy mb-3">SafeChart</h1>
        <p className="text-xl text-gray-600 font-body max-w-xl mx-auto">
          Professional documentation for nurses. No facility subscription required.
        </p>
        <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
          Document unsafe staffing conditions, escalation failures, and patient safety concerns in professional, legally-framed language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => (
          <Card key={mod.id} className="flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-3">{mod.icon}</div>
              <h2 className="font-heading text-lg font-bold text-navy mb-1">{mod.title}</h2>
              <p className="text-xs font-semibold text-teal uppercase tracking-wide mb-2">{mod.subtitle}</p>
              <p className="text-sm text-gray-600 font-body">{mod.description}</p>
            </div>
            <div className="mt-5">
              <Link to={mod.path}>
                <Button variant="teal" className="w-full">Begin</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link to="/glossary">
          <Button variant="ghost">View Glossary</Button>
        </Link>
      </div>

      <RequiredDisclosure />
    </div>
  );
}
