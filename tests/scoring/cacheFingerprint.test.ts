// ============================================================
// HireFlow Scoring Suite — Stage 7.7: Cache Fingerprint Invalidation Tests
// Verifies that persisted scores stamped with specFingerprint detect spec drift
// and invalidate stale cache entries across Roaster and TalentLens.
// ============================================================

import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec/canonicalSpec';
import { computeSpecFingerprint } from '../../src/scoring/core/fingerprint';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { ResumeScoringInput } from '../../src/scoring/core/calculators';
import { ScoringSpec } from '../../src/scoring/spec/types';

describe('Stage 7.7: Cache Fingerprint Invalidation Suite', () => {
  const currentSpec = CANONICAL_SCORING_SPEC;
  const currentFingerprint = computeSpecFingerprint(currentSpec);

  const sampleResume: ResumeScoringInput = {
    rawText: 'John Doe | john@example.com\nExperience\nSoftware Engineer\nBuilt apps in Go and PostgreSQL.\nSkills\nGo, PostgreSQL\nEducation\nB.Tech',
    sectionsFound: ['Experience', 'Skills', 'Education'],
    experienceBullets: ['Built apps in Go and PostgreSQL.'],
    projectBullets: [],
    skillsBlockText: 'Go, PostgreSQL',
    hasGithubOrDemoLink: false,
    hasPhoto: false,
    hasDeclaration: false,
    hasFatherNameOrFullAddress: false,
    detectedWordCount: 120,
  };

  const context = buildScoringContext({
    experienceLevel: 'Student',
    roleFamily: 'Backend',
  });

  it('recognizes cached results as fresh when specFingerprint matches current canonical spec', () => {
    const trace = runScoringEngine(context, sampleResume, { spec: currentSpec });

    // Simulate stored record in localStorage
    const storedRecord = {
      compositeScore: trace.compositeDisplay,
      specVersion: trace.specVersion,
      engineVersion: trace.engineVersion,
      specFingerprint: trace.specFingerprint,
      computedAt: new Date().toISOString(),
    };

    const isStale = storedRecord.specFingerprint !== currentFingerprint;
    expect(isStale).toBe(false);
  });

  it('invalidates cache and detects staleness when spec fingerprint drifts', () => {
    // 1. Create previous cached record from an older spec
    const olderSpec: ScoringSpec = JSON.parse(JSON.stringify(currentSpec));
    olderSpec.specVersion = '2.3.0';
    olderSpec.profiles.find((p) => p.id === 'fresher')!.weights.requirement_coverage = 45;
    olderSpec.profiles.find((p) => p.id === 'fresher')!.weights.evidence_quality = 20;

    const olderFingerprint = computeSpecFingerprint(olderSpec);
    expect(olderFingerprint).not.toBe(currentFingerprint);

    const oldTrace = runScoringEngine(context, sampleResume, { spec: olderSpec });
    const cachedEntry = {
      score: oldTrace.compositeDisplay,
      specVersion: oldTrace.specVersion,
      specFingerprint: oldTrace.specFingerprint,
    };

    // Stale check (same logic as StaleVersionBanner.tsx)
    const isStale = cachedEntry.specFingerprint !== currentFingerprint;
    expect(isStale).toBe(true);

    // Recomputation with current spec updates fingerprint and restores freshness
    const freshTrace = runScoringEngine(context, sampleResume, { spec: currentSpec });
    expect(freshTrace.specFingerprint).toBe(currentFingerprint);
    expect(freshTrace.specFingerprint !== currentFingerprint).toBe(false);
  });

  it('guarantees stored candidate match stamps specVersion, engineVersion, and specFingerprint', () => {
    const trace = runScoringEngine(context, sampleResume);

    expect(trace.specVersion).toBe(currentSpec.specVersion);
    expect(trace.engineVersion).toBe(currentSpec.engineVersion);
    expect(trace.specFingerprint).toBe(currentFingerprint);
    expect(trace.specFingerprint.length).toBe(64); // Full SHA-256 hex string
  });
});
