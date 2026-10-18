// ============================================================
// HireFlow v3 — Immutable LayoutTree & Multi-Target Exporter (R6.8, R6.10, R6.11)
// Single source of truth feeding HTML Preview, TXT, and DOCX
// ============================================================

import { LayoutNode, LayoutTree, TailorVariant } from './types';
import { ResumeFactLedger } from '../ledger/types';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';

const FRESHER_SECTION_ORDER = [
  'Education',
  'Technical Skills',
  'Technical Projects',
  'Internships & Experience',
  'Certifications',
  'Achievements & Positions of Responsibility',
];

const EXPERIENCE_SECTION_ORDER = [
  'Work Experience',
  'Technical Projects',
  'Technical Skills',
  'Education',
  'Certifications',
  'Achievements',
];

/**
 * Builds an immutable LayoutTree from candidate ledger and optional variant operations.
 * Pure function; base ledger is never mutated.
 */
export function buildLayoutTree(
  ledger: ResumeFactLedger,
  variant?: TailorVariant,
  pageSize: 'A4' | 'Letter' = 'A4'
): LayoutTree {
  const isFresher = ledger.internships.length <= 1;
  const strategy = isFresher ? 'fresher_education_first' : 'experience_first';
  const strategyReason = isFresher
    ? 'Fresher Strategy: Academic credentials, core degree, and CGPA lead the resume for campus recruiters.'
    : 'Experience-Led Strategy: Demonstrated production impact and employment history take precedence.';

  const sectionOrder = variant?.sectionOrder || (isFresher ? FRESHER_SECTION_ORDER : EXPERIENCE_SECTION_ORDER);
  const archivedIds = variant?.archivedNodeIds || new Set<string>();
  const customBullets = variant?.customBullets || new Map<string, string>();

  const nodes: LayoutNode[] = [];

  // 1. Header & Contact
  const candidateName = 'Engineering Candidate';
  nodes.push({
    id: 'header_name',
    type: 'header',
    text: candidateName,
  });

  const contactParts: string[] = [];
  if (ledger.codingProfiles.length > 0) {
    contactParts.push(ledger.codingProfiles.map((p: any) => `${p.platform}: ${p.url}`).join(' | '));
  }
  if (ledger.links.length > 0) {
    contactParts.push(ledger.links.map((l: any) => l.url).join(' | '));
  }
  if (contactParts.length > 0) {
    nodes.push({
      id: 'header_contact',
      type: 'contact',
      text: contactParts.join(' | '),
    });
  }

  // 2. Build Sections by Configured Order
  sectionOrder.forEach((secTitle: string) => {
    const secLower = secTitle.toLowerCase();

    if (secLower.includes('education')) {
      if (ledger.education.length > 0) {
        nodes.push({ id: 'sec_edu', type: 'section_title', text: 'EDUCATION' });
        ledger.education.forEach((edu: any, idx: number) => {
          const entryId = `edu_${idx}`;
          const isArchived = archivedIds.has(entryId);
          const degreeLine = `${edu.degree} in ${edu.branch} — ${edu.institute}`;
          const cgpaStr = typeof edu.cgpa === 'object' && edu.cgpa !== null ? `${edu.cgpa.value}/${edu.cgpa.scale}` : edu.cgpa;
          const yearCgpa = [
            edu.endYear ? `Graduation: ${edu.endYear}` : null,
            cgpaStr ? `CGPA: ${cgpaStr}` : null,
            edu.percentage ? `Aggregate: ${edu.percentage}%` : null,
          ].filter(Boolean).join(' | ');

          nodes.push({
            id: entryId,
            type: 'entry_header',
            text: degreeLine,
            sourceLedgerId: entryId,
            isArchived,
          });
          if (yearCgpa) {
            nodes.push({
              id: `${entryId}_sub`,
              type: 'entry_sub',
              text: yearCgpa,
              sourceLedgerId: entryId,
              isArchived,
            });
          }
        });
      }
    } else if (secLower.includes('skill')) {
      if (ledger.skills.length > 0) {
        nodes.push({ id: 'sec_skills', type: 'section_title', text: 'TECHNICAL SKILLS' });
        const skillsLine = ledger.skills.map((s: any) => typeof s === 'string' ? s : s.displayName || s.skillId).join(', ');
        nodes.push({
          id: 'skills_list',
          type: 'bullet',
          text: `Technologies & Languages: ${skillsLine}`,
          sourceLedgerId: 'skills_list',
          isArchived: archivedIds.has('skills_list'),
        });
      }
    } else if (secLower.includes('project')) {
      if (ledger.projects.length > 0) {
        nodes.push({ id: 'sec_projects', type: 'section_title', text: 'TECHNICAL PROJECTS' });
        ledger.projects.forEach((proj: any, pIdx: number) => {
          const projId = `proj_${pIdx}`;
          const isProjArchived = archivedIds.has(projId);
          nodes.push({
            id: projId,
            type: 'entry_header',
            text: proj.name,
            sourceLedgerId: projId,
            isArchived: isProjArchived,
          });
          if (proj.techStack && proj.techStack.length > 0) {
            nodes.push({
              id: `${projId}_stack`,
              type: 'entry_sub',
              text: `Technologies: ${proj.techStack.join(', ')}`,
              sourceLedgerId: projId,
              isArchived: isProjArchived,
            });
          }
          proj.bullets?.forEach((bullet: string, bIdx: number) => {
            const bulletId = `${projId}_b_${bIdx}`;
            const activeText = customBullets.get(bulletId) || bullet;
            nodes.push({
              id: bulletId,
              type: 'bullet',
              text: activeText,
              sourceLedgerId: bulletId,
              isArchived: isProjArchived || archivedIds.has(bulletId),
            });
          });
        });
      }
    } else if (secLower.includes('intern') || secLower.includes('experience')) {
      if (ledger.internships.length > 0) {
        nodes.push({ id: 'sec_exp', type: 'section_title', text: 'EXPERIENCE' });
        ledger.internships.forEach((intern: any, iIdx: number) => {
          const internId = `intern_${iIdx}`;
          const isInternArchived = archivedIds.has(internId);
          const comp = intern.org || intern.company;
          nodes.push({
            id: internId,
            type: 'entry_header',
            text: `${intern.role} — ${comp}`,
            sourceLedgerId: internId,
            isArchived: isInternArchived,
          });
          intern.bullets?.forEach((bullet: string, bIdx: number) => {
            const bulletId = `${internId}_b_${bIdx}`;
            const activeText = customBullets.get(bulletId) || bullet;
            nodes.push({
              id: bulletId,
              type: 'bullet',
              text: activeText,
              sourceLedgerId: bulletId,
              isArchived: isInternArchived || archivedIds.has(bulletId),
            });
          });
        });
      }
    } else if (secLower.includes('cert')) {
      if (ledger.certifications.length > 0) {
        nodes.push({ id: 'sec_certs', type: 'section_title', text: 'CERTIFICATIONS' });
        ledger.certifications.forEach((cert: any, cIdx: number) => {
          const certId = `cert_${cIdx}`;
          nodes.push({
            id: certId,
            type: 'bullet',
            text: `${cert.name} — ${cert.issuer}${cert.year ? ` (${cert.year})` : ''}`,
            sourceLedgerId: certId,
            isArchived: archivedIds.has(certId),
          });
        });
      }
    } else if (secLower.includes('achieve') || secLower.includes('responsib')) {
      const items = [...ledger.achievements, ...ledger.positionsOfResponsibility];
      if (items.length > 0) {
        nodes.push({ id: 'sec_achieve', type: 'section_title', text: 'ACHIEVEMENTS' });
        items.forEach((item: any, aIdx: number) => {
          const achId = `ach_${aIdx}`;
          const text = typeof item === 'string' ? item : item.title || item.role || '';
          nodes.push({
            id: achId,
            type: 'bullet',
            text,
            sourceLedgerId: achId,
            isArchived: archivedIds.has(achId),
          });
        });
      }
    }
  });

  const visibleNodes = nodes.filter((n) => !n.isArchived);
  const totalWords = visibleNodes
    .map((n) => n.text)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const estimatedPages = Math.max(1, Math.ceil(totalWords / 450));
  const hasOverflowWarning = totalWords > 650;

  return {
    pageSize,
    strategy,
    strategyReason,
    nodes,
    totalWords,
    estimatedPages,
    hasOverflowWarning,
  };
}

