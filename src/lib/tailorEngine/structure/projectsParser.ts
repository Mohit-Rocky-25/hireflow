// ============================================================
// Tailor Engine — Projects Parser
// Handles both structured multi-line and flattened single-line projects
// Splits project entries, extracts tech stack, formats action bullets
// ============================================================

import { RecoveredProject } from './types';

const TECH_CLAUSE_REGEX = /(?:using|built with|developed with|leveraging)\s+([a-zA-Z0-9,\s&/+]+?)(?:\.|$)/i;

export function parseProjectsSection(content: string): RecoveredProject[] {
  if (!content || !content.trim()) return [];

  const raw = content.trim();
  const projects: RecoveredProject[] = [];

  // Strategy A: Multi-line structured projects (Title followed by bullets)
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    let current: RecoveredProject | null = null;
    let foundStructuredBullets = false;

    for (const line of lines) {
      const isBullet = /^[-•*●▪‣]\s*/.test(line);

      if (isBullet) {
        foundStructuredBullets = true;
        const cleanBullet = line.replace(/^[-•*●▪‣]\s*/, '').trim();
        if (!current) {
          current = { name: 'Project', techStack: [], bullets: [], rawLines: [] };
          projects.push(current);
        }
        current.bullets.push(cleanBullet);
        current.rawLines.push(line);

        const techMatch = cleanBullet.match(TECH_CLAUSE_REGEX);
        if (techMatch) {
          const rawTech = techMatch[1]
            .replace(/\band\b/gi, ',')
            .split(/[,/|]/)
            .map((t) => t.trim())
            .filter(Boolean);
          current.techStack.push(...rawTech);
        }
      } else {
        const parts = line.split('|').map((p) => p.trim());
        let name = parts[0];
        let techClause = parts[1] || '';

        if (parts.length === 1 && line.includes(' : ')) {
          const colonParts = line.split(' : ');
          name = colonParts[0].trim();
          techClause = colonParts[1].trim();
        }

        const techStack: string[] = [];
        if (techClause) {
          const parsed = techClause
            .replace(/\band\b/gi, ',')
            .split(/[,/|]/)
            .map((t) => t.trim())
            .filter(Boolean);
          techStack.push(...parsed);
        }

        current = {
          name,
          techStack,
          bullets: [],
          rawLines: [line]
        };
        projects.push(current);
      }
    }

    if (foundStructuredBullets && projects.length > 0) {
      return projects;
    }
  }

  // Strategy B: Flattened or inline projects (e.g. "- LocalPro : ... - UniSync : ...")
  const chunks = raw
    .split(/(?:^|\s+)[-•*●▪‣]\s+/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    let name = 'Project';
    let description = chunk;
    const techStack: string[] = [];

    const sepMatch = chunk.match(/^([A-Za-z0-9_\s]{2,30})\s*[:–—]\s*(.*)$/);
    if (sepMatch) {
      name = sepMatch[1].trim();
      description = sepMatch[2].trim();
    } else {
      const firstLine = chunk.split('\n')[0] || '';
      const parts = firstLine.split('|');
      if (parts.length > 1) {
        name = parts[0].trim();
        description = chunk.substring(firstLine.length).trim();
      }
    }

    const techMatch = description.match(TECH_CLAUSE_REGEX);
    if (techMatch) {
      const rawTech = techMatch[1];
      const parsedTech = rawTech
        .replace(/\band\b/gi, ',')
        .split(/[,/|]/)
        .map((t) => t.trim())
        .filter(Boolean);
      techStack.push(...parsedTech);
      description = description.replace(techMatch[0], '.').replace(/\.{2,}/g, '.').trim();
    }

    const bullets: string[] = [];
    if (description) {
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
