// ============================================================
// HIREFLOW TRUTH GATE & FACTUAL INTEGRITY SENTINEL
// Zero-tolerance hallucination detection and export blocking gate
// ============================================================

import { TruthGateResult, TailoredResume, CandidateProfile } from '../types';
import { extractMetricsFromText, buildCandidateFactLedger } from '../ledger/factLedger';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';

export function verifyFactualIntegrity(
  tailoredResume: TailoredResume,
  candidateProfile: CandidateProfile
): TruthGateResult {
  const factLedger = buildCandidateFactLedger(candidateProfile);
  const blockingIssues: TruthGateResult['blockingIssues'] = [];
  const inventedMetricsDetected: string[] = [];

  let totalBullets = 0;
  let preservedMetricsCount = 0;

  // Build master set of all original metrics in candidate resume
  const allOriginalMetrics = new Set<string>();
  for (const fact of factLedger) {
    for (const m of fact.extractedMetrics) {
      allOriginalMetrics.add(m.toLowerCase().replace(/\s+/g, ''));
    }
  }

  // Master set of all original skills in candidate profile
  const originalSkillIds = new Set<string>();
  for (const fact of factLedger) {
    for (const c of fact.normalizedConcepts) {
      originalSkillIds.add(c);
    }
  }

  // Scan every section and bullet in tailored resume
  for (const section of tailoredResume.sections) {
    if (!section.visible || !section.content.entries) continue;

    for (const entry of section.content.entries) {
      if (!entry.bullets) continue;

      for (const bullet of entry.bullets) {
        totalBullets++;
        const tailoredMetrics = extractMetricsFromText(bullet.text);

        for (const tm of tailoredMetrics) {
          const normalizedTm = tm.toLowerCase().replace(/\s+/g, '');
          // Check if metric exists in original facts
          if (allOriginalMetrics.has(normalizedTm)) {
            preservedMetricsCount++;
          } else {
            // Check if bullet has an associated originalText
            const originalBulletMetrics = bullet.originalText
              ? extractMetricsFromText(bullet.originalText).map(m => m.toLowerCase().replace(/\s+/g, ''))
              : [];

            if (!originalBulletMetrics.includes(normalizedTm)) {
              // INVENTED METRIC DETECTED!
              inventedMetricsDetected.push(tm);
              blockingIssues.push({
                id: `block_metric_${Math.random().toString(36).substr(2, 7)}`,
                message: `Invented metric detected: "${tm}" in ${section.title} (${entry.primaryTitle}). This number did not exist in candidate source facts.`,
                section: section.title,
                severity: 'CRITICAL'
              });
            }
          }
        }

        // Check for invented tools or technologies in bullet
        const skillsInBullet = extractSkillsFromText(bullet.text);
        for (const skill of skillsInBullet) {
          if (!originalSkillIds.has(skill.id)) {
            // Check if user confirmed it or edited it manually
            if (!bullet.isEditedByUser) {
              blockingIssues.push({
                id: `block_skill_${Math.random().toString(36).substr(2, 7)}`,
                message: `Unverified skill "${skill.name}" introduced in bullet without candidate confirmation.`,
                section: section.title,
                severity: 'WARNING'
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
    blockingIssues
  };
}
