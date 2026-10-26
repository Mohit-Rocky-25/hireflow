/**
 * HireFlow v4: Cross-JD Skill Demand Aggregation (A4.3)
 * Deterministic aggregation of required skills across saved candidate JDs.
 * Enforces >= 3 JDs threshold and provides ExplainedValue derivations.
 */

import { SavedJD } from '../../types/schemas-v4';
import { ActiveResume } from '../../store/profileStore';
import { ExplainedValue } from '../../types/explain';
import { REQUIREMENT_WEIGHT_CLASSES } from '../../config/scoring';

export interface DemandedSkillItem {
  skillName: string;
  jdCount: number;
  mandatoryCount: number;
  preferredCount: number;
  weightedScore: number;
  currentEvidenceLevel: number | null;
  explain: ExplainedValue;
}

export interface DemandAggregationResult {
  eligible: boolean;
  totalJds: number;
  message?: string;
  skills: DemandedSkillItem[];
}

const COMMON_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'AWS',
  'Git',
  'REST API',
  'GraphQL',
  'HTML',
  'CSS',
  'Tailwind',
  'Next.js',
  'Express',
  'Spring Boot',
  'Linux',
  'Redis',
  'Microservices',
];

/**
 * Aggregates demanded skills across candidate's saved JDs.
 * Requires at least 3 JDs to prevent skewed conclusions.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeSkillRegex(skill: string): RegExp {
  const escaped = escapeRegex(skill);
  return new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`, 'i');
}

export function aggregateDemandedSkills(
  jds: SavedJD[],
  activeResume?: ActiveResume | null
): DemandAggregationResult {
  if (!jds || jds.length < 3) {
    return {
      eligible: false,
      totalJds: jds?.length || 0,
      message: 'Save at least 3 job descriptions to unlock cross-JD market demand analysis.',
      skills: [],
    };
  }

  const skillCounts = new Map<
    string,
    { mandatory: string[]; preferred: string[]; mentioned: string[] }
  >();

  for (const jd of jds) {
    for (const skill of COMMON_SKILLS) {
      const regex = makeSkillRegex(skill);
      if (regex.test(jd.text)) {
        const entry = skillCounts.get(skill) || {
          mandatory: [],
          preferred: [],
          mentioned: [],
        };

        // Context heuristic: check if line containing skill has mandatory terms
        const lines = jd.text.split('\n');
        const relevantLine = lines.find((l) => regex.test(l)) || '';
        const lowerLine = relevantLine.toLowerCase();

        if (
          lowerLine.includes('must') ||
          lowerLine.includes('required') ||
          lowerLine.includes('mandatory') ||
          lowerLine.includes('strong') ||
          lowerLine.includes('proficient')
        ) {
          entry.mandatory.push(jd.title);
        } else if (
          lowerLine.includes('preferred') ||
          lowerLine.includes('good to have') ||
          lowerLine.includes('plus') ||
          lowerLine.includes('nice to have')
        ) {
          entry.preferred.push(jd.title);
        } else {
          entry.mentioned.push(jd.title);
        }

        skillCounts.set(skill, entry);
      }
    }
  }

  // Build explained output per skill
  const skills: DemandedSkillItem[] = [];

  for (const [skillName, counts] of skillCounts.entries()) {
    const totalJdCount = counts.mandatory.length + counts.preferred.length + counts.mentioned.length;
    if (totalJdCount === 0) continue;

    const weightedScore =
      counts.mandatory.length * REQUIREMENT_WEIGHT_CLASSES.mandatory +
      counts.preferred.length * REQUIREMENT_WEIGHT_CLASSES.preferred +
      counts.mentioned.length * REQUIREMENT_WEIGHT_CLASSES.mentioned;

    // Check candidate evidence level in active resume ledger
    let evidenceLevel: number | null = null;
    if (activeResume?.ledger) {
      const ledgerStr = JSON.stringify(activeResume.ledger).toLowerCase();
      if (ledgerStr.includes(skillName.toLowerCase())) {
        evidenceLevel = 1; // demonstrated in resume
      }
    }

    const contributingJds = Array.from(
      new Set([...counts.mandatory, ...counts.preferred, ...counts.mentioned])
    );

    const explain: ExplainedValue = {
      id: `demand-${skillName.toLowerCase()}`,
      label: `Demand for ${skillName}`,
      value: weightedScore,
      unit: 'pts',
      formula: `${counts.mandatory.length} mandatory x ${REQUIREMENT_WEIGHT_CLASSES.mandatory} + ${counts.preferred.length} preferred x ${REQUIREMENT_WEIGHT_CLASSES.preferred} + ${counts.mentioned.length} mentioned x ${REQUIREMENT_WEIGHT_CLASSES.mentioned}`,
      inputs: contributingJds.map((title) => ({
        name: title,
        value: counts.mandatory.includes(title)
          ? 'Mandatory (3.0)'
          : counts.preferred.includes(title)
          ? 'Preferred (1.5)'
          : 'Mentioned (1.0)',
        source: 'Candidate Saved JD Library',
      })),
      confidence: totalJdCount >= 3 ? 'high' : 'medium',
      limitations: [
        'Derived strictly from the JDs you saved in HireFlo, not the global tech market.',
        'Weights reflect configured campus hiring priority multipliers.',
      ],
    };

    skills.push({
      skillName,
      jdCount: totalJdCount,
      mandatoryCount: counts.mandatory.length,
      preferredCount: counts.preferred.length,
      weightedScore,
      currentEvidenceLevel: evidenceLevel,
      explain,
    });
  }

  // Sort descending by weightedScore
  skills.sort((a, b) => b.weightedScore - a.weightedScore);

  return {
    eligible: true,
    totalJds: jds.length,
    skills,
  };
}
