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
  presetOrRole?: 'fresher' | 'experienced' | string,
  maybeTargetRole?: string
): ProcessedTailoredResume {
  const preset: 'fresher' | 'experienced' =
    presetOrRole === 'experienced' ? 'experienced' : 'fresher';
  const targetRole =
    presetOrRole && presetOrRole !== 'fresher' && presetOrRole !== 'experienced'
      ? presetOrRole
      : maybeTargetRole;

  // Stage 1: PARSE
  const rawBlocks = parseRawContent(rawInput);

  // Stage 2: NORMALIZE
  const normalizedChunks = normalizeRawBlocks(rawBlocks);

  // Stage 3: ROUTE
  const routedResume = routeResumeContent(normalizedChunks);

  // Stage 4: POLISH
  const polishedResume = polishResumeContent(routedResume, targetRole);

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

export function tailorResumePipeline(
  rawInput: string,
  targetJobDescription?: string,
  options?: { targetPageCount?: 1 | 2; activeTemplate?: 'classic' | 'modern' | 'compact' }
) {
  const rawBlocks = parseRawContent(rawInput);
  const normalizedChunks = normalizeRawBlocks(rawBlocks);
  const routed = routeResumeContent(normalizedChunks);
  const polished = polishResumeContent(routed, targetJobDescription);
  const layout = buildLayoutTree(polished, 'fresher');
  const validation = validateResume(polished, layout);
  const exportedHtml = renderHtmlPreview(layout);

  return {
    rawBlocks,
    normalized: normalizedChunks,
    routed,
    polished,
    canonical: polished,
    layout,
    validation,
    exported: { html: exportedHtml }
  };
}
