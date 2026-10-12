import { CanonicalResume, Suggestion } from '../schema';
import { LayoutTree } from '../layout';

export interface ValidationReport {
  isValid: boolean;
  qualityScore: number;
  scoreBreakdown: {
    impact: number;
    brevity: number;
    style: number;
    atsReadability: number;
  };
  errors: string[];
  warnings: string[];
  suggestions: Suggestion[];
}

export function validateResume(resume: CanonicalResume, layout: LayoutTree): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: Suggestion[] = [];

  // 1. Header Validation
  if (!resume.header.name || resume.header.name === 'Candidate Name') {
    errors.push('Candidate name is missing or placeholder.');
  }
  if (!resume.header.email || !resume.header.email.includes('@')) {
    errors.push('Valid email address is required.');
  }

  // 2. Summary Validation
  if (resume.summary) {
    const wordCount = resume.summary.split(/\s+/).length;
    if (wordCount > 70) {
      warnings.push(`Summary is lengthy (${wordCount} words). Recruiter standard is under 60 words.`);
      suggestions.push({
        id: 'sug-summary-length',
        severity: 'warn',
        message: 'Condense professional summary to 2-3 lines (under 60 words) for faster scanning.',
        targetSection: 'summary'
      });
    }
  }

  // 3. Education Validation
  for (let i = 0; i < resume.education.length; i++) {
    const edu = resume.education[i];
    const hasDates = Boolean(edu.end || edu.start);
    if (!hasDates) {
      warnings.push(`ATS lint warning: Education entry for "${edu.degree}" has no dates.`);
    }

    const missingFields: string[] = [];
    if (!edu.start) missingFields.push('start');
    if (!edu.end) missingFields.push('end');
    if (edu.expected === undefined) missingFields.push('expected');
    if (!edu.gpa) missingFields.push('gpa');

    if (missingFields.length > 0) {
      suggestions.push({
        id: `sug-edu-completeness-${i}`,
        severity: 'warn',
        message: 'Add expected graduation year and CGPA',
        targetSection: 'education',
        targetIndex: i,
        suggestedAction: 'open_input_fields',
        fixAction: {
          type: 'open_input_fields',
          fields: missingFields
        }
      });
    }
  }

  // 4. Bullets & Action Verbs & Metrics
  let totalBullets = 0;
  let quantifiedBullets = 0;
  const allBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
    ...resume.leadership.flatMap((l) => l.bullets)
  ];

  for (const b of allBullets) {
    totalBullets++;
    if (/\b(?:\d+%|\$\d+|\d+\+|\d+k|\d+M|\b\d{2,}\b)/.test(b)) {
      quantifiedBullets++;
    }
  }

  if (totalBullets > 0 && quantifiedBullets / totalBullets < 0.3) {
    suggestions.push({
      id: 'sug-quantified-metrics',
      severity: 'info',
      message: 'Consider adding verifiable metrics (e.g. latency reduced, user counts, team size) to key bullets.',
      targetSection: 'experience'
    });
  }

  // 5. Skills Groups Check
  for (const group of resume.skills.groups) {
    if (group.items.length < 2) {
      warnings.push(`Skill category "${group.label}" contains only 1 item.`);
    }
  }

  // 6. Quality Score Calculation (0 - 100)
  const impact = totalBullets > 0 ? Math.min(25, Math.round((quantifiedBullets / totalBullets) * 25) + 12) : 15;
  const brevity = resume.summary && resume.summary.split(/\s+/).length > 70 ? 18 : 25;
  const style = warnings.length === 0 ? 25 : Math.max(15, 25 - warnings.length * 3);
  const atsReadability = errors.length === 0 ? 25 : Math.max(0, 25 - errors.length * 10);
  const qualityScore = impact + brevity + style + atsReadability;

  return {
    isValid: errors.length === 0,
    qualityScore,
    scoreBreakdown: { impact, brevity, style, atsReadability },
    errors,
    warnings,
    suggestions
  };
}
