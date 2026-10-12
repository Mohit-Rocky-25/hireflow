// ============================================================
// Tailor Engine — Document Patcher (Stage 4.2 Rebuild)
// Deterministic line-based patching of accepted suggestions,
// skill additions, and context injections.
// ============================================================

import { TailorSuggestion } from './engine';

export interface PatchResult {
  liveTailoredResume: string;
  acceptedSkills: string[];
  modifiedBullets: Record<string, string>;
}

export function applyAcceptedSuggestions(
  originalResume: string,
  suggestions: TailorSuggestion[],
  suggestionStatus: Record<string, string>,
  editedTexts: Record<string, string>
): PatchResult {
  if (!originalResume) {
    return { liveTailoredResume: '', acceptedSkills: [], modifiedBullets: {} };
  }

  const acceptedSkills: string[] = [];
  const bulletReplacements: Record<string, string> = {};

  suggestions.forEach((s) => {
    if (suggestionStatus[s.id] === 'accepted') {
      if (s.type === 'skills') {
        const skill = s.skillToAdd || s.proposedText.match(/'([^']+)'/)?.[1] || s.proposedText;
        if (skill && !acceptedSkills.includes(skill.trim())) {
          acceptedSkills.push(skill.trim());
        }
      } else if (s.originalText) {
        const rep = editedTexts[s.id] || s.proposedText;
        const cleanOrig = s.originalText.replace(/^[-•*●▪‣]\s*/, '').trim();
        bulletReplacements[cleanOrig] = rep;
      }
    }
  });

  // Patch lines of raw text cleanly
  const lines = originalResume.split('\n');
  let skillsLineIndex = -1;

  const patchedLines = lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Detect Skills section line to append skills if needed
    if (/(?:technical skills|skills & tools|skills|technologies)\s*[:]/i.test(trimmed)) {
      skillsLineIndex = idx;
    }

    // Check bullet replacement
    const cleanLine = trimmed.replace(/^[-•*●▪‣]\s*/, '').trim();
    if (bulletReplacements[cleanLine]) {
      const rep = bulletReplacements[cleanLine];
      const bulletPrefix = line.match(/^(\s*[-•*●▪‣]\s*)/)?.[1] || '- ';
      const cleanRep = rep.replace(/^[-•*●▪‣]\s*/, '').trim();
      return `${bulletPrefix}${cleanRep}`;
    }

    return line;
  });

  // If skills were accepted, update or insert into raw text
  if (acceptedSkills.length > 0) {
    if (skillsLineIndex >= 0) {
      const currentSkillsLine = patchedLines[skillsLineIndex];
      const lower = currentSkillsLine.toLowerCase();
      const skillsToAppend = acceptedSkills.filter((s) => !lower.includes(s.toLowerCase()));
      if (skillsToAppend.length > 0) {
        patchedLines[skillsLineIndex] = `${currentSkillsLine}, ${skillsToAppend.join(', ')}`;
      }
    } else {
      // Append a clean SKILLS: section
      patchedLines.push(`\nSKILLS:\n${acceptedSkills.join(', ')}`);
    }
  }

  return {
    liveTailoredResume: patchedLines.join('\n'),
    acceptedSkills,
    modifiedBullets: bulletReplacements
  };
}
