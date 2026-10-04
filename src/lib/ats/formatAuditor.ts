// ============================================================
// HireFlow ATS Engine — formatAuditor
// Pure TypeScript module to audit ATS format safety
// ============================================================

import { FormatRiskItem, ParsedResume } from './types';
import atsFormatRules from '../../data/ats/ats-format-rules.json';
import writingQualityData from '../../data/ats/writing-quality.json';

export function formatAuditor(resume: ParsedResume): FormatRiskItem[] {
  const risks: FormatRiskItem[] = [];
  const text = resume.rawText;
  const lower = text.toLowerCase();

  // 1. Text Density / Scanned PDF check
  if (resume.wordCount < 80) {
    risks.push({
      id: 'scanned_image_pdf',
      name: 'Extremely Low Text Density (Scanned / Image Risk)',
      severity: 'critical',
      description: 'The resume has fewer than 80 words. If this was a PDF, the parser may not be able to read rasterized or scanned image layers.',
      evidence: `Word count detected: ${resume.wordCount} words`,
    });
  }

  // 2. Missing Critical Sections
  if (!resume.sections.skills || resume.sections.skills.length === 0) {
    risks.push({
      id: 'missing_skills_section',
      name: 'Missing Dedicated Skills Section',
      severity: 'critical',
      description: 'No clear "Technical Skills" or "Skills" heading detected. ATS parsers rely on explicit headings to extract core competencies.',
    });
  }

  if (!resume.sections.experience || resume.sections.experience.length === 0) {
    risks.push({
      id: 'missing_experience_section',
      name: 'Missing Experience / Employment Section',
      severity: 'high',
      description: 'Could not find a structured "Experience" or "Work History" section with standard titles and dates.',
    });
  }

  if (!resume.sections.education || resume.sections.education.length === 0) {
    risks.push({
      id: 'missing_education_section',
      name: 'Missing Education Section',
      severity: 'high',
      description: 'No distinct "Education" section found. Many enterprise ATS systems automatically filter by degree or graduation year.',
    });
  }

  // 3. Contact Details
  if (!resume.contact.email) {
    risks.push({
      id: 'missing_email',
      name: 'Missing or Unparseable Email Address',
      severity: 'critical',
      description: 'Could not detect an email address. If an icon was used instead of text, older parsers fail to extract contact details.',
    });
  }

  if (!resume.contact.phone) {
    risks.push({
      id: 'missing_phone',
      name: 'Missing or Unparseable Phone Number',
      severity: 'medium',
      description: 'No phone number format was identified in the resume text.',
    });
  }

  // 4. Unusual / Antiquated Sections
  for (const unusual of atsFormatRules.unusualSectionNames) {
    if (lower.includes(unusual)) {
      risks.push({
        id: `unusual_section_${unusual.replace(/\s+/g, '_')}`,
        name: `Outdated Resume Section: "${unusual}"`,
        severity: 'medium',
        description: `Modern technical resumes should omit "${unusual}". It consumes valuable space without adding technical evaluation signals.`,
        evidence: `Detected mention: "${unusual}"`,
      });
    }
  }

  // 5. Buzzword Flags
  const flaggedBuzzwords = writingQualityData.buzzwordsToFlag.filter((bw) =>
    lower.includes(bw.toLowerCase())
  );
  if (flaggedBuzzwords.length > 0) {
    risks.push({
      id: 'unprofessional_buzzwords',
      name: 'Fluff / Buzzword Flags',
      severity: 'medium',
      description: `Resume includes clichéd buzzwords (${flaggedBuzzwords.slice(0, 3).join(', ')}). Recruiters prefer concrete technical verbs over subjective self-praise.`,
      evidence: flaggedBuzzwords.join(', '),
    });
  }

  // 6. Resume Length Audit
  if (resume.totalYearsEstimate <= 2 && resume.wordCount > 750) {
    risks.push({
      id: 'fresher_length_overflow',
      name: 'Resume Length Exceeds Single-Page Density for Early Career',
      severity: 'low',
      description: `Fresher and early-career profiles should strictly fit on 1 high-density page. Detected ~${resume.wordCount} words (~${resume.estimatedPages} pages).`,
      evidence: `${resume.wordCount} words`,
    });
  }

  // 7. Date Format Inconsistencies
  const hasSlashDates = /\b\d{1,2}\/\d{4}\b/.test(text);
  const hasMonthYearDates = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i.test(text);
  const hasYearOnlyDates = /\b20\d{2}\s*(?:-|–)\s*20\d{2}\b/.test(text);

  if ((hasSlashDates && hasMonthYearDates) || (hasMonthYearDates && hasYearOnlyDates && hasSlashDates)) {
    risks.push({
      id: 'inconsistent_date_format',
      name: 'Inconsistent Date Formatting Across Positions',
      severity: 'low',
      description: 'Multiple date styles (e.g. MM/YYYY vs "Month YYYY") detected. Use a uniform date format (e.g. "Jun 2022 - Present") throughout.',
    });
  }

  return risks;
}
