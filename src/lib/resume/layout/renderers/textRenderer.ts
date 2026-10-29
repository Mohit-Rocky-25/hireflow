// ============================================================
// HIREFLOW ATS PLAIN TEXT & MARKDOWN RENDERER (STAGE 6)
// Converts LayoutDocument or ResumeDocumentTree into clean ATS text & Markdown.
// Feeds round-trip parsers and verifies text parity with PDF.
// ============================================================

import { LayoutDocument } from '../types';
import { ResumeDocumentTree } from '../../types';

export function renderLayoutToPlainText(layout: LayoutDocument): string {
  const lines: string[] = [];

  for (const page of layout.pages) {
    for (const block of page.blocks) {
      if (block.text) {
        if (block.type === 'section-heading') {
          lines.push(`\n=== ${block.text} ===`);
        } else if (block.type === 'bullet') {
          lines.push(`  ${block.text}`);
        } else {
          lines.push(block.text);
        }
      }
    }
  }

  return lines.join('\n').trim();
}

export function renderTreeToMarkdown(tree: ResumeDocumentTree): string {
  const md: string[] = [];

  // Header
  md.push(`# ${tree.candidate.fullName}`);
  const contact = [
    tree.candidate.email,
    tree.candidate.phone,
    tree.candidate.location,
    tree.candidate.linkedin,
    tree.candidate.github,
  ].filter(Boolean).join(' | ');
  if (contact) md.push(`*${contact}*\n`);

  for (const section of tree.sections) {
    if (!section.visible) continue;
    md.push(`\n## ${section.title}\n`);

    if (section.summaryText) {
      md.push(`${section.summaryText}\n`);
    }

    if (section.skillsByCategory) {
      for (const [cat, skills] of Object.entries(section.skillsByCategory)) {
        md.push(`- **${cat}:** ${skills.join(', ')}`);
      }
    }

    for (const entry of section.entries) {
      const dates = entry.dates ? ` (${entry.dates})` : '';
      const sub = entry.subtitle ? ` — ${entry.subtitle}` : '';
      md.push(`\n### ${entry.title}${sub}${dates}`);

      for (const bullet of entry.bullets) {
        md.push(`- ${bullet.text}`);
      }
    }
  }

  return md.join('\n').trim();
}

