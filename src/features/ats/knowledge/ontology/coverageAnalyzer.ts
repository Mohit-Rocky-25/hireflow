// ============================================================
// ATS Resume Roaster — Knowledge Coverage Analyzer (Phase 03 Section 11)
// Inspects JD and resume text collections to discover unmapped concepts,
// technical terms, and propose structured review entries WITHOUT mutating production.
// ============================================================

import { ALIAS_LOOKUP_MAP } from '../taxonomy';
import { ONTOLOGY_ALIAS_MAP } from './index';

export interface UnmappedConceptProposal {
  term: string;
  frequency: number;
  occurrences: Array<{ snippet: string; context: 'jd' | 'resume' }>;
  suggestedDomain?: string;
  suggestedCategory?: string;
  confidence: number;
  status: 'pending_review';
}

const COMMON_STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'in', 'with', 'for', 'to', 'of', 'at', 'by',
  'from', 'on', 'as', 'is', 'are', 'was', 'were', 'our', 'we', 'you', 'team',
  'experience', 'years', 'work', 'working', 'skills', 'responsibilities',
  'requirements', 'qualifications', 'job', 'role', 'company', 'organization'
]);

export function analyzeKnowledgeCoverage(texts: Array<{ text: string; source: 'jd' | 'resume' }>): {
  totalTermsScanned: number;
  recognizedTermsCount: number;
  unmappedProposals: UnmappedConceptProposal[];
} {
  const unmappedFreq = new Map<string, { count: number; occurrences: Array<{ snippet: string; context: 'jd' | 'resume' }> }>();
  let totalTerms = 0;
  let recognizedCount = 0;

  for (const { text, source } of texts) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Extract candidate technical phrases (CamelCase, acronyms, capitalized technical words)
      const matches = line.match(/\b[A-Z][a-zA-Z0-9+#.]*(?:\s+[A-Z][a-zA-Z0-9+#.]*)*\b/g) || [];

      for (const phrase of matches) {
        const clean = phrase.trim();
        const lower = clean.toLowerCase();

        if (clean.length < 2 || COMMON_STOPWORDS.has(lower) || /^\d+$/.test(clean)) {
          continue;
        }

        totalTerms++;

        // Check if recognized in base taxonomy or new ontology
        const isRecognized = ALIAS_LOOKUP_MAP.has(lower) || ONTOLOGY_ALIAS_MAP.has(lower);

        if (isRecognized) {
          recognizedCount++;
        } else {
          const existing = unmappedFreq.get(clean) || { count: 0, occurrences: [] };
          existing.count++;
          if (existing.occurrences.length < 3) {
            existing.occurrences.push({ snippet: line.slice(0, 100), context: source });
          }
          unmappedFreq.set(clean, existing);
        }
      }
    }
  }

  // Generate reviewable proposals (filtered to terms with frequency >= 2 or length >= 4)
  const unmappedProposals: UnmappedConceptProposal[] = Array.from(unmappedFreq.entries())
    .filter(([term, data]) => data.count >= 2 || term.length >= 4)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50)
    .map(([term, data]) => ({
      term,
      frequency: data.count,
      occurrences: data.occurrences,
      confidence: Math.min(0.9, 0.4 + data.count * 0.1),
      status: 'pending_review',
    }));

  return {
    totalTermsScanned: totalTerms,
    recognizedTermsCount: recognizedCount,
    unmappedProposals,
  };
}
