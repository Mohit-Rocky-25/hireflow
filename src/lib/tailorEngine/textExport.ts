// ============================================================
// Tailor Engine — Plain Text (.txt) Exporter
// Strictly clean, ATS-pasteable plaintext format with zero
// diff markers, zero placeholders, and standard delimiters.
// ============================================================

import { ResumeDocModel } from './docModel';

const cleanBullet = (text: string) => text.replace(/^[-•*●▪‣]\s*/, '').trim();

/**
 * Converts a ResumeDocModel into clean, professional plain text.
 */
export function generatePlainText(model: ResumeDocModel): string {
  const sections: string[] = [];

  // Name & Contact
  const name = (model.contact.name || 'Candidate Name').toUpperCase();
  const contactParts: string[] = [];
  if (model.contact.email) contactParts.push(model.contact.email);
  if (model.contact.phone) contactParts.push(model.contact.phone);
  if (model.contact.location) contactParts.push(model.contact.location);
  if (model.contact.headline) contactParts.push(model.contact.headline);
  if (model.contact.links && model.contact.links.length > 0) {
    contactParts.push(...model.contact.links);
  }

  sections.push(`${name}\n${contactParts.join(' | ')}`);

  // Summary
  if (model.summary) {
    sections.push(`PROFESSIONAL SUMMARY\n${model.summary.trim()}`);
  }

  // Education
  if (model.education && model.education.length > 0) {
    const eduLines = model.education.map((edu) => {
      const parts = [edu.degree];
      if (edu.details) parts.push(edu.details);
      if (edu.institution) parts.push(`— ${edu.institution}`);
      if (edu.year) parts.push(`(${edu.year})`);
      return `• ${parts.join(', ')}`;
    });
    sections.push(`EDUCATION\n${eduLines.join('\n')}`);
  }

  // Technical Skills
  if (model.skills && model.skills.length > 0) {
    if (model.skillCategories && model.skillCategories.length > 0) {
      const skillLines = model.skillCategories.map(
        (g) => `${g.category}: ${g.skills.join(', ')}`
      );
      sections.push(`TECHNICAL SKILLS\n${skillLines.join('\n')}`);
    } else {
      sections.push(`TECHNICAL SKILLS\n${model.skills.join(', ')}`);
    }
  }

  // Projects
  if (model.projects && model.projects.length > 0) {
    const projBlocks = model.projects.map((p) => {
      const header = `${p.name}${p.date ? ` (${p.date})` : ''}`;
      const tools = p.linkOrTech ? `Tools: ${p.linkOrTech}` : '';
      const bullets = p.bullets.map((b) => `• ${cleanBullet(b.text)}`);
      return [header, tools, ...bullets].filter(Boolean).join('\n');
    });
    sections.push(`PROJECTS\n${projBlocks.join('\n\n')}`);
  }

  // Experience
  if (model.experience && model.experience.length > 0) {
    const expBlocks = model.experience.map((e) => {
      const header = `${e.role}${e.company ? ` — ${e.company}` : ''}${e.dates ? ` (${e.dates})` : ''}`;
      const bullets = e.bullets.map((b) => `• ${cleanBullet(b.text)}`);
      return [header, ...bullets].join('\n');
    });
    sections.push(`WORK EXPERIENCE\n${expBlocks.join('\n\n')}`);
  }

  // Achievements
  if (model.achievements && model.achievements.length > 0) {
    const achLines = model.achievements.map((a) => `• ${cleanBullet(a)}`);
    sections.push(`ACHIEVEMENTS\n${achLines.join('\n')}`);
  }

  // Certifications
  if (model.certifications && model.certifications.length > 0) {
    const certLines = model.certifications.map((c) => `• ${cleanBullet(c)}`);
    sections.push(`CERTIFICATIONS & LEARNING\n${certLines.join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * Creates a downloadable Blob containing the plain-text resume.
 */
export function generatePlainTextBlob(model: ResumeDocModel): Blob {
  const text = generatePlainText(model);
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}
