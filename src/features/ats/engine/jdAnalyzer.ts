// ============================================================
// ATS Resume Roaster — JD Analyzer (Stage 6)
// Extracts role requirements, must vs nice skills, OR-groups,
// required experience, education, and certifications.
// ============================================================

import { ALL_TAXONOMY_SKILLS, verifyAmbiguityGuard } from '../knowledge/taxonomy';
import rolesData from '../knowledge/roles.json';
import { JdAnalysis, JdRequirement } from './types';

const ROLES_LIST = rolesData.roles;

const EXPERIENCE_REQ_REGEX = /\b(?:(\d+)(?:\s*[-–—to]+\s*(\d+))?|\b(\d+)\+?)\s*(?:years|yrs|year|yr)\s*(?:of\s*)?(?:experience|exp)?\b/i;

const EDUCATION_REQ_REGEX = /\b(?:bachelor'?s?|master'?s?|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|degree)\b(?:\s+(?:in|of)\s+([a-zA-Z\s&/]+))?/i;

const CERTS_REGEX = /\b(aws certified|cka|ckad|cissp|ceh|comptia|pmp|itil|azure certified|gcp professional)\b/gi;

const BOILERPLATE_REGEX = /\b(?:equal opportunity|affirmative action|benefits|perks|compensation|diversity|inclusive workplace|about us|who we are|health insurance|401k)\b/i;
const NICE_HEADER_REGEX = /\b(?:nice[\s-]*to[\s-]*have|preferred|bonus|plus|good[\s-]*to[\s-]*have|optional|desired)\b/i;
const MUST_HEADER_REGEX = /\b(?:must[\s-]*have|required|qualifications|requirements|minimum|core|essential)\b/i;

/**
 * Escapes regex special characters in alias strings.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    for (const must of role.must) {
      const skill = ALL_TAXONOMY_SKILLS.find(s => s.id === must.skillId);
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

  // 3. Detect Education & Certifications
  let requiredEducation: string | undefined = undefined;
  const eduMatch = jdText.match(EDUCATION_REQ_REGEX);
  if (eduMatch) {
    requiredEducation = eduMatch[0].trim();
  }

  const certMatches = jdText.match(CERTS_REGEX);
  const requiredCerts = certMatches ? Array.from(new Set(certMatches.map(c => c.trim()))) : undefined;

  // 4. Scan JD lines for explicit skill mentions with requirement classification & OR-group detection
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentImportance: 'must' | 'nice' = 'must';
  const requirementsMap = new Map<string, JdRequirement>();

  const roleMustWeights = new Map(detectedRole.must.map(m => [m.skillId, m.weight]));
  const roleNiceWeights = new Map(detectedRole.nice.map(n => [n.skillId, n.weight]));

  let orGroupCounter = 0;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for boilerplate sections to ignore
    if (BOILERPLATE_REGEX.test(lowerLine) && !MUST_HEADER_REGEX.test(lowerLine)) {
      continue;
    }

    if (NICE_HEADER_REGEX.test(lowerLine)) {
      currentImportance = 'nice';
    } else if (MUST_HEADER_REGEX.test(lowerLine)) {
      currentImportance = 'must';
    }

    // Match skills mentioned in this JD line
    const skillsInLine: { id: string; canonical: string; category: string }[] = [];

    for (const skill of ALL_TAXONOMY_SKILLS) {
      const aliases = skill.aliases.length > 0 ? skill.aliases : [skill.canonical];
      for (const alias of aliases) {
        const pattern = new RegExp(`(?<![A-Za-z0-9+#.])${escapeRegex(alias)}(?![A-Za-z0-9+#.])`, 'i');
        if (pattern.test(line)) {
          if (!verifyAmbiguityGuard(skill, line)) {
            continue;
          }
          if (!skillsInLine.some(s => s.id === skill.id)) {
            skillsInLine.push({ id: skill.id, canonical: skill.canonical, category: skill.category });
          }
          break;
        }
      }
    }

    // Detect OR group in this requirement line (e.g. "Java or Kotlin", "AWS / GCP / Azure", "MySQL or Postgres")
    const isOrGroup = skillsInLine.length >= 2 && (/\bor\b|\/|\beither\b/i.test(line));
    let currentOrGroupId: string | undefined = undefined;

    if (isOrGroup) {
      orGroupCounter++;
      currentOrGroupId = `or_group_${orGroupCounter}`;
    }

    for (const matched of skillsInLine) {
      const roleWeight = currentImportance === 'must'
        ? (roleMustWeights.get(matched.id) || 4)
        : (roleNiceWeights.get(matched.id) || 3);

      const existing = requirementsMap.get(matched.id);
      const orAlts = isOrGroup ? skillsInLine.filter(s => s.id !== matched.id).map(s => s.id) : undefined;

      if (existing) {
        if (currentImportance === 'must' && existing.required === 'nice') {
          existing.required = 'must';
          existing.weight = Math.max(existing.weight, roleWeight);
        }
        if (currentOrGroupId && !existing.orGroupId) {
          existing.orGroupId = currentOrGroupId;
          existing.orAlternatives = orAlts;
        }
      } else {
        requirementsMap.set(matched.id, {
          skillId: matched.id,
          canonical: matched.canonical,
          category: matched.category,
          required: currentImportance,
          weight: roleWeight,
          orGroupId: currentOrGroupId,
          orAlternatives: orAlts,
        });
      }
    }
  }

  // 5. If JD is sparse (fewer than 4 must-haves explicitly detected), seed foundational musts from role profile
  const mustCount = Array.from(requirementsMap.values()).filter(r => r.required === 'must').length;
  if (mustCount < 4) {
    for (const must of detectedRole.must) {
      if (!requirementsMap.has(must.skillId)) {
        const s = ALL_TAXONOMY_SKILLS.find(sk => sk.id === must.skillId);
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
    requiredEducation,
    requiredCerts,
  };
}
