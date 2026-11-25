// ============================================================
// ATS Resume Roaster — Enhanced Project Parser (Stage 3/4 / Phase 10.2)
// Parses projects section into structured project entries with
// origin classification, maturity detection, multi-section support, and true document-relative locators.
// ============================================================

import { ParsedSection, ProjectEntry } from './types';
import { analyzeBullet } from './bulletAnalyzer';
import {
  ProjectOrigin,
  EnvironmentMaturity,
  StructuredProjectEntry,
} from './evidenceModel';
import { SourceLocator, buildLineOffsets, offsetToLineNumber } from './sourceLocator';

const URL_REGEX = /https?:\/\/[^\s)]+|github\.com\/[^\s)]+/i;
const DATE_REGEX = /\b(?:20\d{2}|19\d{2})\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:20\d{2}|19\d{2})/i;

export interface ParsedProjectItem extends ProjectEntry, StructuredProjectEntry {}

interface IndexedLine {
  text: string;
  docStart: number;
  docEnd: number;
}

/**
 * Classifies project origin from title, description, and surrounding context.
 */
export function classifyProjectOrigin(title: string, context: string = ''): ProjectOrigin {
  const combined = `${title} ${context}`.toLowerCase();

  if (/\b(?:hackathon|hack[a-z0-9_-]*|prize winner|devpost)\b/i.test(combined)) {
    return 'HACKATHON_PROJECT';
  }
  if (/\b(?:academic|thesis|capstone|coursework|university|final year)\b/.test(combined)) {
    return 'ACADEMIC_PROJECT';
  }
  if (/\b(?:open source|oss|contributor|pull request|github open source)\b/.test(combined)) {
    return 'OPEN_SOURCE_PROJECT';
  }
  if (/\b(?:client project|consulting project|freelance)\b/.test(combined)) {
    return 'CLIENT_PROJECT';
  }
  if (/\b(?:internal tool|enterprise system|company tool)\b/.test(combined)) {
    return 'EMPLOYER_INTERNAL_PROJECT';
  }
  if (/\b(?:research project|lab project|paper)\b/.test(combined)) {
    return 'RESEARCH_PROJECT';
  }
  if (/\b(?:personal|side project|hobby|prototype|self-built)\b/.test(combined)) {
    return 'PERSONAL_PROJECT';
  }

  return 'PERSONAL_PROJECT';
}

/**
 * Detects whether the project achieved demonstrable production scale
 * or remains a prototype/development build.
 */
export function detectProjectMaturity(bullets: string[], origin: ProjectOrigin): EnvironmentMaturity {
  const combined = bullets.join(' ').toLowerCase();

  if (origin === 'ACADEMIC_PROJECT') {
    return 'COURSEWORK_ENVIRONMENT';
  }
  if (origin === 'RESEARCH_PROJECT') {
    return 'RESEARCH_ENVIRONMENT';
  }

  const hasLiveProductionScale =
    /\b(?:\d+k\+? active users|\d+k\+? requests|live in production|deployed to production|paying customers|sla\b)\b/i.test(
      combined
    );

  if (hasLiveProductionScale) {
    return 'PRODUCTION';
  }

  return 'PROTOTYPE';
}

function buildIndexedLines(section: ParsedSection, resumeText?: string): IndexedLine[] {
  const rawLines = section.content.split(/\r?\n/);
  const result: IndexedLine[] = [];
  let searchCursor = Math.max(0, section.charStart);
  let localOffset = 0;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    const step = rawLine.length + 1;
    if (!trimmed) {
      localOffset += step;
      continue;
    }

    let docStart = -1;
    let docEnd = -1;

    if (resumeText) {
      const idx = resumeText.indexOf(trimmed, Math.max(0, searchCursor - 16));
      if (idx !== -1 && idx <= Math.max(section.charEnd, searchCursor + trimmed.length + 250)) {
        docStart = idx;
        docEnd = idx + trimmed.length;
        searchCursor = docEnd;
      }
    }

    if (docStart === -1) {
      const titleOffset = section.rawTitle ? section.rawTitle.length + 1 : 0;
      const base = section.charStart + (resumeText ? 0 : titleOffset);
      docStart = base + localOffset;
      docEnd = docStart + trimmed.length;
    }

    result.push({ text: trimmed, docStart, docEnd });
    localOffset += step;
  }

  return result;
}

/**
 * Enhanced project parser with structured origin and true document-relative source locators.
 * Accepts either a single ParsedSection or an array of duplicate/split project sections.
 */
