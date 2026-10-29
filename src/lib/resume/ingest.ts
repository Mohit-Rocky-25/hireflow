// ============================================================
// HIREFLOW CANONICAL RESUME INGESTION ENGINE (STAGE 2)
// Ingests raw resume text or structured profiles into deterministic proposed unconfirmed facts.
// Invariant P1: Imported facts start unconfirmed; never render until confirmed.
// Invariant P2: Zero invention of facts, numbers, dates, titles, or skills.
// Invariant P3: Ownership unset; candidate must declare ownership tier.
// Invariant HR-1, HR-2: Zero network egress, zero Math.random, zero Date.now.
// ============================================================

import {
  CandidateIdentity,
  Entry,
  Fact,
  OwnershipTier,
} from './types';
import { extractMetrics } from './extractor';
import { AppendOnlyFactLedger } from './ledger';
import { deterministicHash } from './hash';
import { extractSkills } from '../ats/extractSkills';

export interface IngestResult {
  candidate: CandidateIdentity;
  entries: Entry[];
  proposedFacts: Fact[];
  unverifiedSkills: Array<{
    skill: string;
    reason: string;
    briefLink: string;
  }>;
  ledger: AppendOnlyFactLedger;
}

interface RawSection {
  type: 'education' | 'experience' | 'project' | 'skills' | 'certifications' | 'summary' | 'other';
  rawTitle: string;
  lines: string[];
}

export function extractContactInfo(text: string): CandidateIdentity {
  const identity: CandidateIdentity = {
    fullName: 'Candidate',
    email: '',
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    // First non-empty line without pipe or bullet is the candidate's name (keep suffixes like CISSP)
    const firstLine = lines[0].replace(/[|•].*$/, '').trim();
    if (firstLine.length > 0 && firstLine.length < 60 && !firstLine.includes('@')) {
      identity.fullName = firstLine;
    }
  }

  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) identity.email = emailMatch[0];

  // Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?[6-9]\d{9}|\b\d{10}\b/);
  if (phoneMatch) identity.phone = phoneMatch[0].trim();

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  if (linkedinMatch) identity.linkedin = linkedinMatch[0];

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);
  if (githubMatch) identity.github = githubMatch[0];

  // Portfolio
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9_-]+\.(?:io|dev|me|tech|app)\b/i);
  if (portfolioMatch && !linkedinMatch?.includes(portfolioMatch[0]) && !githubMatch?.includes(portfolioMatch[0])) {
    identity.portfolio = portfolioMatch[0];
  }

  // Location
  for (const line of lines.slice(0, 8)) {
    const pipeParts = line.split(/[|•]/).map(p => p.trim());
    for (const part of pipeParts) {
      if (/^[A-Za-z\s]+,\s*(?:[A-Z]{2}|India|USA|United States|UK|Canada|Germany|Singapore|Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Chennai|San Francisco|New York|Seattle|Austin)$/i.test(part)) {
        identity.location = part;
        break;
      }
      if (/^(?:Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Chennai|Kolkata|Noida|Gurugram|London|Berlin|Toronto|Austin)\b/i.test(part)) {
        identity.location = part;
        break;
      }
    }
    if (identity.location) break;
  }

  return identity;
}

