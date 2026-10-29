// ============================================================
// HIREFLOW CANDIDATE FACT LEDGER
// Immutable ledger indexing candidate claims with metric provenance
// Delegates metric extraction to canonical Stage 1 extractor (I-10).
// ============================================================

import { CandidateProfile, CandidateFact } from '../types';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';
import { extractMetrics } from '../../resume/extractor';

/**
 * Extracts all numerical and metric tokens from a string using canonical extractor.
 */
export function extractMetricsFromText(text: string): string[] {
  if (!text) return [];
  const extracted = extractMetrics(text);
  return Array.from(new Set(extracted.map(m => m.raw)));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Builds an immutable fact ledger from a CandidateProfile
 */
export function buildCandidateFactLedger(profile: CandidateProfile): CandidateFact[] {
  const facts: CandidateFact[] = [];
  const now = '2026-10-28T12:00:00.000Z';

  // Summary fact
  if (profile.summary && profile.summary.trim()) {
    const skills = extractSkillsFromText(profile.summary);
    facts.push({
      factId: `fact_summary_${simpleHash(profile.summary)}`,
      sourceSection: 'summary',
      rawText: profile.summary,
      normalizedConcepts: skills.map(s => s.id),
      extractedMetrics: extractMetricsFromText(profile.summary),
      hash: simpleHash(profile.summary),
      createdAt: now
    });
  }

  // Experience facts
  for (const exp of profile.experience) {
    exp.bullets.forEach((bullet, idx) => {
      if (!bullet.trim()) return;
      const skills = extractSkillsFromText(bullet);
      facts.push({
        factId: `fact_exp_${exp.id}_${idx}`,
        sourceSection: 'experience',
        entryId: exp.id,
        bulletIndex: idx,
        rawText: bullet,
        normalizedConcepts: skills.map(s => s.id),
        extractedMetrics: extractMetricsFromText(bullet),
        hash: simpleHash(bullet),
        createdAt: now
      });
    });
  }

  // Project facts
  for (const proj of profile.projects) {
    proj.bullets.forEach((bullet, idx) => {
      if (!bullet.trim()) return;
      const skills = extractSkillsFromText(bullet + ' ' + (proj.technologiesUsed || []).join(' '));
      facts.push({
        factId: `fact_proj_${proj.id}_${idx}`,
        sourceSection: 'projects',
        entryId: proj.id,
        bulletIndex: idx,
        rawText: bullet,
        normalizedConcepts: skills.map(s => s.id),
        extractedMetrics: extractMetricsFromText(bullet),
        hash: simpleHash(bullet),
        createdAt: now
      });
    });
  }

  // Education facts
  for (const edu of profile.education) {
    const eduText = `${edu.degree} at ${edu.institution} ${edu.scoreValue ? `Score: ${edu.scoreValue}` : ''}`;
    facts.push({
      factId: `fact_edu_${edu.id}`,
      sourceSection: 'education',
      entryId: edu.id,
      rawText: eduText,
      normalizedConcepts: edu.coursework ? edu.coursework.map(c => c.toLowerCase()) : [],
      extractedMetrics: extractMetricsFromText(eduText),
      hash: simpleHash(eduText),
      createdAt: now
    });
  }

  // Skills facts
  const allSkills = [
    ...(profile.skills.languages || []),
    ...(profile.skills.frameworks || []),
    ...(profile.skills.developerTools || []),
    ...(profile.skills.cloudAndDevOps || []),
    ...(profile.skills.databases || []),
    ...(profile.skills.coreConcepts || []),
    ...(profile.skills.other || [])
  ];

  if (allSkills.length > 0) {
    const skillText = allSkills.join(', ');
    const resolved = extractSkillsFromText(skillText);
    facts.push({
      factId: `fact_skills_${simpleHash(skillText)}`,
      sourceSection: 'skills',
      rawText: skillText,
      normalizedConcepts: resolved.map(s => s.id),
      extractedMetrics: [],
      hash: simpleHash(skillText),
      createdAt: now
    });
  }

  return facts;
}
