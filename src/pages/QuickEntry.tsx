import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RequiredDisclosure from '../components/disclosure/RequiredDisclosure';
import { EVENT_TYPES } from '../types';
import type { QuickEntryRecord, EventType } from '../types';
import { logAudit } from '../lib/auditTrail';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function QuickEntry() {
  const navigate = useNavigate();
  const [shiftTime, setShiftTime] = useState('');
  const [unit, setUnit] = useState('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [saved, setSaved] = useState(false);

  const canSave = shiftTime.trim() || unit.trim() || eventType || description.trim();

  const handleSave = () => {
    const record: QuickEntryRecord = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      shiftTime,
      unit,
      eventType,
      description,
      state,
    };

    const existing = localStorage.getItem('sc_quick_entries');
    const entries: QuickEntryRecord[] = existing ? JSON.parse(existing) : [];
    entries.push(record);
    localStorage.setItem('sc_quick_entries', JSON.stringify(entries));

    // Also pre-populate the full record fields for continuity
    const narrative = [
      shiftTime && `Time: ${shiftTime}`,
      unit && `Unit: ${unit}`,
      eventType && `Event type: ${eventType}`,
      description,
    ].filter(Boolean).join('\n');
    localStorage.setItem('sc_freetext', narrative);
    if (eventType) localStorage.setItem('sc_event_type', eventType);

    logAudit('QUICK_ENTRY_SAVED', `Event type: ${eventType || 'unspecified'}`);
    setSaved(true);
  };

  const handleExpandToFull = () => {
    handleSave();
    navigate('/module1');
  };

  if (saved) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <Card>
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl">✓</div>
            <p className="font-heading font-bold text-navy text-xl">Record saved</p>
            <p className="text-sm text-gray-600">
              Timestamped {new Date().toLocaleString()}. This record is saved to your browser. Download it now or continue to the full documentation workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button variant="teal" onClick={() => navigate('/report')}>View & Export Report</Button>
              <Button variant="teal-outline" onClick={() => navigate('/module1')}>Continue Full Documentation</Button>
              <Button variant="ghost" onClick={() => { setSaved(false); setShiftTime(''); setUnit(''); setEventType(''); setDescription(''); setState(''); }}>
                Add Another Entry
              </Button>
            </div>
          </div>
        </Card>
        <RequiredDisclosure />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Quick Entry</h1>
        <p className="text-gray-600 mt-1 font-body">Document an incident in under 60 seconds. All fields are optional — enter what you have.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Time / Shift</label>
              <input
                type="text"
                placeholder="e.g. 14:00, night shift"
                value={shiftTime}
                onChange={e => setShiftTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Unit / Location</label>
              <input
                type="text"
                placeholder="e.g. 3 North, ICU"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value as EventType | '')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="">-- Select event type (optional) --</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Brief Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm font-body text-gray-700 min-h-24 focus:outline-none focus:ring-2 focus:ring-teal resize-y"
              placeholder="One or two sentences about what happened. No clinical terminology required."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">State (optional)</label>
            <input
              type="text"
              placeholder="e.g. CA, TX"
              value={state}
              onChange={e => setState(e.target.value.toUpperCase().slice(0, 2))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal max-w-24"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p>• This record is saved to your browser only. Nothing is transmitted.</p>
            <p>• A timestamp is recorded automatically when you save.</p>
            <p>• Records created during or within 24 hours of an event are labeled <strong>contemporaneous</strong> — the strongest evidentiary standard.</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleSave} disabled={!canSave}>Save Quick Entry</Button>
        <Button variant="teal-outline" onClick={handleExpandToFull} disabled={!canSave}>Save and Continue to Full Documentation</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
      </div>

      <RequiredDisclosure />
    </div>
  );
}
