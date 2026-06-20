import { NLP_KEYWORD_CATEGORIES } from '../data/nlp_keywords';
import type { ClassificationResult, NLPMatch, SeverityTier } from '../types';

export function classifyText(text: string): ClassificationResult {
  const lowerText = text.toLowerCase();
  const matches: NLPMatch[] = [];

  for (const category of NLP_KEYWORD_CATEGORIES) {
    const matchedPhrases: string[] = [];
    for (const kw of category.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matchedPhrases.push(kw);
      }
    }
    if (matchedPhrases.length > 0) {
      matches.push({
        category: category.id,
        categoryName: category.name,
        matchedPhrases,
        crfStages: category.crfStages,
        cmdsMechanisms: category.cmdsMechanisms,
        riskCategory: category.riskCategory,
        autoHighRisk: category.autoHighRisk,
        translationFraming: category.translationFraming,
      });
    }
  }

  const autoHighRisk = matches.some(m => m.autoHighRisk === true);
  const hasEscalationFailure = matches.some(m => m.category === 3);
  const hasPatientDeterioration = matches.some(m => m.category === 6);
  const hasSignalSuppression = matches.some(m => m.category === 7);
  const hasSitterConcern = matches.some(m => m.category === 9);

  let severityTier: SeverityTier = 'low';

  if (hasSignalSuppression || (hasSitterConcern && hasPatientDeterioration)) {
    severityTier = 'critical';
  } else if ((hasEscalationFailure && hasPatientDeterioration) || autoHighRisk) {
    severityTier = 'high';
  } else if (hasEscalationFailure || matches.some(m => m.category === 5) || matches.some(m => m.category === 1)) {
    severityTier = 'moderate';
  } else if (matches.length > 0) {
    severityTier = 'low';
  }

  return { matches, severityTier, autoHighRisk, hasEscalationFailure, hasPatientDeterioration };
}