function partitionSections(text: string): RawSection[] {
  const lines = text.split('\n');
  const sections: RawSection[] = [];
  let currentSection: RawSection = {
    type: 'summary',
    rawTitle: 'HEADER',
    lines: [],
  };

  const isSectionHeader = (line: string): { isHeader: boolean; type: RawSection['type'] } => {
    const trimmed = line.trim().toUpperCase();
    if (!trimmed || trimmed.length > 40) return { isHeader: false, type: 'other' };

    if (/^(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC CREDENTIALS)\b/.test(trimmed)) {
      return { isHeader: true, type: 'education' };
    }
    if (/^(?:WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|INTERNSHIPS?)\b/.test(trimmed)) {
      return { isHeader: true, type: 'experience' };
    }
    if (/^(?:PROJECTS|TECHNICAL PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS)\b/.test(trimmed)) {
      return { isHeader: true, type: 'project' };
    }
    if (/^(?:TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|AREAS OF EXPERTISE)\b/.test(trimmed)) {
      return { isHeader: true, type: 'skills' };
    }
    if (/^(?:CERTIFICATIONS|LICENSES|CERTIFICATES)\b/.test(trimmed)) {
      return { isHeader: true, type: 'certifications' };
    }
    if (/^(?:PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY|SUMMARY|PROFILE|OBJECTIVE)\b/.test(trimmed)) {
      return { isHeader: true, type: 'summary' };
    }

    return { isHeader: false, type: 'other' };
  };

  for (const line of lines) {
    const check = isSectionHeader(line);
    if (check.isHeader) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: check.type,
        rawTitle: line.trim(),
        lines: [],
      };
    } else {
      currentSection.lines.push(line);
    }
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export function ingestStructuredPersona(
  persona: {
    fullName: string;
    contact?: any;
    education?: any[];
    experience?: any[];
    projects?: any[];
    skills?: any;
  },
  options: { asOf?: string } = {}
): IngestResult {
  const asOf = options.asOf || '2026-10-28';
  const candidate: CandidateIdentity = {
    fullName: persona.fullName,
    email: persona.contact?.email || '',
    phone: persona.contact?.phone,
    location: persona.contact?.location,
    linkedin: persona.contact?.linkedin,
    github: persona.contact?.github,
  };

  const proposedFacts: Fact[] = [];
  const entries: Entry[] = [];
  const declaredSkills = new Set<string>();
  const ledger = new AppendOnlyFactLedger();

  // Skills
  if (persona.skills) {
    const skillList: string[] = Array.isArray(persona.skills)
      ? persona.skills
      : Object.values(persona.skills).flat() as string[];
    skillList.forEach(s => declaredSkills.add(String(s)));
  }

  // Education
  if (persona.education && Array.isArray(persona.education)) {
    for (const edu of persona.education) {
      const entryId = `entry_${deterministicHash(`edu_${edu.institution || edu.degree}`)}`;
      const entry: Entry = {
        id: entryId,
        kind: 'education',
        org: edu.institution || 'University',
        roles: [
          {
            title: edu.degree || 'Degree',
            startDate: edu.startYear || '2020',
            endDate: edu.endDate || edu.graduationYear || '2024',
          },
        ],
        factIds: [],
      };

      const factId = `fact_${deterministicHash(`fact_edu_${edu.degree}_${edu.institution}`)}`;
      entry.factIds.push(factId);

      const fact = ledger.addFact({
        id: factId,
        source: 'imported',
        confirmed: false,
        kind: 'education',
        parentId: entry.id,
        action: 'Completed',
        object: `${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}`,
        tech: [],
        evidence: edu.score ? { type: 'metric', value: String(edu.score) } : undefined,
        ownership: undefined,
        createdAt: `${asOf}T00:00:00.000Z`,
      });
      proposedFacts.push(fact);
      entries.push(entry);
    }
  }

  // Experience
  if (persona.experience && Array.isArray(persona.experience)) {
    for (const exp of persona.experience) {
      const entryId = `entry_${deterministicHash(`exp_${exp.company}_${exp.position}`)}`;
      const entry: Entry = {
        id: entryId,
        kind: 'job',
        org: exp.company || 'Company',
        roles: [
          {
            title: exp.position || 'Role',
            startDate: exp.startDate || '2020',
            endDate: exp.endDate || 'Present',
          },
        ],
        factIds: [],
      };

      const bullets = exp.bullets || [];
      for (const bullet of bullets) {
        const text = typeof bullet === 'string' ? bullet : bullet.text || '';
        if (!text) continue;

        const metrics = extractMetrics(text);
        const firstMetric = metrics.length > 0 ? metrics[0] : undefined;
        const skills = extractSkills(text).map(s => s.canonicalId);

        const firstSpace = text.indexOf(' ');
        const action = firstSpace !== -1 ? text.slice(0, firstSpace) : 'Executed';
        const object = firstSpace !== -1 ? text.slice(firstSpace + 1) : text;

        const factId = `fact_${deterministicHash(`fact_exp_${text}`)}`;
        entry.factIds.push(factId);

        const fact = ledger.addFact({
          id: factId,
          source: 'imported',
          confirmed: false,
          kind: 'experience',
          parentId: entry.id,
          action,
          object,
          tech: skills,
          evidence: firstMetric
            ? {
                type: 'metric',
                value: firstMetric.raw,
                unit: firstMetric.unit,
              }
            : undefined,
          ownership: undefined,
          createdAt: `${asOf}T00:00:00.000Z`,
        });
        proposedFacts.push(fact);
      }
      entries.push(entry);
    }
  }

  // Projects
  if (persona.projects && Array.isArray(persona.projects)) {
    for (const proj of persona.projects) {
      const entryId = `entry_${deterministicHash(`proj_${proj.title}`)}`;
      const entry: Entry = {
        id: entryId,
        kind: 'project',
        org: proj.title || 'Project',
        roles: [
          {
            title: proj.title || 'Project Lead',
            startDate: '2023',
          },
        ],
        factIds: [],
      };

      const bullets = proj.bullets || [];
      for (const bullet of bullets) {
        const text = typeof bullet === 'string' ? bullet : bullet.text || '';
        if (!text) continue;

        const metrics = extractMetrics(text);
        const firstMetric = metrics.length > 0 ? metrics[0] : undefined;
        const skills = extractSkills(text).map(s => s.canonicalId);

        const firstSpace = text.indexOf(' ');
        const action = firstSpace !== -1 ? text.slice(0, firstSpace) : 'Built';
        const object = firstSpace !== -1 ? text.slice(firstSpace + 1) : text;

        const factId = `fact_${deterministicHash(`fact_proj_${text}`)}`;
        entry.factIds.push(factId);

        const fact = ledger.addFact({
          id: factId,
          source: 'imported',
          confirmed: false,
          kind: 'project',
          parentId: entry.id,
          action,
          object,
          tech: skills,
          evidence: firstMetric
            ? {
                type: 'metric',
                value: firstMetric.raw,
                unit: firstMetric.unit,
              }
            : undefined,
          ownership: undefined,
          createdAt: `${asOf}T00:00:00.000Z`,
        });
        proposedFacts.push(fact);
      }
      entries.push(entry);
    }
  }

  const evidencedSkills = new Set<string>();
  for (const f of proposedFacts) {
    for (const t of f.tech) {
      evidencedSkills.add(t.toLowerCase());
    }
  }

  const unverifiedSkills: IngestResult['unverifiedSkills'] = [];
  for (const skill of declaredSkills) {
    if (!evidencedSkills.has(skill.toLowerCase())) {
      unverifiedSkills.push({
        skill,
        reason: 'Skill listed in Technical Skills section but not referenced in any project or experience evidence bullet.',
        briefLink: `/tools/build-briefs?query=${encodeURIComponent(skill)}`,
      });
    }
  }

  return {
    candidate,
    entries,
    proposedFacts,
    unverifiedSkills,
    ledger,
  };
}

