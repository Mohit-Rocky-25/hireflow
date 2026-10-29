// ============================================================
// HIREFLOW REGIONAL SPELLING DICTIONARY & CONVERTER (STAGE 1)
// Supports deterministic vocabulary localization across en-IN, en-GB, and en-US
// ============================================================

export type SupportedLocale = 'en-IN' | 'en-GB' | 'en-US';

export interface SpellingPair {
  us: string;
  gb: string; // Used by en-GB and en-IN
}

export const SPELLING_DICTIONARY: SpellingPair[] = [
  { us: 'optimized', gb: 'optimised' },
  { us: 'optimize', gb: 'optimise' },
  { us: 'optimization', gb: 'optimisation' },
  { us: 'architected', gb: 'architected' },
  { us: 'analyzed', gb: 'analysed' },
  { us: 'analyze', gb: 'analyse' },
  { us: 'behavior', gb: 'behaviour' },
  { us: 'center', gb: 'centre' },
  { us: 'centralized', gb: 'centralised' },
  { us: 'customized', gb: 'customised' },
  { us: 'standardized', gb: 'standardised' },
  { us: 'prioritized', gb: 'prioritised' },
  { us: 'synchronized', gb: 'synchronised' },
  { us: 'virtualized', gb: 'virtualised' },
  { us: 'program', gb: 'programme' },
  { us: 'catalog', gb: 'catalogue' },
  { us: 'dialog', gb: 'dialogue' },
  { us: 'license', gb: 'licence' },
  { us: 'defense', gb: 'defence' }
];

/**
 * Normalizes text to match the requested regional spelling variant.
 */
export function applySpellingProfile(text: string, locale: SupportedLocale): string {
  if (!text || locale === 'en-US') {
    // If en-US, convert British spellings to US
    let result = text;
    for (const pair of SPELLING_DICTIONARY) {
      if (pair.gb !== pair.us) {
        const regex = new RegExp(`\\b${pair.gb}\\b`, 'gi');
        result = result.replace(regex, (match) => {
          return match[0] === match[0].toUpperCase()
            ? pair.us.charAt(0).toUpperCase() + pair.us.slice(1)
            : pair.us;
        });
      }
    }
    return result;
  }

  // en-IN and en-GB use British spelling conventions
  let result = text;
  for (const pair of SPELLING_DICTIONARY) {
    if (pair.gb !== pair.us) {
      const regex = new RegExp(`\\b${pair.us}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        return match[0] === match[0].toUpperCase()
          ? pair.gb.charAt(0).toUpperCase() + pair.gb.slice(1)
          : pair.gb;
      });
    }
  }
  return result;
}
