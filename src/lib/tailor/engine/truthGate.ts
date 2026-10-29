// ============================================================
// HIREFLOW TRUTH GATE & FACTUAL INTEGRITY SENTINEL
// Zero-tolerance hallucination detection and export blocking gate (Stage 5)
// Evaluates both claim-strength ladder and metric preservation (I-02).
// ============================================================

import { TruthGateResult, TailoredResume, CandidateProfile } from '../types';
import { extractMetricsFromText, buildCandidateFactLedger } from '../ledger/factLedger';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';
import { CLAIM_STRENGTH_LADDER } from '../../../config/thresholds';

function getVerbRank(bulletText: string): { verb: string; rank: number } {
  const clean = bulletText.replace(/^[-•*►›\d.]+\s*/, '').trim().toLowerCase();
  const firstWord = clean.split(/\s+/)[0] || '';
  const firstTwo = clean.split(/\s+/).slice(0, 2).join(' ');

  if (CLAIM_STRENGTH_LADDER[firstTwo]) {
    return { verb: firstTwo, rank: CLAIM_STRENGTH_LADDER[firstTwo] };
  }
  if (CLAIM_STRENGTH_LADDER[firstWord]) {
    return { verb: firstWord, rank: CLAIM_STRENGTH_LADDER[firstWord] };
  }
  for (const [v, r] of Object.entries(CLAIM_STRENGTH_LADDER)) {
    if (clean.startsWith(v)) {
      return { verb: v, rank: r };
    }
  }
  return { verb: firstWord, rank: 3 };
}

export function verifyFactualIntegrity(
  tailoredResume: TailoredResume,
  candidateProfile: CandidateProfile
): TruthGateResult {
  const factLedger = buildCandidateFactLedger(candidateProfile);
  const blockingIssues: TruthGateResult['blockingIssues'] = [];
  const inventedMetricsDetected: string[] = [];

  let totalBullets = 0;
  let preservedMetricsCount = 0;

  const allOriginalMetrics = new Set<string>();
  for (const fact of factLedger) {
    for (const m of fact.extractedMetrics) {
      allOriginalMetrics.add(m.toLowerCase().replace(/\s+/g, ''));
    }
  }

  const originalSkillIds = new Set<string>();
  for (const fact of factLedger) {
    for (const c of fact.normalizedConcepts) {
      originalSkillIds.add(c);
    }
  }

  for (const section of tailoredResume.sections) {
    if (!section.visible || !section.content.entries) continue;

    for (const entry of section.content.entries) {
      if (!entry.bullets) continue;

      for (const bullet of entry.bullets) {
        totalBullets++;

        // 1. Check claim-strength verb escalation (I-02)
        if (bullet.originalText && bullet.originalText.trim() !== bullet.text.trim()) {
          const original = getVerbRank(bullet.originalText);
          const tailored = getVerbRank(bullet.text);

          if (tailored.rank > original.rank) {
            blockingIssues.push({
              id: `block_verb_${Math.random().toString(36).substr(2, 7)}`,
              message: `Verb escalation detected: "${tailored.verb}" (rank ${tailored.rank}) escalates candidate ownership from original "${original.verb}" (rank ${original.rank}). Violates claim-strength ladder.`,
              section: section.title,
              severity: 'CRITICAL',
            });
          }
        }

        // 2. Check metric preservation & hallucination
        const tailoredMetrics = extractMetricsFromText(bullet.text);
        for (const tm of tailoredMetrics) {
          const normalizedTm = tm.toLowerCase().replace(/\s+/g, '');
          if (allOriginalMetrics.has(normalizedTm)) {
            preservedMetricsCount++;
          } else {
            const originalBulletMetrics = bullet.originalText
              ? extractMetricsFromText(bullet.originalText).map(m => m.toLowerCase().replace(/\s+/g, ''))
              : [];

            if (!originalBulletMetrics.includes(normalizedTm)) {
              inventedMetricsDetected.push(tm);
              blockingIssues.push({
                id: `block_metric_${Math.random().toString(36).substr(2, 7)}`,
                message: `Invented metric detected: "${tm}" in ${section.title} (${entry.primaryTitle}). This number did not exist in candidate source facts.`,
                section: section.title,
                severity: 'CRITICAL',
              });
            }
          }
        }

        // 3. Check for invented skills
        const skillsInBullet = extractSkillsFromText(bullet.text);
        for (const skill of skillsInBullet) {
          if (!originalSkillIds.has(skill.id)) {
            if (!bullet.isEditedByUser) {
              blockingIssues.push({
                id: `block_skill_${Math.random().toString(36).substr(2, 7)}`,
                message: `Unverified skill "${skill.name}" introduced in bullet without candidate confirmation.`,
                section: section.title,
                severity: 'WARNING',
              });
            }
          }
        }
      }
    }
  }

  const criticalCount = blockingIssues.filter(b => b.severity === 'CRITICAL').length;
  const warningCount = blockingIssues.filter(b => b.severity === 'WARNING').length;

  const score = Math.max(0, 100 - (criticalCount * 30 + warningCount * 10));
  const passed = criticalCount === 0;

  return {
    passed,
    score,
    unsupportedClaimsCount: warningCount,
    preservedMetricsCount,
    inventedMetricsDetected,
    blockingIssues,
  };
}
