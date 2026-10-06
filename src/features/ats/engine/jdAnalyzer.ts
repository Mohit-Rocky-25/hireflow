// ============================================================
// ATS Resume Roaster — JD Analyzer (Stage 3)
// Extracts role requirements, must vs nice skills, and required experience
// ============================================================

import skillsData from '../knowledge/skills.json';
import rolesData from '../knowledge/roles.json';
import { JdAnalysis, JdRequirement } from './types';

const SKILLS_TAXONOMY = skillsData.skills;
const ROLES_LIST = rolesData.roles;

const EXPERIENCE_REQ_REGEX = /\b(?:(\d+)(?:\s*[-–—to]+\s*(\d+))?|\b(\d+)\+?)\s*(?:years|yrs|year|yr)\s*(?:of\s*)?(?:experience|exp)?\b/i;

export function analyzeJobDescription(jdText: string): JdAnalysis {
  const lowerJd = jdText.toLowerCase();

  // 1. Detect target role from title or keywords
  let detectedRole = ROLES_LIST.find(r => r.id === 'software_engineer_generic') || ROLES_LIST[0];
  let highestRoleScore = 0;

  for (const role of ROLES_LIST) {
    let score = 0;
    for (const alias of role.titleAliases) {
      if (lowerJd.includes(alias.toLowerCase())) {
        score += 10;
      }
    }
    // Also check signature skills in JD
    for (const must of role.must) {
      const skill = SKILLS_TAXONOMY.find(s => s.id === must.skillId);
      if (skill && lowerJd.includes(skill.canonical.toLowerCase())) {
        score += 1;
      }
    }
    if (score > highestRoleScore) {
      highestRoleScore = score;
      detectedRole = role;
    }
  }

  // 2. Detect Required Years from JD
  let detectedYears: number | undefined = undefined;
  const yearsMatch = jdText.match(EXPERIENCE_REQ_REGEX);
  if (yearsMatch) {
    const minYears = yearsMatch[1] || yearsMatch[3];
    if (minYears) {
      detectedYears = parseInt(minYears, 10);
    }
  }

  // 3. Scan JD lines for explicit skill mentions with robust section header detection
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentImportance: 'must' | 'nice' = 'must';
  const requirementsMap = new Map<string, JdRequirement>();

  const roleMustWeights = new Map(detectedRole.must.map(m => [m.skillId, m.weight]));
  const roleNiceWeights = new Map(detectedRole.nice.map(n => [n.skillId, n.weight]));

  const NICE_HEADER_REGEX = /\b(?:nice[\s-]*to[\s-]*have|preferred|bonus|plus|good[\s-]*to[\s-]*have|optional)\b/i;
  const MUST_HEADER_REGEX = /\b(?:must[\s-]*have|required|qualifications|requirements|minimum|core)\b/i;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (NICE_HEADER_REGEX.test(lowerLine)) {
      currentImportance = 'nice';
    } else if (MUST_HEADER_REGEX.test(lowerLine)) {
      currentImportance = 'must';
    }

    // Match skills mentioned in this JD line
    for (const skill of SKILLS_TAXONOMY) {
      const pattern = new RegExp(`(?<![A-Za-z0-9+#.])${skill.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9+#.])`, 'i');
      if (pattern.test(line)) {
        const roleWeight = currentImportance === 'must'
          ? (roleMustWeights.get(skill.id) || 4)
          : (roleNiceWeights.get(skill.id) || 3);

        const existing = requirementsMap.get(skill.id);
        if (existing) {
          if (currentImportance === 'must' && existing.required === 'nice') {
            existing.required = 'must';
            existing.weight = Math.max(existing.weight, roleWeight);
          }
        } else {
          requirementsMap.set(skill.id, {
            skillId: skill.id,
            canonical: skill.canonical,
            category: skill.category,
            required: currentImportance,
            weight: roleWeight,
          });
        }
      }
    }
  }

  // If JD is sparse (less than 4 must-haves explicitly detected), seed foundational musts from role profile
  const mustCount = Array.from(requirementsMap.values()).filter(r => r.required === 'must').length;
  if (mustCount < 4) {
    for (const must of detectedRole.must) {
      if (!requirementsMap.has(must.skillId)) {
        const s = SKILLS_TAXONOMY.find(sk => sk.id === must.skillId);
        if (s) {
          requirementsMap.set(s.id, {
            skillId: s.id,
            canonical: s.canonical,
            category: s.category,
            required: 'must',
            weight: must.weight,
          });
        }
      }
    }
  }

  const requiredSkills = Array.from(requirementsMap.values());

  return {
    roleId: detectedRole.id,
    roleTitle: detectedRole.titleAliases[0] || 'Software Engineer',
    requiredSkills,
    detectedYears,
    rawText: jdText,
  };
}
