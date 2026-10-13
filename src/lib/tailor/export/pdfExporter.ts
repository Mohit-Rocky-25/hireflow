// ============================================================
// HIREFLOW PDF & PLAIN TEXT EXPORTER
// Triggers clean vector print to PDF and plain-text export
// ============================================================

import { TailoredResume, CandidateProfile } from '../types';

/**
 * Triggers browser print dialog styled specifically for ATS resume printing
 */
export function triggerPrintToPdf(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Generates an ATS-compliant clean plain text representation
 */
export function generatePlainTextResume(
  resume: TailoredResume,
  candidate: CandidateProfile
): string {
  const lines: string[] = [];

  // Header
  lines.push(candidate.fullName.toUpperCase());
  const contactParts: string[] = [];
  if (candidate.contact.email) contactParts.push(candidate.contact.email);
  if (candidate.contact.phone) contactParts.push(candidate.contact.phone);
  if (candidate.contact.location) contactParts.push(candidate.contact.location);
  if (candidate.contact.linkedin) contactParts.push(candidate.contact.linkedin);
  if (candidate.contact.github) contactParts.push(candidate.contact.github);
  lines.push(contactParts.join(' | '));
  lines.push('--------------------------------------------------\n');

  // Sections
  for (const section of resume.sections) {
    if (!section.visible) continue;

    lines.push(section.title.toUpperCase());
    lines.push('==================================================');

    if (section.content.summaryText) {
      lines.push(section.content.summaryText);
      lines.push('');
    }

    if (section.content.skillsByCategory) {
      for (const [cat, skills] of Object.entries(section.content.skillsByCategory)) {
        if (skills.length > 0) {
          lines.push(`${cat}: ${skills.join(', ')}`);
        }
      }
      lines.push('');
    }

    if (section.content.entries) {
      for (const entry of section.content.entries) {
        lines.push(`${entry.primaryTitle}${entry.secondaryTitle ? ` - ${entry.secondaryTitle}` : ''}${entry.dateRange ? ` (${entry.dateRange})` : ''}`);
        if (entry.location) lines.push(entry.location);
        if (entry.bullets) {
          for (const b of entry.bullets) {
            lines.push(`* ${b.text}`);
          }
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Downloads resume as .txt file
 */
export function downloadResumeAsTxt(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): void {
  const text = generatePlainTextResume(resume, candidate);
  const name = fileName || `${candidate.fullName.replace(/\s+/g, '_')}_Resume.txt`;

  if (typeof window !== 'undefined') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
