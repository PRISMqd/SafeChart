import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState('');

  useEffect(() => {
    const ft = localStorage.getItem('sc_freetext');
    const csat = localStorage.getItem('sc_csat');
    const checklist = localStorage.getItem('sc_checklist');
    const quickEntries = localStorage.getItem('sc_quick_entries');

    const parts: string[] = [];
    if (ft && ft.trim()) parts.push('narrative');
    if (csat) parts.push('acuity assessment');
    if (checklist) {
      try { if (JSON.parse(checklist).length > 0) parts.push('checklist flags'); } catch { /* */ }
    }
    if (quickEntries) {
      try {
        const entries = JSON.parse(quickEntries);
        if (entries.length > 0) parts.push(`${entries.length} quick entr${entries.length === 1 ? 'y' : 'ies'}`);
      } catch { /* */ }
    }

    if (parts.length > 0) {
      setHasDraft(true);
      setDraftInfo(parts.join(', '));
    }
  }, []);

  const handleClearSession = () => {
    ['sc_freetext', 'sc_csat', 'sc_checklist', 'sc_checklist_text', 'sc_escalations', 'sc_translated', 'sc_event_type', 'sc_csat_draft_time', 'sc_csat_saved_at'].forEach(k => localStorage.removeItem(k));
    setHasDraft(false);
    setDraftInfo('');
  };

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

      {/* Quick Entry featured option */}
      <div className="bg-navy rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sage text-xs font-semibold uppercase tracking-wide mb-1">Mid-Shift · Under 60 Seconds</p>
            <h2 className="font-heading text-2xl font-bold mb-2">Quick Entry</h2>
            <p className="text-gray-300 text-sm max-w-md">Document an incident right now with just a time, unit, event type, and one sentence. Timestamped and saved to your browser immediately. Expand to full documentation later.</p>
          </div>
          <div className="shrink-0">
            <Link to="/quick">
              <Button variant="teal">Quick Entry →</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Resume draft */}
      {hasDraft && (
        <div className="bg-warm border border-teal rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-navy text-sm">Draft in progress</p>
            <p className="text-xs text-gray-600 mt-1">Saved data: {draftInfo}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="teal" onClick={() => navigate('/report')}>Resume → Report</Button>
            <Button variant="ghost" onClick={handleClearSession}>Clear Session</Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading font-bold text-navy text-xl mb-4">Full Documentation Workflow</h2>
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
