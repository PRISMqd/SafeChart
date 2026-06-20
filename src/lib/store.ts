import { useState, useCallback } from 'react';
import type { ShiftRecord, CSATScore, EscalationEntry } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyRecord(): ShiftRecord {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    nurseRole: '',
    shiftType: '',
    unitType: '',
    state: '',
    freeText: '',
    csatScores: [],
    showChargeRN: false,
    checklistItems: [],
    escalations: [],
  };
}

// Simple module-level store for Phase 1 guest sessions
let _record: ShiftRecord = createEmptyRecord();
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach(fn => fn());
}

export const store = {
  getRecord(): ShiftRecord {
    return _record;
  },
  update(partial: Partial<ShiftRecord>) {
    _record = { ..._record, ...partial };
    notify();
  },
  reset() {
    _record = createEmptyRecord();
    notify();
  },
  subscribe(fn: () => void) {
    _listeners.push(fn);
    return () => {
      _listeners = _listeners.filter(l => l !== fn);
    };
  },
};

export function useShiftRecord(): [ShiftRecord, (partial: Partial<ShiftRecord>) => void] {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useState(() => {
    const unsub = store.subscribe(forceUpdate);
    return unsub;
  });

  return [store.getRecord(), store.update.bind(store)];
}

export type { ShiftRecord, CSATScore, EscalationEntry };
