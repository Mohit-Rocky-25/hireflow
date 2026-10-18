// ============================================================
// HireFlow v3 — India Fresher Readiness Auditor (R5.3, P-5)
// Campus drive heuristics without penalties for missing optional items
// ============================================================

import { FresherCheckItem } from './types';
import { ExtractedEntities, IngestionDiagnostics } from '../ingestion/types';
import { CGPA_GUIDANCE, CAMPUS_DRIVE_BENCHMARKS } from '../../config/India-fresher';

export interface FresherInput {
  text: string;
  entities: ExtractedEntities;
  diagnostics: IngestionDiagnostics;
  sectionNames: string[];
}

/**
 * Evaluates Indian engineering fresher readiness across campus recruitment criteria.
 * Non-punitive: missing optional signals appear as "Consider adding", not score deductions.
 */
export function auditFresherReadiness(input: FresherInput): {
  checks: FresherCheckItem[];
  fresherScore: number;
} {
  const { text, entities, diagnostics, sectionNames } = input;
  const checks: FresherCheckItem[] = [];

  const lowerText = text.toLowerCase();
  const lowerSections = sectionNames.map((s) => s.toLowerCase());

  // 1. One-Page A4 Length Estimate (word count between 280 and 700 words)
  const isOnePage = diagnostics.totalWords >= 220 && diagnostics.totalWords <= 750;
  checks.push({
    id: 'one_page_fit',
    name: '1-Page A4 Resume Fit',
    status: isOnePage ? 'present' : 'consider_adding',
    valueSummary: `${diagnostics.totalWords} words (~${diagnostics.pageCount} page)`,
    heuristicNote: isOnePage
      ? 'Concise single-page format matches Indian campus placement guidelines.'
      : 'Indian freshers are strongly advised to keep resume to a crisp single page (under 700 words).',
    sourceNote: 'Campus Placement Heuristic: Indian IT & product recruiters skim fresher resumes in 10-15 seconds.',
  });

  // 2. Education Block with Degree, Branch, Institute & Year
  const hasDegree = entities.degrees.length > 0;
  const hasGradYear = entities.dates.some((d) => /\b202[0-9]\b/.test(d.raw));
  const hasEducation = lowerSections.some((s) => /education|academic/i.test(s)) && hasDegree;

  checks.push({
    id: 'education_block',
    name: 'B.Tech / Engineering Education Block',
    status: hasEducation ? 'present' : 'consider_adding',
    valueSummary: hasDegree ? entities.degrees[0].normalizedDegree : undefined,
    heuristicNote: hasEducation
      ? 'Clear degree, branch, and academic timeline detected.'
      : 'Ensure degree name (e.g. B.Tech Computer Science), institute, and expected pass-out year are prominent.',
    sourceNote: 'Tier-1/2/3 Engineering Campus Drives Standard: Degree and branch are primary eligibility filters.',
  });

  // 3. CGPA with Scale & Neutral Presentation Advice (R5.3)
  const cgpa = entities.cgpa;
  let cgpaNote = 'Consider adding your CGPA or final aggregate percentage with scale (e.g. 8.2/10).';
  let cgpaStatus: FresherCheckItem['status'] = 'consider_adding';

  if (cgpa) {
    cgpaStatus = 'present';
    if (!cgpa.isPercentage && cgpa.value >= CGPA_GUIDANCE.highlightThreshold) {
      cgpaNote = `Strong CGPA (${cgpa.value}/${cgpa.scale}); highlight prominently in your education header.`;
    } else if (!cgpa.isPercentage && cgpa.value < CGPA_GUIDANCE.standardThreshold) {
      cgpaNote = CGPA_GUIDANCE.belowCutoffAdvice;
    } else {
      cgpaNote = `Valid CGPA scale detected (${cgpa.raw}).`;
    }
  }

  checks.push({
    id: 'cgpa_scale',
    name: 'CGPA with Verified Scale',
    status: cgpaStatus,
    valueSummary: cgpa ? cgpa.raw : undefined,
    heuristicNote: cgpaNote,
    sourceNote: 'Neutral CGPA Policy: Lower CGPA is never penalized; guidance suggests leading with project achievements.',
  });

  // 4. 10th and 12th Board Details (Campus Drive Neutral Note)
  const hasTenth = entities.boards.some((b) => b.level === '10th') || /\b(?:10th|class x|sslc)\b/i.test(lowerText);
  const hasTwelfth = entities.boards.some((b) => b.level === '12th') || /\b(?:12th|class xii|hsc)\b/i.test(lowerText);
  const hasBoards = hasTenth || hasTwelfth;

  checks.push({
    id: 'schooling_boards',
    name: '10th & 12th Board Verification',
    status: hasBoards ? 'present' : 'consider_adding',
    valueSummary: entities.boards.map((b) => `${b.level} ${b.board}`).join(', ') || undefined,
    heuristicNote: hasBoards
      ? '10th/12th academic foundation details included.'
      : 'Optional for off-campus roles; many on-campus MNC drives (TCS, Infosys, Wipro) verify 10th/12th cutoff (typically >=60%).',
    sourceNote: CAMPUS_DRIVE_BENCHMARKS.tenthTwelfthRationale,
  });

  // 5. Technical Projects (At least 2 with tech stack & links)
  const hasProjectSec = lowerSections.some((s) => /project|academic/i.test(s));
  const projectLinkCount = entities.links.filter((l) => l.platform === 'github' || l.platform === 'other').length;
  const projectTechHeaders = (text.match(/technolog(?:ies|y):|\btech stack:|\btools used:/gi) || []).length;
  const projectCount = Math.max(projectTechHeaders, Math.max(0, projectLinkCount - 1));
  const projectsGood = hasProjectSec && (projectCount >= 2 || projectLinkCount >= 2);

  checks.push({
    id: 'project_portfolio',
    name: 'Technical Project Demonstrations',
    status: projectsGood ? 'present' : 'consider_adding',
    valueSummary: `${projectLinkCount} link(s) found`,
    heuristicNote: projectsGood
      ? 'Projects section with live repository/deployment links detected.'
      : 'Include at least two end-to-end projects with tech stack and GitHub repository links.',
    sourceNote: 'Fresher Hiring Core Signal: Deployed projects provide direct proof of technical ability.',
  });

  // 6. GitHub & Coding Profiles (LeetCode, HackerRank, CodeChef, Codeforces)
  const hasGithub = entities.links.some((l) => l.platform === 'github') || /github\.com/i.test(lowerText);
  const hasCodingProfile = entities.links.some((l) =>
    ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'geeksforgeeks'].includes(l.platform)
  ) || /leetcode|codeforces|codechef|hackerrank/i.test(lowerText);

  checks.push({
    id: 'coding_profiles',
    name: 'GitHub & Problem Solving Profiles',
    status: hasGithub && hasCodingProfile ? 'present' : 'consider_adding',
    valueSummary: hasGithub ? (hasCodingProfile ? 'GitHub + DSA Profile' : 'GitHub Only') : undefined,
    heuristicNote: hasGithub && hasCodingProfile
      ? 'Both open-source work (GitHub) and algorithmic problem-solving profiles confirmed.'
      : 'Adding a LeetCode, Codeforces, or HackerRank handle demonstrates verified DSA problem solving.',
    sourceNote: 'Campus Placement Heuristic: Coding handles enable screeners to verify hands-on coding capability.',
  });

  // 7. Internships or Technical Training
  const hasInternship = lowerSections.some((s) => /intern|training|experience/i.test(s));
  checks.push({
    id: 'internship_training',
    name: 'Internship or Industry Training',
    status: hasInternship ? 'present' : 'consider_adding',
    heuristicNote: hasInternship
      ? 'Practical industry internship or formal technical training present.'
      : 'Optional for freshers: If you lack internship experience, lead with high-complexity capstone projects.',
    sourceNote: 'Non-Punitive Rule: Freshers are not penalized for lack of corporate experience.',
  });

  // 8. Single-Column Layout & Parse Safety
  const isSingleCol = diagnostics.readingOrderConfidence === 'high';
  checks.push({
    id: 'layout_single_column',
    name: 'Single-Column Clean Layout',
    status: isSingleCol ? 'present' : 'consider_adding',
    valueSummary: `${diagnostics.readingOrderConfidence} confidence`,
    heuristicNote: isSingleCol
      ? 'Clean single-column structure ensures reliable parsing across ATS systems.'
      : 'Multi-column or complex graphics can disrupt text reading order in automated parsers.',
    sourceNote: 'Engineering Best Practice: Plain single-column layout maximizes parsing reliability.',
  });

  // Compute Fresher Score (0-100) based on verified present signals
  let score = 35;
  if (isOnePage) score += 10;
  if (hasEducation) score += 20;
  if (cgpa) score += 10;
  if (projectsGood) score += 15;
  if (hasGithub) score += 5;
  if (hasCodingProfile) score += 5;
  if (isSingleCol) score += 5;

  const fresherScore = Math.min(100, score);

  return {
    checks,
    fresherScore,
  };
}
