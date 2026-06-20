// Patterns for common identifiers that should never reach PRISMqd
const PATTERNS = [
  { name: 'Medical Record Number', pattern: /\bMRN[\s:#-]?\d{5,10}\b/i },
  { name: 'Medical Record Number', pattern: /\bmedical record[\s:#]?\d{5,10}\b/i },
  { name: 'Date of Birth', pattern: /\b(dob|date of birth|born)[\s:]?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/i },
  { name: 'Phone Number', pattern: /\b\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}\b/ },
  { name: 'Social Security Number', pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: 'Patient Name Pattern', pattern: /\bpatient[\s:]+(mr|mrs|ms|dr)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i },
  { name: 'Room Number with Name', pattern: /\broom\s*\d+[:\s]+[A-Z][a-z]+\s+[A-Z][a-z]+/i },
];

export interface ScanResult {
  found: boolean;
  matches: Array<{ name: string; sample: string }>;
}

export function scanForIdentifiers(text: string): ScanResult {
  const matches: Array<{ name: string; sample: string }> = [];
  for (const { name, pattern } of PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Show redacted sample - only first 4 chars + asterisks
      const raw = match[0];
      const sample = raw.slice(0, 4) + '****';
      if (!matches.find(m => m.name === name)) {
        matches.push({ name, sample });
      }
    }
  }
  return { found: matches.length > 0, matches };
}
