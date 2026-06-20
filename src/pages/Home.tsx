import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { store } from '../lib/store';
import { Activity, ClipboardList, AlertTriangle, Send, BookOpen } from 'lucide-react';

const modules = [
  {
    number: 1,
    title: 'Acuity Assessment',
    subtitle: 'CSAT — CRF Standardized Acuity Tool',
    description: 'Score your patient assignment across five clinical domains. Generates CRF stage flags and variance documentation.',
    icon: Activity,
    path: '/module/1',
    color: 'bg-teal/10 text-teal',
  },
  {
    number: 2,
    title: 'Safe Assignment Checklist',
    subtitle: 'Refusal Support Documentation',
    description: 'Document unsafe assignment conditions across five categories with automatic safety science citations.',
    icon: ClipboardList,
    path: '/module/2',
    color: 'bg-sage/20 text-navy',
  },
  {
    number: 3,
    title: 'Escalation Record',
    subtitle: 'Chain-of-Command Documentation',
    description: 'Log escalation attempts and responses. Auto-flags CMDS M6 Escalation Suppression on denial or no response.',
    icon: AlertTriangle,
    path: '/module/3',
    color: 'bg-orange-50 text-orange-700',
  },
  {
    number: 8,
    title: 'Report & Submission',
    subtitle: 'Module 8 — CSCP Output',
    description: 'Review your two-column translated report, download as PDF, or route to regulatory agencies.',
    icon: Send,
    path: '/module/8',
    color: 'bg-navy/5 text-navy',
  },
];

export function Home() {
  const navigate = useNavigate();

  function handleBegin(path: string) {
    navigate(path);
  }

  function handleReset() {
    if (confirm('Start a new record? Your current session will be cleared.')) {
      store.reset();
    }
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-navy text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Professional Documentation for Nurses
          </h1>
          <p className="text-white/70 text-lg mb-2">
            No facility subscription required. No employer permission required.
          </p>
          <p className="text-sage text-sm font-medium">
            Open it on any personal device, during or after any shift, and use it in full.
          </p>
        </div>
      </section>

      {/* Context note */}
      <section className="bg-cream border-b border-gray-200 py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-navy">Guest session active.</span>{' '}
            Records are stored in your browser only. Download a PDF to preserve your record.
          </p>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-navy underline shrink-0"
          >
            Start new record
          </button>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="font-heading font-bold text-xl text-navy mb-2">Phase 1 Modules</h2>
        <p className="text-sm text-gray-500 mb-7">
          Each module is independent. Begin anywhere. Complete all four for a full incident record.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {modules.map(mod => (
            <Card key={mod.number} className="flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={`rounded-lg p-2.5 ${mod.color} shrink-0`}>
                  <mod.icon size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                    Module {mod.number}
                  </div>
                  <h3 className="font-heading font-bold text-navy text-base leading-tight">
                    {mod.title}
                  </h3>
                  <div className="text-xs text-teal font-medium mt-0.5">{mod.subtitle}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 flex-1 mb-4">{mod.description}</p>
              <Button variant="teal" size="sm" onClick={() => handleBegin(mod.path)} className="self-start">
                Begin Module {mod.number}
              </Button>
            </Card>
          ))}
        </div>

        {/* Suggested flow */}
        <div className="mt-8 bg-navy/5 rounded-xl p-5 border border-navy/10">
          <h3 className="font-heading font-semibold text-navy text-sm mb-2">Full Incident Record — Suggested Flow</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Module 1 — Score acuity at start of shift or at event</li>
            <li>Module 2 — Check unsafe assignment conditions</li>
            <li>Module 3 — Log escalation attempts and responses</li>
            <li>Module 8 — Review translated report and route</li>
          </ol>
        </div>

        {/* Glossary link */}
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/glossary')} className="flex items-center gap-2">
            <BookOpen size={15} />
            View Clinical Glossary
          </Button>
        </div>
      </section>
    </Layout>
  );
}
