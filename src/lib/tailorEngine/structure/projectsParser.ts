// ============================================================
// Tailor Engine — Projects Parser
// Splits project entries, extracts tech stack, formats action bullets
// ============================================================

import { RecoveredProject } from './types';

const TECH_CLAUSE_REGEX = /(?:using|built with|developed with|leveraging)\s+([a-zA-Z0-9,\s&/+]+?)(?:\.|$)/i;

export function parseProjectsSection(content: string): RecoveredProject[] {
  if (!content || !content.trim()) return [];

  const raw = content.trim();

  // Split projects on bullet markers or " - Name :" / "\n- "
  // Handle flattened strings: "- LocalPro : ... - UniSync : ... - SafeRide : ..."
  const chunks = raw
    .split(/(?:^|\s+)[-•*]\s+/)
    .map((c) => c.trim())
    .filter(Boolean);

  const projects: RecoveredProject[] = [];

  for (const chunk of chunks) {
    let name = 'Project';
    let description = chunk;
    const techStack: string[] = [];

    // 1. Split on "Name : Description" or "Name - Description"
    const sepMatch = chunk.match(/^([A-Za-z0-9_\s]{2,30})\s*[:–—]\s*(.*)$/);
    if (sepMatch) {
      name = sepMatch[1].trim();
      description = sepMatch[2].trim();
    } else {
      // Check first 1-3 words before punctuation
      const firstLine = chunk.split('\n')[0] || '';
      const parts = firstLine.split('|');
      if (parts.length > 1) {
        name = parts[0].trim();
        description = chunk.substring(firstLine.length).trim();
      }
    }

    // 2. Extract tech stack clause ("using HTML, CSS, JavaScript, and Firebase.")
    const techMatch = description.match(TECH_CLAUSE_REGEX);
    if (techMatch) {
      const rawTech = techMatch[1];
      const parsedTech = rawTech
        .replace(/\band\b/gi, ',')
        .split(/[,/|]/)
        .map((t) => t.trim())
        .filter(Boolean);

      techStack.push(...parsedTech);

      // Clean the description bullet if it ends with "using ..."
      // Keep description punchy
      description = description.replace(techMatch[0], '.').replace(/\.{2,}/g, '.').trim();
    }

    // Format description as clean bullet(s)
    const bullets: string[] = [];
    if (description) {
      // If description contains multiple clauses separated by periods or semicolons, split
      const sentences = description.split(/\.\s+/).filter(Boolean);
      for (const s of sentences) {
        const cleanS = s.trim().replace(/^\W+/, '').replace(/[.]+$/, '');
        if (cleanS.length > 10) {
          bullets.push(cleanS + '.');
        }
      }
      if (bullets.length === 0) {
        bullets.push(description.endsWith('.') ? description : description + '.');
      }
    }

    projects.push({
      name,
      techStack,
      bullets,
      rawLines: [chunk]
    });
  }

  return projects;
}
