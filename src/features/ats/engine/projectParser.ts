// ============================================================
// ATS Resume Roaster — Project Parser (Stage 3)
// Parses projects section into title, bullets, tech stack, and URLs
// ============================================================

import { ParsedSection, ProjectEntry } from './types';
import { analyzeBullet } from './bulletAnalyzer';

const URL_REGEX = /https?:\/\/[^\s)]+|github\.com\/[^\s)]+/i;

export function parseProjectSection(projectSection?: ParsedSection): ProjectEntry[] {
  if (!projectSection || !projectSection.content.trim()) {
    return [];
  }

  const lines = projectSection.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projects: ProjectEntry[] = [];

  let currentTitle = '';
  let currentUrl: string | undefined = undefined;
  let currentTechStack: string[] = [];
  let currentBullets: string[] = [];
  let entryStart = projectSection.charStart;

  function commitProject() {
    if (currentTitle || currentBullets.length > 0) {
      const analyzedBullets = currentBullets.map(b => analyzeBullet(b));
      projects.push({
        title: currentTitle || 'Technical Project',
        url: currentUrl,
        bullets: analyzedBullets,
        techStack: currentTechStack,
        charStart: entryStart,
        charEnd: entryStart + currentBullets.join('\n').length,
      });
    }
    currentTitle = '';
    currentUrl = undefined;
    currentTechStack = [];
    currentBullets = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[*\-•▪●\d.]+\s+/.test(line);

    if (!isBullet && line.length < 90 && (lines[i + 1]?.startsWith('-') || lines[i + 1]?.startsWith('•') || lines[i + 1]?.startsWith('*') || lines[i + 1]?.toLowerCase().includes('technologies:') || lines[i + 1]?.toLowerCase().includes('tech stack:'))) {
      commitProject();
      // Line is project title, possibly with URL or stack: "Project Name | React, Node.js | https://github.com/..."
      const urlMatch = line.match(URL_REGEX);
      if (urlMatch) {
        currentUrl = urlMatch[0];
      }

      const parts = line.split(/[|•–—]\s+/).map(p => p.trim());
      currentTitle = parts[0].replace(URL_REGEX, '').trim();

      if (parts.length > 1) {
        for (let j = 1; j < parts.length; j++) {
          if (!parts[j].includes('http') && parts[j].includes(',')) {
            currentTechStack = parts[j].split(',').map(s => s.trim());
          }
        }
      }
    } else if (line.toLowerCase().startsWith('tech stack:') || line.toLowerCase().startsWith('technologies:')) {
      const stackStr = line.split(':')[1] || '';
      currentTechStack = stackStr.split(',').map(s => s.trim()).filter(Boolean);
    } else if (isBullet) {
      currentBullets.push(line);
    } else {
      currentBullets.push(line);
    }
  }

  commitProject();
  return projects;
}
