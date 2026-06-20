import type { AuditEntry } from '../types';

const KEY = 'sc_audit';
const SESSION_KEY = 'sc_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function logAudit(action: string, details?: string): void {
  const entries = getAuditLog();
  const entry: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sessionId: getSessionId(),
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  entries.push(entry);
  // Keep last 500 entries
  const trimmed = entries.slice(-500);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSessionLog(): AuditEntry[] {
  const sid = getSessionId();
  return getAuditLog().filter(e => e.sessionId === sid);
}
