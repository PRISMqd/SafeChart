import { nlpCategories } from '../data/nlp_keywords';
import type { ClassificationResult, NLPMatch, SeverityTier } from '../types';

export function classifyText(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  const matches: NLPMatch[] = [];

  for (const category of nlpCategories) {
    const matchedPhrases = category.phrases.filter(phrase =>
      lower.includes(phrase.toLowerCase())
    );
    if (matchedPhrases.length > 0) {
      matches.push({ category, matchedPhrases });
    }
  }

  const autoHighRisk = matches.some(m => m.category.autoHighRisk);
  const hasEscalationFailure = matches.some(m => m.category.id === 3);
  const hasPatientDeterioration = matches.some(m => m.category.id === 6);
  const hasSignalSuppression = matches.some(m => m.category.id === 7);
  const hasSitterConcern = matches.some(m => m.category.id === 9);

  const severityTier = deriveSeverityTier({
    autoHighRisk,
    hasEscalationFailure,
    hasPatientDeterioration,
    hasSitterConcern,
    matchCount: matches.length,
  });

  return {
    matches,
    severityTier,
    autoHighRisk,
    hasEscalationFailure,
    hasPatientDeterioration,
    hasSignalSuppression,
  };
}

function deriveSeverityTier(params: {
  autoHighRisk: boolean;
  hasEscalationFailure: boolean;
  hasPatientDeterioration: boolean;
  hasSitterConcern: boolean;
  matchCount: number;
}): SeverityTier {
  const { autoHighRisk, hasEscalationFailure, hasPatientDeterioration, hasSitterConcern, matchCount } = params;

  if (hasPatientDeterioration && hasSitterConcern) return 'critical';
  if (hasPatientDeterioration && hasEscalationFailure) return 'critical';

  if (hasEscalationFailure || hasPatientDeterioration || autoHighRisk) return 'high';

  if (matchCount >= 2) return 'moderate';
  if (matchCount === 1) return 'low';

  return 'low';
}

export const severityLabels: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

export const severityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