export function parseProjectSection(
  projectSection?: ParsedSection | ParsedSection[],
  options?: { documentId?: string; resumeText?: string }
): ParsedProjectItem[] {
  if (!projectSection) return [];
  const sectionList = Array.isArray(projectSection) ? projectSection : [projectSection];
  const projects: ParsedProjectItem[] = [];
  const docLineOffsets = options?.resumeText ? buildLineOffsets(options.resumeText) : null;
  let projectCount = 0;

  for (const section of sectionList) {
    if (!section || !section.content.trim()) continue;

    const indexedLines = buildIndexedLines(section, options?.resumeText);
    if (indexedLines.length === 0) continue;

    const lineOffsets = docLineOffsets || buildLineOffsets(section.content);
    const sectionId = (section as { sectionId?: string }).sectionId || 'projects';

    let currentTitle = '';
    let currentUrl: string | undefined = undefined;
    let currentDates: string | undefined = undefined;
    let currentTechStack: string[] = [];
    let currentBullets: string[] = [];
    let entryStart = indexedLines[0].docStart;
    let entryEnd = indexedLines[0].docEnd;

    const commitProject = () => {
      if (currentTitle || currentBullets.length > 0) {
        projectCount++;
        const entryId = `proj_entry_${projectCount}`;
        const origin = classifyProjectOrigin(currentTitle, currentBullets.join(' '));
        const maturity = detectProjectMaturity(currentBullets, origin);
        const projectSourceType: import('./evidenceModel').EvidenceSource =
          origin === 'ACADEMIC_PROJECT'
            ? 'ACADEMIC_PROJECT'
            : origin === 'HACKATHON_PROJECT'
              ? 'HACKATHON'
              : origin === 'OPEN_SOURCE_PROJECT'
                ? 'OPEN_SOURCE'
                : origin === 'CLIENT_PROJECT'
                  ? 'CLIENT_PROJECT'
                  : 'PERSONAL_PROJECT';
        const analyzedBullets = currentBullets.map((b) =>
          analyzeBullet(b, {
            sourceType: projectSourceType,
            environmentMaturity: maturity,
            roleOrProject: currentTitle || 'Technical Project',
            entryId,
            sectionType: 'projects',
            resumeText: options?.resumeText,
            searchHintStart: entryStart,
          })
        );

        const safeEnd = Math.max(entryStart, entryEnd);
        const locatorStartLine = docLineOffsets
          ? offsetToLineNumber(entryStart, lineOffsets)
          : offsetToLineNumber(Math.max(0, entryStart - section.charStart), lineOffsets);
        const locatorEndLine = docLineOffsets
          ? offsetToLineNumber(Math.max(entryStart, safeEnd - 1), lineOffsets)
          : offsetToLineNumber(Math.max(0, safeEnd - 1 - section.charStart), lineOffsets);

        const locator: SourceLocator = {
          documentId: options?.documentId,
          charStart: entryStart,
          charEnd: safeEnd,
          lineStart: locatorStartLine,
          lineEnd: locatorEndLine,
          sectionId,
          entryId,
        };

        const projectItem: ParsedProjectItem = {
          title: currentTitle || 'Technical Project',
          url: currentUrl,
          bullets: analyzedBullets,
          techStack: currentTechStack,
          charStart: entryStart,
          charEnd: safeEnd,

          id: entryId,
          projectName: currentTitle || 'Technical Project',
          projectDescription: currentBullets[0] || undefined,
          dates: currentDates,
          projectOrigin: origin,
          environmentMaturity: maturity,
          technologies: currentTechStack,
          evidenceRecords: [],
          parsingConfidence: currentTitle ? 0.9 : 0.7,
          locator,
        };

        projects.push(projectItem);
      }

      currentTitle = '';
      currentUrl = undefined;
      currentDates = undefined;
      currentTechStack = [];
      currentBullets = [];
    };

    for (let i = 0; i < indexedLines.length; i++) {
      const { text: line, docStart, docEnd } = indexedLines[i];
      const isBullet = /^[*\-•▪●]+\s+/.test(line) || /^\d+[.)]\s+/.test(line);
      const isTechStackLine = /^(?:tech\s*stack|technologies)\s*:/i.test(line);
      const nextLine = indexedLines[i + 1]?.text || '';
      const nextIsSubLine =
        /^[*\-•▪●]+\s+/.test(nextLine) ||
        /^(?:tech\s*stack|technologies)\s*:/i.test(nextLine);

      if (isTechStackLine) {
        const stackStr = line.split(':').slice(1).join(':') || '';
        currentTechStack = stackStr.split(',').map(s => s.trim()).filter(Boolean);
        entryEnd = docEnd;
      } else if (!isBullet && line.length < 95 && nextIsSubLine) {
        commitProject();
        entryStart = docStart;
        entryEnd = docEnd;

        const urlMatch = line.match(URL_REGEX);
        if (urlMatch) currentUrl = urlMatch[0];

        const dateMatch = line.match(DATE_REGEX);
        if (dateMatch) currentDates = dateMatch[0];

        const parts = line.split(/[|•–—]\s+/).map(p => p.trim());
        currentTitle = parts[0].replace(URL_REGEX, '').replace(DATE_REGEX, '').replace(/[|\-–—\s]+$/, '').trim();

        if (parts.length > 1) {
          for (let j = 1; j < parts.length; j++) {
            if (!parts[j].includes('http') && parts[j].includes(',')) {
              currentTechStack = parts[j].split(',').map(s => s.trim()).filter(Boolean);
            }
          }
        }
      } else if (isBullet) {
        if (!currentTitle && currentBullets.length === 0) {
          entryStart = docStart;
        }
        currentBullets.push(line);
        entryEnd = docEnd;
      } else {
        if (!currentTitle && currentBullets.length === 0) {
          entryStart = docStart;
        }
        currentBullets.push(line);
        entryEnd = docEnd;
      }
    }

    commitProject();
  }

  return projects;
}