/**
 * Normalizes text lines for strict content parity verification.
 */
export function normalizeExportText(text: string): string {
  return text
    .replace(/[=•*►›—–-]/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Renders LayoutTree to plain text representation.
 */
export function renderLayoutTreeToPlainText(tree: LayoutTree): string {
  const visible = tree.nodes.filter((n) => !n.isArchived);
  const lines: string[] = [];

  visible.forEach((node) => {
    if (node.type === 'header') {
      lines.push(node.text.toUpperCase());
    } else if (node.type === 'section_title') {
      lines.push('');
      lines.push(`=== ${node.text} ===`);
    } else if (node.type === 'bullet') {
      lines.push(`• ${node.text}`);
    } else {
      lines.push(node.text);
    }
  });

  return lines.join('\n').trim();
}

/**
 * Renders LayoutTree to clean semantic HTML.
 */
export function renderLayoutTreeToHtml(tree: LayoutTree): string {
  const visible = tree.nodes.filter((n) => !n.isArchived);
  const htmlParts: string[] = [
    `<div class="resume-sheet ${tree.pageSize.toLowerCase()}-sheet" style="font-family: sans-serif; line-height: 1.4;">`,
  ];

  visible.forEach((node) => {
    if (node.type === 'header') {
      htmlParts.push(`<h1 style="font-size: 20px; font-weight: bold; margin: 0 0 6px;">${escapeHtml(node.text)}</h1>`);
    } else if (node.type === 'contact') {
      htmlParts.push(`<div style="font-size: 12px; color: #555; margin-bottom: 12px;">${escapeHtml(node.text)}</div>`);
    } else if (node.type === 'section_title') {
      htmlParts.push(`<h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; margin: 12px 0 6px; text-transform: uppercase;">${escapeHtml(node.text)}</h2>`);
    } else if (node.type === 'entry_header') {
      htmlParts.push(`<div style="font-size: 13px; font-weight: 600; margin-top: 6px;">${escapeHtml(node.text)}</div>`);
    } else if (node.type === 'entry_sub') {
      htmlParts.push(`<div style="font-size: 12px; color: #666; font-style: italic;">${escapeHtml(node.text)}</div>`);
    } else if (node.type === 'bullet') {
      htmlParts.push(`<div style="font-size: 12px; margin-left: 14px; margin-top: 2px;">• ${escapeHtml(node.text)}</div>`);
    }
  });

  htmlParts.push('</div>');
  return htmlParts.join('\n');
}

/**
 * Generates an immutable DOCX file buffer from LayoutTree using the 'docx' package.
 */
export async function generateDocxFromLayoutTree(tree: LayoutTree): Promise<Buffer> {
  const visible = tree.nodes.filter((n) => !n.isArchived);
  const paragraphs: Paragraph[] = [];

  visible.forEach((node) => {
    if (node.type === 'header') {
      paragraphs.push(
        new Paragraph({
          text: node.text,
          heading: HeadingLevel.TITLE,
          spacing: { after: 120 },
        })
      );
    } else if (node.type === 'contact') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: node.text, size: 20, color: '555555' })],
          spacing: { after: 200 },
        })
      );
    } else if (node.type === 'section_title') {
      paragraphs.push(
        new Paragraph({
          text: node.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 100 },
        })
      );
    } else if (node.type === 'entry_header') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: node.text, bold: true, size: 22 })],
          spacing: { before: 120, after: 40 },
        })
      );
    } else if (node.type === 'entry_sub') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: node.text, italics: true, size: 20, color: '444444' })],
          spacing: { after: 80 },
        })
      );
    } else if (node.type === 'bullet') {
      paragraphs.push(
        new Paragraph({
          text: `• ${node.text}`,
          spacing: { after: 60 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Guarantees zero silent loss (R6.11).
 * Returns all ledger items omitted from active variant for the Archived drawer.
 */
export function getArchivedItems(
  ledger: ResumeFactLedger,
  variant?: TailorVariant
): { id: string; category: string; title: string; originalText: string }[] {
  if (!variant || variant.archivedNodeIds.size === 0) return [];

  const tree = buildLayoutTree(ledger);
  const archived: { id: string; category: string; title: string; originalText: string }[] = [];

  tree.nodes.forEach((node) => {
    if (variant.archivedNodeIds.has(node.id)) {
      archived.push({
        id: node.id,
        category: node.type,
        title: node.text.slice(0, 40),
        originalText: node.text,
      });
    }
  });

  return archived;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
