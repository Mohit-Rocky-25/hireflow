// ============================================================
// HIREFLOW CANDIDATE FACT LEDGER
// Immutable ledger indexing candidate claims with metric provenance
// ============================================================

import { CandidateProfile, CandidateFact } from '../types';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';

/**
 * Extracts all numerical and metric tokens from a string.
 * Tokens include percentages, dollar values, multipliers, and numbers.
 */
export function extractMetricsFromText(text: string): string[] {
  if (!text) return [];
  const metrics: string[] = [];

  // Match percentages (e.g. 45%, 99.9%, 15.2%)
  const pctMatches = text.match(/\b\d+(?:\.\d+)?%/g);
  if (pctMatches) metrics.push(...pctMatches);

  // Match currency (e.g. $50k, $1.2M, €400,000, ₹10L)
  const currencyMatches = text.match(/[$€£₹]\s*\d+(?:\.\d+)?(?:k|m|b|l|cr)?\b/gi);
  if (currencyMatches) metrics.push(...currencyMatches.map(m => m.replace(/\s+/g, '')));

  // Match multipliers / ratios (e.g. 10x, 3.5x, 24/7)
  const multMatches = text.match(/\b\d+(?:\.\d+)?x\b|\b24\/7\b/gi);
  if (multMatches) metrics.push(...multMatches);

  // Match standalone numbers with units (e.g. 500+ users, 12 engineers, 50ms, 100k requests)
  const unitMatches = text.match(/\b\d+(?:,\d+)*(?:\.\d+)?\s*(?:users|clients|engineers|developers|ms|seconds|minutes|hours|days|weeks|months|years|req\/s|rps|qps|stars|downloads|endpoints|features|services|clusters|nodes|vms|vulnerabilities|findings)\b/gi);
  if (unitMatches) metrics.push(...unitMatches.map(m => m.trim().toLowerCase()));

  // Standalone numbers > 1
  const numMatches = text.match(/\b\d+(?:,\d+)*(?:\.\d+)?\+?\b/g);
  if (numMatches) {
    for (const n of numMatches) {
      if (!metrics.some(m => m.includes(n))) {
        metrics.push(n);
      }
    }
  }

  return Array.from(new Set(metrics));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Builds an immutable fact ledger from a CandidateProfile
 */
export function buildCandidateFactLedger(profile: CandidateProfile): CandidateFact[] {
  const facts: CandidateFact[] = [];
  const now = new Date().toISOString();

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
