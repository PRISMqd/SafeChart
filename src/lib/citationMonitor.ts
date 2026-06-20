// Citation monitoring tracks when federal citation URLs were last verified.
// In Phase 1 (client-side only), we store the last-verified date and surface
// a staleness warning after 30 days. Phase 2 adds server-side URL hash checking.

const KEY = 'sc_citation_verified';
const STALE_DAYS = 30;

interface VerificationRecord {
  [citationId: string]: string; // ISO date string
}

const INITIAL_VERIFIED: VerificationRecord = {
  EMTALA: '2026-06-01',
  CMS_CoP: '2026-06-01',
  OSHA_GDC: '2026-06-01',
  ANA_CODE: '2026-06-01',
  NLRA_S7: '2026-06-01',
  WHISTLEBLOWER: '2026-06-01',
};

export function getVerificationDates(): VerificationRecord {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...INITIAL_VERIFIED, ...JSON.parse(raw) } : INITIAL_VERIFIED;
  } catch {
    return INITIAL_VERIFIED;
  }
}

export function markVerified(citationId: string): void {
  const dates = getVerificationDates();
  dates[citationId] = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(dates));
}

export function isStale(citationId: string): boolean {
  const dates = getVerificationDates();
  const last = dates[citationId];
  if (!last) return true;
  const diff = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  return diff > STALE_DAYS;
}

export function getLastVerified(citationId: string): string {
  const dates = getVerificationDates();
  const last = dates[citationId];
  if (!last) return 'Unknown';
  return new Date(last).toLocaleDateString();
}
