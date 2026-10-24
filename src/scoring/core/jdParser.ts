// ============================================================
// HireFlow Scoring Suite — Pure JD Requirement Extraction & Confirmation
// Task 2.3: Deterministic heading/cue extraction, unrecognized term audit,
// and proposal validation (item text must appear verbatim in JD).
// ============================================================

import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';
import { ConfirmedRequirement, RequirementClass, JdSeniorityLevel } from './types';
import { RoleFamily, ScoringSpec } from '../spec/types';
import { CANONICAL_SCORING_SPEC } from '../spec/canonicalSpec';

export interface ParsedJobDescription {
  roleTitle: string;
  roleFamily: RoleFamily;
  jdLevel: JdSeniorityLevel;
  yearsRequired: number;
  confirmedRequirements: ConfirmedRequirement[];
  unrecognizedRequirements: ConfirmedRequirement[];
  warnings: string[];
}

const MUST_HEADINGS =
  /(?:must[\s-]have|key requirements|requirements|qualifications|basic qualifications|core skills|mandatory|minimum qualifications|what you'?ll need)/i;

const PREFERRED_HEADINGS =
  /(?:nice[\s-]to[\s-]have|preferred qualifications|bonus|preferred|good to have|plus|desirable|preferred skills)/i;

const MUST_CUES =
  /\b(?:must\s+have|must|require|requires|required|mandatory|essential|minimum\s+(?:of\s+)?\d+\+?\s*years?|strong\s+proficiency\s+in|proven\s+track\s+record\s+in)\b/i;

const PREFERRED_CUES =
  /\b(?:preferred|nice\s+to\s+have|plus|bonus|good\s+to\s+have|familiarity\s+with|is\s+a\s+plus|experience\s+with.*is\s+a\s+plus)\b/i;

interface TaxonomySkillItem {
  id?: string;
  canonical: string;
  aliases: string[];
  category?: string;
}

const TAXONOMY: TaxonomySkillItem[] = skillsTaxonomyData as TaxonomySkillItem[];

/**
 * Validates a proposed requirement (e.g. from an LLM proposal or user write-in).
 * Per Task 2.3 Rule: accepts a proposed item ONLY if its exact text appears in the JD.
 */
export function validateProposedRequirement(
  proposedText: string,
  rawJdText: string
): { valid: boolean; reason?: string } {
  if (!proposedText || proposedText.trim().length === 0) {
    return { valid: false, reason: 'Proposed requirement text is empty.' };
  }
  const cleanProposed = proposedText.trim().toLowerCase();
  const cleanJd = rawJdText.toLowerCase();

  if (!cleanJd.includes(cleanProposed)) {
    return {
      valid: false,
      reason: `Proposed requirement "${proposedText}" does not appear verbatim in the target job description.`,
    };
  }

  return { valid: true };
}

/**
 * Deterministically parses a raw JD text into confirmed & unrecognized requirements.
 */
export function parseJobDescription(
  rawJdText: string,
  spec: ScoringSpec = CANONICAL_SCORING_SPEC
): ParsedJobDescription {
  const cleanText = rawJdText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
  const warnings: string[] = [];

  // 1. Title & Role Family
  let roleTitle = 'Software Engineer';
  for (const line of lines.slice(0, 8)) {
    const titleMatch = line.match(/(?:role|title|position|job title)\s*[:\-]\s*(.+)/i);
    if (titleMatch) {
      roleTitle = titleMatch[1].trim();
      break;
    }
    if (line.match(/\b(?:engineer|developer|architect|specialist|lead|sde|sdet|scientist)\b/i) && line.length < 60) {
      roleTitle = line.replace(/^[#*\-=_~]+\s*/, '').trim();
      break;
    }
  }

  const roleLower = roleTitle.toLowerCase();
  let roleFamily: RoleFamily = 'General';
  if (/backend|server|api|distributed|platform|systems/i.test(roleLower)) roleFamily = 'Backend';
  else if (/frontend|web|ui|react|client/i.test(roleLower)) roleFamily = 'Frontend';
  else if (/full[\s-]?stack/i.test(roleLower)) roleFamily = 'Full-stack';
  else if (/data|machine learning|ml|ai|deep learning/i.test(roleLower)) roleFamily = 'Data/ML';
  else if (/mobile|android|ios|flutter|react native/i.test(roleLower)) roleFamily = 'Mobile';
  else if (/devops|infrastructure|cloud|sre/i.test(roleLower)) roleFamily = 'DevOps';

  // 2. Seniority & Years Required
  let jdLevel: JdSeniorityLevel = 'unknown';
  let yearsRequired = 0;

  const yearsMatch = cleanText.match(/(\d+)(?:\s*-\s*(\d+))?\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?experience)?/i);
  if (yearsMatch) {
    yearsRequired = parseInt(yearsMatch[1], 10);
  }

  const jdTextLower = cleanText.toLowerCase();
  if (
    jdTextLower.includes('fresher') ||
    jdTextLower.includes('entry-level') ||
    jdTextLower.includes('entry level') ||
    jdTextLower.includes('graduate') ||
    jdTextLower.includes('intern') ||
    yearsRequired <= 1
  ) {
    jdLevel = 'entry';
    if (yearsRequired > 1) yearsRequired = 0;
  } else if (yearsRequired >= 5 || jdTextLower.includes('senior') || jdTextLower.includes('lead') || jdTextLower.includes('staff')) {
    jdLevel = 'senior';
  } else if (yearsRequired >= 2 || jdTextLower.includes('mid') || jdTextLower.includes('sde 2') || jdTextLower.includes('sde ii')) {
    jdLevel = 'mid';
  }

  // 3. Section Segmentation (Heading Awareness)
  type SectionType = 'must' | 'preferred' | 'general';
  let currentSection: SectionType = 'general';

  const sectionLines: { text: string; section: SectionType }[] = [];
  for (const line of lines) {
    if (MUST_HEADINGS.test(line)) {
      currentSection = 'must';
      continue;
    }
    if (PREFERRED_HEADINGS.test(line)) {
      currentSection = 'preferred';
      continue;
    }
    sectionLines.push({ text: line, section: currentSection });
  }

  // 4. Extract Recognized Skills from Taxonomy
  const recognizedRequirements: ConfirmedRequirement[] = [];
  const foundSkillsSet = new Set<string>();

  for (const item of TAXONOMY) {
    const canonicalLower = item.canonical.toLowerCase();
    const searchTokens = [item.canonical, ...(item.aliases || [])];

    for (const token of searchTokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');

      for (let i = 0; i < sectionLines.length; i++) {
        const { text, section } = sectionLines[i];
        if (regex.test(text)) {
          if (foundSkillsSet.has(canonicalLower)) continue;
          foundSkillsSet.add(canonicalLower);

          let category: RequirementClass = 'mentioned';
          let confidence = spec.confidenceThresholds.mentioned;

          const hasMustCue = MUST_CUES.test(text);
          const hasPrefCue = PREFERRED_CUES.test(text);

          if (section === 'must' || hasMustCue) {
            category = 'must';
            confidence = hasMustCue && section === 'must'
              ? spec.confidenceThresholds.mustWithCue
              : spec.confidenceThresholds.mustStandard;
          } else if (section === 'preferred' || hasPrefCue) {
            category = 'preferred';
            confidence = hasPrefCue && section === 'preferred'
              ? spec.confidenceThresholds.preferredWithCue
              : spec.confidenceThresholds.preferredStandard;
          }

          recognizedRequirements.push({
            id: `req_${recognizedRequirements.length + 1}_${item.canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            text: item.canonical,
            category,
            confidence,
            sourceSentence: text,
            inTaxonomy: true,
          });
          break;
        }
      }
    }
  }

  // 5. Unrecognized Requirements Bucket
  // Scans must and preferred lines for technologies/tools not in taxonomy
  const unrecognizedRequirements: ConfirmedRequirement[] = [];
  const unrecognizedPhrases = new Set<string>();

  const toolCueRegex =
    /(?:experience with|proficiency in|knowledge of|hands-on with|skills in|expertise in|background in|familiarity with|deep knowledge of|mastery of)\s+([A-Za-z0-9+#_/-]+(?:\s+[A-Za-z0-9+#_/-]+)*)/gi;

  for (const { text, section } of sectionLines) {
    const hasMustCue = MUST_CUES.test(text);
    const hasPrefCue = PREFERRED_CUES.test(text);
    if (section === 'must' || section === 'preferred' || hasMustCue || hasPrefCue) {
      let match;
      while ((match = toolCueRegex.exec(text)) !== null) {
        const candidatePhrase = match[1].trim();
        const candidateLower = candidatePhrase.toLowerCase();

        // Check if candidate is already matched or exists in taxonomy
        const alreadyMatched = Array.from(foundSkillsSet).some((s) => candidateLower.includes(s) || s.includes(candidateLower));
        if (!alreadyMatched && candidatePhrase.length > 2 && !unrecognizedPhrases.has(candidateLower)) {
          unrecognizedPhrases.add(candidateLower);
          unrecognizedRequirements.push({
            id: `unrec_${unrecognizedRequirements.length + 1}`,
            text: candidatePhrase,
            category: section === 'preferred' || hasPrefCue ? 'preferred' : 'must',
            confidence: spec.confidenceThresholds.unrecognizedTerm,
            sourceSentence: text,
            inTaxonomy: false,
          });
        }
      }
    }
  }

  if (unrecognizedRequirements.length > 0) {
    warnings.push(
      `${unrecognizedRequirements.length} unrecognized requirement(s) found in JD not cataloged in skills taxonomy: ${unrecognizedRequirements.map((r) => r.text).slice(0, 3).join(', ')}.`
    );
  }

  return {
    roleTitle,
    roleFamily,
    jdLevel,
    yearsRequired,
    confirmedRequirements: recognizedRequirements,
    unrecognizedRequirements,
    warnings,
  };
}

/**
 * User-Confirmation Workflow: Apply user edits (flip, delete, add) to confirmed requirements list
 */
export function applyRequirementUserEdits(
  current: ConfirmedRequirement[],
  edits: {
    flipIds?: string[];
    deleteIds?: string[];
    add?: { text: string; category: RequirementClass; sourceSentence?: string }[];
  }
): ConfirmedRequirement[] {
  const flipSet = new Set(edits.flipIds || []);
  const deleteSet = new Set(edits.deleteIds || []);

  const updated: ConfirmedRequirement[] = [];

  for (const req of current) {
    if (deleteSet.has(req.id)) {
      continue;
    }

    if (flipSet.has(req.id)) {
      const nextCategory: RequirementClass = req.category === 'must' ? 'preferred' : 'must';
      updated.push({
        ...req,
        category: nextCategory,
        confidence: 1.0, // User-confirmed items have 100% confidence
      });
    } else {
      updated.push({ ...req });
    }
  }

  if (edits.add) {
    for (const newItem of edits.add) {
      updated.push({
        id: `user_req_${Date.now()}_${newItem.text.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        text: newItem.text,
        category: newItem.category,
        confidence: 1.0, // User-confirmed items have 100% confidence
        sourceSentence: newItem.sourceSentence,
        inTaxonomy: true,
      });
    }
  }

  return updated;
}
