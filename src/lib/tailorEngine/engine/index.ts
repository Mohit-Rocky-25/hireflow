import { parseRawContent } from './parse';
import { normalizeRawBlocks } from './normalize';
import { routeResumeContent } from './route';
import { polishResumeContent } from './polish';
import { buildLayoutTree, LayoutTree } from './layout';
import { validateResume, ValidationReport } from './validate';
import { renderHtmlPreview } from './export';
import { CanonicalResume } from './schema';

export * from './schema';
export * from './tokens';
export * from './parse';
export * from './normalize';
export * from './route';
export * from './polish';
export * from './layout';
export * from './validate';
export * from './export';

export interface ProcessedTailoredResume {
  canonical: CanonicalResume;
  layout: LayoutTree;
  validation: ValidationReport;
  htmlPreview: string;
}

export function processResumePipeline(
  rawInput: string,
  preset: 'fresher' | 'experienced' = 'fresher'
): ProcessedTailoredResume {
  // Stage 1: PARSE
  const rawBlocks = parseRawContent(rawInput);

  // Stage 2: NORMALIZE
  const normalizedChunks = normalizeRawBlocks(rawBlocks);

  // Stage 3: ROUTE
  const routedResume = routeResumeContent(normalizedChunks);

  // Stage 4: POLISH
  const polishedResume = polishResumeContent(routedResume);

  // Stage 5: LAYOUT
  const layout = buildLayoutTree(polishedResume, preset);

  // Stage 6: VALIDATE
  const validation = validateResume(polishedResume, layout);

  // Stage 7: EXPORT
  const htmlPreview = renderHtmlPreview(layout);

  return {
    canonical: polishedResume,
    layout,
    validation,
    htmlPreview
  };
}