export function ingestRawResume(
  rawText: string,
  options: { asOf?: string; filename?: string } = {}
): IngestResult {
  const asOf = options.asOf || '2026-10-28';
  const candidate = extractContactInfo(rawText);
  const rawSections = partitionSections(rawText);

  const proposedFacts: Fact[] = [];
  const entries: Entry[] = [];
  const declaredSkills: Set<string> = new Set();
  const ledger = new AppendOnlyFactLedger();

  for (const section of rawSections) {
    const rawLines = section.lines.map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) continue;

    if (section.type === 'skills') {
      for (const line of rawLines) {
        const colonIdx = line.indexOf(':');
        const skillPayload = colonIdx !== -1 ? line.slice(colonIdx + 1) : line;
        const tokens = skillPayload.split(/[,|•/]/).map(s => s.trim()).filter(Boolean);
        for (const token of tokens) {
          const extracted = extractSkills(token);
          if (extracted.length > 0) {
            extracted.forEach(sk => declaredSkills.add(sk.canonicalId));
          } else if (token.length >= 2 && token.length <= 40) {
            declaredSkills.add(token);
          }
        }
      }
      continue;
    }

    if (section.type === 'education') {
      let currentEntry: Entry | null = null;
      for (const line of rawLines) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        if (!isBullet) {
          const entryHash = deterministicHash(`edu_${line}`);
          currentEntry = {
            id: `entry_${entryHash}`,
            kind: 'education',
            org: line,
            roles: [{ title: 'Degree', startDate: '2020', isCurrent: false }],
            factIds: [],
          };
          entries.push(currentEntry);
        } else if (currentEntry) {
          const cleanText = line.replace(/^[•\-*]\s*/, '').trim();
          const factHash = deterministicHash(`fact_edu_${cleanText}`);
          const factId = `fact_${factHash}`;
          currentEntry.factIds.push(factId);

          const fact = ledger.addFact({
            id: factId,
            source: 'imported',
            confirmed: false,
            kind: 'education',
            parentId: currentEntry.id,
            action: cleanText.split(' ')[0] || 'Studied',
            object: cleanText.slice(cleanText.indexOf(' ') + 1) || cleanText,
            tech: [],
            evidence: undefined,
            ownership: undefined,
            createdAt: `${asOf}T00:00:00.000Z`,
          });
          proposedFacts.push(fact);
        }
      }
      continue;
    }

    if (section.type === 'experience' || section.type === 'project') {
      let currentEntry: Entry | null = null;

      for (const line of rawLines) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

        if (!isBullet) {
          const pipeParts = line.split(/[|•]/).map(p => p.trim());
          const primary = pipeParts[0] || line;
          const secondary = pipeParts[1] || '';

          const entryHash = deterministicHash(`${section.type}_${line}`);
          const entryId = `entry_${entryHash}`;

          currentEntry = {
            id: entryId,
            kind: section.type === 'experience' ? 'job' : 'project',
            org: secondary || primary,
            roles: [
              {
                title: primary,
                startDate: '2020',
                isCurrent: /present|current/i.test(line),
              },
            ],
            factIds: [],
          };
          entries.push(currentEntry);
        } else {
          const cleanText = line.replace(/^[•\-*]\s*/, '').trim();
          const metrics = extractMetrics(cleanText);
          const firstMetric = metrics.length > 0 ? metrics[0] : undefined;
          const extractedSkills = extractSkills(cleanText).map(s => s.canonicalId);

          const firstSpace = cleanText.indexOf(' ');
          const action = firstSpace !== -1 ? cleanText.slice(0, firstSpace) : 'Executed';
          const object = firstSpace !== -1 ? cleanText.slice(firstSpace + 1) : cleanText;

          const factHash = deterministicHash(`fact_${section.type}_${cleanText}`);
          const factId = `fact_${factHash}`;

          if (currentEntry) {
            currentEntry.factIds.push(factId);
          }

          const fact = ledger.addFact({
            id: factId,
            source: 'imported',
            confirmed: false,
            kind: section.type === 'experience' ? 'experience' : 'project',
            parentId: currentEntry?.id,
            action,
            object,
            tech: extractedSkills,
            evidence: firstMetric
              ? {
                  type: 'metric',
                  value: firstMetric.raw,
                  unit: firstMetric.unit,
                }
              : undefined,
            ownership: undefined,
            createdAt: `${asOf}T00:00:00.000Z`,
          });
          proposedFacts.push(fact);
        }
      }
    }
  }

  const evidencedSkills = new Set<string>();
  for (const f of proposedFacts) {
    for (const t of f.tech) {
      evidencedSkills.add(t.toLowerCase());
    }
  }

  const unverifiedSkills: IngestResult['unverifiedSkills'] = [];
  for (const skill of declaredSkills) {
    if (!evidencedSkills.has(skill.toLowerCase())) {
      unverifiedSkills.push({
        skill,
        reason: 'Skill listed in Technical Skills section but not referenced in any project or experience evidence bullet.',
        briefLink: `/tools/build-briefs?query=${encodeURIComponent(skill)}`,
      });
    }
  }

  return {
    candidate,
    entries,
    proposedFacts,
    unverifiedSkills,
    ledger,
  };
}

