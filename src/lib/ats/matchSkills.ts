// ============================================================
// HireFlow ATS Engine — matchSkills
// Pure TypeScript module to match skills against taxonomy
// ============================================================

import { SkillMatchResult, SkillMatchStatus, TaxonomySkill } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const taxonomyList = skillsTaxonomyData as TaxonomySkill[];
const taxonomyMap = new Map<string, TaxonomySkill>();
for (const item of taxonomyList) {
  taxonomyMap.set(item.canonical.toLowerCase(), item);
}

export function matchSkills(
  resumeSkills: string[],
  jdMustHaves: string[],
  jdNiceToHaves: string[],
  resumeRawText: string
): SkillMatchResult[] {
  const resumeSkillsLower = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const resumeTextLower = resumeRawText.toLowerCase();

  // Pre-calculate all implied skills from what candidate has
  const impliedFromCandidate = new Map<string, string>(); // impliedSkillLower -> sourceSkill
  for (const skill of resumeSkills) {
    const tax = taxonomyMap.get(skill.toLowerCase());
    if (tax?.implies) {
      for (const imp of tax.implies) {
        impliedFromCandidate.set(imp.toLowerCase(), skill);
      }
    }
  }

  const results: SkillMatchResult[] = [];
  const allJdSkills = [
    ...jdMustHaves.map((s) => ({ skill: s, importance: 'must_have' as const })),
    ...jdNiceToHaves.map((s) => ({ skill: s, importance: 'nice_to_have' as const })),
  ];

  for (const { skill, importance } of allJdSkills) {
    const skillLower = skill.toLowerCase();
    const tax = taxonomyMap.get(skillLower);
    const weight = tax?.weight ?? 4;
    const category = tax?.category ?? 'Backend';

    let status: SkillMatchStatus = 'missing';
    let matchedAs: string | undefined;
    let evidenceSnippet: string | undefined;

    // 1. Exact Match
    if (resumeSkillsLower.has(skillLower)) {
      status = 'exact';
      matchedAs = skill;
    }
    // 2. Alias Match
    else if (tax?.aliases && tax.aliases.some((a) => resumeSkillsLower.has(a.toLowerCase()))) {
      status = 'alias';
      matchedAs = tax.aliases.find((a) => resumeSkillsLower.has(a.toLowerCase()));
    }
    // 3. Implied Match
    else if (impliedFromCandidate.has(skillLower)) {
      status = 'implied';
      matchedAs = `Implied by ${impliedFromCandidate.get(skillLower)}`;
    }
    // 4. Text Match (mentioned in resume text even if not in skills section)
    else if (resumeTextLower.includes(skillLower)) {
      status = 'exact';
      matchedAs = skill;
    }
    // 5. Related Skill Match (Partial credit)
    else if (tax?.related && tax.related.some((r) => resumeSkillsLower.has(r.toLowerCase()))) {
      const rel = tax.related.find((r) => resumeSkillsLower.has(r.toLowerCase()))!;
      status = 'related';
      matchedAs = `Related: ${rel}`;
    }

    // Find snippet from resume
    if (status !== 'missing') {
      const searchTarget = matchedAs?.replace(/^Related:\s*/, '').replace(/^Implied by\s*/, '') || skill;
      const regex = new RegExp(`([^.\\n]{0,60}\\b${searchTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^.\\n]{0,60})`, 'i');
      const match = resumeRawText.match(regex);
      if (match) {
        evidenceSnippet = `"...${match[1].trim()}..."`;
      } else {
        evidenceSnippet = `Found in candidate skill index as ${searchTarget}`;
      }
    }

    let gapType: 'matched' | 'wording_fix' | 'learn_needed' = 'matched';
    if (status === 'missing') {
      gapType = 'learn_needed';
    } else if (status === 'related' || status === 'implied') {
      gapType = 'wording_fix';
    }

    results.push({
      skill,
      category,
      status,
      weight,
      importance,
      matchedAs,
      evidenceSnippet,
      gapType,
    });
  }

  return results;
}
