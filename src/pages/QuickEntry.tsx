import { useState, useEffect, useRef } from 'react';
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

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

export default function QuickEntry() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shiftTime, setShiftTime] = useState('');
  const [unit, setUnit] = useState('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [state, setState] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSaved = useRef(false);

  // Auto-timestamp on first character (UX-04)
  useEffect(() => {
    if (description.trim() && !timestamp) {
      setTimestamp(new Date().toISOString());
    }
  }, [description, timestamp]);

  // Auto-save on first character (UX-02)
  useEffect(() => {
    if (description.trim() && !hasAutoSaved.current) {
      hasAutoSaved.current = true;
      const ts = timestamp || new Date().toISOString();
      const record: QuickEntryRecord = {
        id: generateId(),
        timestamp: ts,
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
      localStorage.setItem('sc_freetext', description);
      if (eventType) localStorage.setItem('sc_event_type', eventType);
      logAudit('QUICK_ENTRY_AUTO_SAVED', 'First character typed');
    }
  }, [description, shiftTime, unit, eventType, state, timestamp]);

  // Keep localStorage in sync as user types
  useEffect(() => {
    if (description.trim()) {
      localStorage.setItem('sc_freetext', description);
      if (eventType) localStorage.setItem('sc_event_type', eventType);
    }
  }, [description, eventType]);

  const handleSave = () => {
    const ts = timestamp || new Date().toISOString();
    const record: QuickEntryRecord = {
      id: generateId(),
      timestamp: ts,
      shiftTime,
      unit,
      eventType,
      description,
      state,
    };
    const existing = localStorage.getItem('sc_quick_entries');
    const entries: QuickEntryRecord[] = existing ? JSON.parse(existing) : [];
    // Replace the auto-saved entry if it exists, otherwise push
    if (hasAutoSaved.current && entries.length > 0) {
      entries[entries.length - 1] = record;
    } else {
      entries.push(record);
    }
    localStorage.setItem('sc_quick_entries', JSON.stringify(entries));
    localStorage.setItem('sc_freetext', description);
    if (eventType) localStorage.setItem('sc_event_type', eventType);
    logAudit('QUICK_ENTRY_SAVED', `Event type: ${eventType || 'unspecified'}`);
    setSaved(true);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setDescription(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  if (saved) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <Card>
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl">✓</div>
            <p className="font-heading font-bold text-navy text-xl">Saved</p>
            <p className="text-sm text-gray-600">
              {timestamp && <>Timestamped {new Date(timestamp).toLocaleString()}. </>}
              Saved to your browser. Nothing was transmitted.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button variant="teal" onClick={() => navigate('/report')}>View & Export</Button>
              <Button variant="teal-outline" onClick={() => navigate('/module1')}>Continue Full Documentation</Button>
              <Button variant="ghost" onClick={() => { setSaved(false); setDescription(''); setShiftTime(''); setUnit(''); setEventType(''); setState(''); setTimestamp(null); hasAutoSaved.current = false; }}>
                Add Another
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
        <h1 className="font-heading text-3xl font-bold text-navy">What's happening right now?</h1>
        <p className="text-gray-600 mt-1 font-body">Type or speak. It saves automatically. No submit required.</p>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Primary single field (UX-01) */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-300 rounded-lg p-4 text-sm font-body text-gray-700 min-h-36 focus:outline-none focus:ring-2 focus:ring-teal resize-y pr-12"
              placeholder="Describe what's happening. One sentence is enough. No clinical terminology required."
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
            />
            {/* Voice button (UX-03) */}
            {voiceSupported && (
              <button
                onClick={listening ? stopVoice : startVoice}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-teal hover:text-white'}`}
                title={listening ? 'Stop voice input' : 'Start voice input'}
                aria-label={listening ? 'Stop recording' : 'Start voice input'}
              >
                🎤
              </button>
            )}
          </div>

          {/* Auto-timestamp indicator (UX-04) */}
          {timestamp && (
            <p className="text-xs text-teal font-medium">
              ✓ Timestamped {new Date(timestamp).toLocaleString()} — saved to your browser
            </p>
          )}

          {/* Expand link (UX-05) */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-teal underline font-semibold"
          >
            {expanded ? '▾ Hide optional details' : '▸ Add time, unit, event type, or state'}
          </button>

          {expanded && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
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
                  <option value="">-- Optional --</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p>• Saved to your browser only. Nothing is transmitted.</p>
            <p>• Records created during or within 24 hours of an event are labeled <strong>contemporaneous</strong> — the strongest evidentiary standard.</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="teal" onClick={handleSave} disabled={!description.trim()}>Save Entry</Button>
        <Button variant="teal-outline" onClick={() => { handleSave(); navigate('/module1'); }} disabled={!description.trim()}>Save & Continue Full Documentation</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
      </div>

      <RequiredDisclosure />
    </div>
  );
}
