import { CanonicalResume } from '../schema';
import { ATS_DESIGN_TOKENS, DesignTokens } from '../tokens';

export interface LayoutSection {
  key: string;
  title: string;
  lines: string[];
}

export interface LayoutTree {
  header: {
    name: string;
    title?: string;
    contactLines: string[];
  };
  sections: LayoutSection[];
  tokens: DesignTokens;
  estimatedPages: number;
  isOverflown: boolean;
  appliedFitAdjustments: string[];
}

export function buildLayoutTree(
  resume: CanonicalResume,
  preset: 'fresher' | 'experienced' = 'fresher',
  customTokens: DesignTokens = ATS_DESIGN_TOKENS
): LayoutTree {
  const tokens = { ...customTokens };
  const appliedFitAdjustments: string[] = [];

  // 1. Balanced Header Wrapping
  const contactParts: string[] = [];
  if (resume.header.email) contactParts.push(resume.header.email);
  if (resume.header.phone) contactParts.push(resume.header.phone);
  if (resume.header.location) contactParts.push(resume.header.location);
  if (resume.header.links) {
    for (const l of resume.header.links) {
      contactParts.push(l.url);
    }
  }

  const contactLines = balanceContactLine(contactParts);

  // 2. Determine Section Order
  const isExperienced =
    preset === 'experienced' ||
    (resume.experience.length >= 2 && resume.experience.some((e) => e.bullets.length >= 2));

  const sectionOrder = isExperienced
    ? ['summary', 'experience', 'skills', 'projects', 'achievements', 'leadership', 'certifications', 'education']
    : ['summary', 'education', 'skills', 'projects', 'achievements', 'leadership', 'certifications', 'experience'];

  // 3. Assemble Sections (Omit any empty section)
  const sections: LayoutSection[] = [];

  for (const secKey of sectionOrder) {
    switch (secKey) {
      case 'summary': {
        if (resume.summary && resume.summary.trim()) {
          sections.push({
            key: 'summary',
            title: 'Professional Summary',
            lines: [resume.summary.trim()]
          });
        }
        break;
      }

      case 'education': {
        if (resume.education.length > 0) {
          sections.push({
            key: 'education',
            title: 'Education',
            lines: resume.education.map(
              (e) => `${e.degree} — ${e.institution}${e.end ? ` (${e.end})` : ''}${e.gpa ? ` | GPA: ${e.gpa}` : ''}`
            )
          });
        }
        break;
      }

      case 'skills': {
        if (resume.skills.groups.length > 0) {
          sections.push({
            key: 'skills',
            title: 'Technical Skills',
            lines: resume.skills.groups.map((g) => `${g.label}: ${g.items.join(', ')}`)
          });
        }
        break;
      }

      case 'projects': {
        if (resume.projects.length > 0) {
          const lines: string[] = [];
          for (const p of resume.projects) {
            lines.push(`${p.name}${p.date ? ` | ${p.date}` : ''}`);
            if (p.stack && p.stack.length > 0) {
              lines.push(`Tools: ${p.stack.join(', ')}`);
            }
            for (const b of p.bullets) {
              lines.push(`• ${b}`);
            }
          }
          sections.push({
            key: 'projects',
            title: 'Key Projects',
            lines
          });
        }
        break;
      }

      case 'experience': {
        if (resume.experience.length > 0) {
          const lines: string[] = [];
          for (const e of resume.experience) {
            lines.push(`${e.role} — ${e.org}${e.location ? `, ${e.location}` : ''}${e.end ? ` (${e.start ? `${e.start} – ` : ''}${e.end})` : ''}`);
            for (const b of e.bullets) {
              lines.push(`• ${b}`);
            }
          }
          sections.push({
            key: 'experience',
            title: 'Work Experience',
            lines
          });
        }
        break;
      }

      case 'leadership': {
        if (resume.leadership.length > 0) {
          const lines: string[] = [];
          for (const l of resume.leadership) {
            lines.push(`${l.role} — ${l.org}${l.end ? ` (${l.start ? `${l.start} – ` : ''}${l.end})` : ''}`);
            for (const b of l.bullets) {
              lines.push(`• ${b}`);
            }
          }
          sections.push({
            key: 'leadership',
            title: 'Leadership & Involvement',
            lines
          });
        }
        break;
      }

      case 'certifications': {
        if (resume.certifications.length > 0) {
          const completed = resume.certifications.filter((c) => c.status === 'completed');
          const inProgress = resume.certifications.filter((c) => c.status === 'in_progress');
          const practice = resume.certifications.filter((c) => c.status === 'practice' || (c.status as string) === 'coursework');

          const lines: string[] = [];
          if (completed.length > 0) {
            lines.push('Completed:');
            for (const c of completed) {
              lines.push(`• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}`);
            }
          }
          if (inProgress.length > 0) {
            lines.push('In Progress:');
            for (const c of inProgress) {
              lines.push(`• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}`);
            }
          }
          if (practice.length > 0) {
            lines.push('Self-Directed Practice:');
            for (const c of practice) {
              lines.push(`• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}`);
            }
          }

          sections.push({
            key: 'certifications',
            title: 'CERTIFICATIONS & LEARNING',
            lines
          });
        }
        break;
      }

      case 'achievements': {
        if (resume.achievements.length > 0) {
          const lines: string[] = [];
          for (const a of resume.achievements) {
            lines.push(`${a.title}${a.date ? ` | ${a.date}` : ''}`);
            if (a.bullets && a.bullets.length > 0) {
              for (const b of a.bullets) {
                lines.push(`• ${b}`);
              }
            }
          }
          sections.push({
            key: 'achievements',
            title: 'Achievements',
            lines
          });
        }
        break;
      }
    }
  }

  // 4. Page-Fit Measurement Loop
  // Estimate content height based on line count and section headings
  const totalContentLines = sections.reduce((acc, s) => acc + s.lines.length + 2, 0) + contactLines.length + 2;
  const PAGE_CAPACITY_LINES = 48; // Standard 10pt with 1.35 line-height on 11in page with 0.6in margins

  let estimatedPages = 1;
  let isOverflown = false;

  if (totalContentLines > PAGE_CAPACITY_LINES) {
    if (totalContentLines <= PAGE_CAPACITY_LINES * 1.25) {
      // Step 1: Compress section spacing and body font to 9.5pt to achieve 1-page fit
      appliedFitAdjustments.push('Reduced section spacing from 10pt to 6pt');
      appliedFitAdjustments.push('Adjusted body font size to 9.5pt');
      tokens.spacing.section = '6pt';
      tokens.fontSizes.body = '9.5pt';
      estimatedPages = 1;
    } else {
      estimatedPages = 2;
      isOverflown = true;
    }
  }

  return {
    header: {
      name: resume.header.name,
      title: resume.header.title,
      contactLines
    },
    sections,
    tokens,
    estimatedPages,
    isOverflown,
    appliedFitAdjustments
  };
}

/**
 * Balances header contact items to avoid solitary orphan items on line 2 (Defect 6).
 */
export function balanceContactLine(items: string[]): string[] {
  if (items.length <= 4) {
    return [items.join('  |  ')];
  }

  // If 5 or more items, split evenly into 2 balanced lines
  const mid = Math.ceil(items.length / 2);
  const line1 = items.slice(0, mid).join('  |  ');
  const line2 = items.slice(mid).join('  |  ');

  return [line1, line2];
}
